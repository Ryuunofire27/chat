'use strict';

const express = require('express'),
	app = express(),
	http = require('http').createServer(app),
	io = require('socket.io')(http),
	port = process.env.PORT || 3000,
	dirStatic = express.static(`${__dirname}/public`);

let id = 1;
let usuarioID = 1;

let rooms = [
  {
    id: 1,
    userMaster: '',
    name: 'Sala 1',
    pssw: '',
    connectedUsers: []
  },
  {
    id: 2,
    userMaster: '',
    name: 'Sala 2',
    pssw: 'charlie',
    connectedUsers: []
  }
];

let roomsId = 3;

app.use(dirStatic);
http.listen(port, ()=>console.log('Servidor levantado en http://localhost:%d',port));

function exit(socket, room,usuario, usuarioId, roomPath){
  if (room) {
    const index = rooms.findIndex((o) => {
      return o.id == room.id;
    });

    if (index > -1) {
      if(rooms[index].connectedUsers.length===1){
        deleteRoom(io,index);
      }else{
        const index2 = rooms[index].connectedUsers.findIndex((o) => {
          return o.usuario == usuario && o.id == usuarioId
        });
        rooms[index].connectedUsers.splice(index2, 1);
        socket.in(roomPath).emit('eliminar usuario', {
          id: usuarioId
        });
      }
    }
    room = null;
  }
}

function deleteRoom(socket, index, room){
  rooms.splice(index,1);
  socket.broadcast.emit('delete room', room);
}

const cha = io.of('/cha');

cha.on('connection', (socket)=>{

  console.log('alguien se ha conectado');

	const usuarioId=usuarioID;
	let room=null;
	let roomPath;
  let isMain = true;

	let usuario = '';

	if(room===null){
	  roomPath=null;
  }

	if(isMain){
	  socket.emit('rooms',rooms);
	  isMain = false;
  }

	socket.on('join', data=>{
    room = data.room;
    roomPath = `/rooms_${room.id}`;
    socket.join(roomPath);

    socket.emit('enter room', room);
  });

	socket.on('create room', data => {
	   usuario=data.username;
     const newRoom = {
       id: roomsId,
       userMaster: usuario,
       name: data.name,
       pssw: data.pssw,
       connectedUsers: [{
         usuario: usuario,
         id: usuarioId
       }]
     };
	   rooms.push(newRoom);
	   console.log(rooms);
     roomsId++;
     room = newRoom;
     roomPath = `/rooms_${room.id}`;
     socket.join(roomPath);
     socket.broadcast.emit('new room', newRoom);
     socket.emit('create room', newRoom);
     socket.emit('set usuario', {
       usuario: usuario
     });
     usuarioID++;
  });

	socket.on('has password', (data, cb )=>{

    const index = rooms.findIndex((o)=>{
      return o.id == data;
    });
    if(index>-1){
      rooms[index].pssw === '' ? cb(false) : cb(true);
    }
  });

	socket.on('confirm pssw',(data,cb)=>{
    const index = rooms.findIndex((o)=>{
      return o.id == data.id;
    });
    if(index>-1){
      rooms[index].pssw === data.pssw ? cb(true):cb(false);
    }
  });

	socket.on('existe usuario', (username, cb)=>{
	  let index = rooms.findIndex((o)=>{
	    return o.id == room.id;
    });
		if(index>-1){
		  let index2 = rooms[index].connectedUsers.findIndex((o)=>{
		    return o.usuario===username;
      });
		  if(index2>-1){
		    cb(true);
      }else{
        usuario = username;

        socket.emit('set usuario', {
          usuario: usuario
        });

        socket.emit('add usuarios lobby', {
          usuarios: rooms[index].connectedUsers
        });

        socket.in(roomPath).emit('add usuario lobby', {
          usuario: usuario,
          id: usuarioId
        });
        usuarioID++;

        rooms[index].connectedUsers.push({
          usuario: usuario,
          id: usuarioId
        });
        cb(false);
      }
		}
	});

	socket.on('enviar imagen',(imagen)=>{
		var mensaje = '';
		//mensaje += '<a href="'+imagen.url+'" target="_blank"><img class="thumb" src="'+imagen.url+'" title="'+imagen.nombre+'"/></a>'
		cha.broadcast.emit('recibir imagenes',{
			imagen: imagen,
			usuario: usuario
		})
	});

	socket.on('enviar mensaje', (data)=>{
		socket.in(roomPath).emit('recibir mensaje', {
			mensaje:data.mensaje,
			usuario:data.usuario
		});
	});

	socket.on('close room', (data)=>{
    socket.in(roomPath).emit('close room');
    const index = rooms.findIndex((o) => {
      return o.id == room.id;
    });
    if(index>-1){
      deleteRoom(socket,index, room);
    }
  });

	socket.on('exit', ()=>{
	  console.log('Alguien esta saliendo de la sala');
	  exit(socket,room, usuario, usuarioId, roomPath);
  });

	socket.on('disconnect', ()=> {
	  console.log('alguien se esta desconectando');
    exit(socket,room, usuario, usuarioId, roomPath);
	});

});