'use strict';

const express = require('express'),
	app = express(),
	http = require('http').createServer(app),
	fs = require('fs'),
	io = require('socket.io')(http),
	port = process.env.PORT || 3000,
	dirStatic = express.static(`${__dirname}/public`);

let id = 1;

let connectedUsers = new Array();

app.use(dirStatic);

http.listen(port, ()=>console.log('Servidor levantado en http://localhost:%d',port))

const room1 = io.of('/room1');

/*room1.on('connection',(socket)=>{
	console.log("someone connect to room1");
	console.log("---------------");
});*/

io.on('connection', (socket)=>{

	const usuarioId=id;

	let usuario = `unknow#${usuarioId}`;

	socket.emit('set usuario', {
		usuario: usuario
	});
	
	socket.emit('add usuarios lobby', {
		usuarios: connectedUsers
	});

	connectedUsers.push({
		usuario: usuario,
		id: usuarioId
	});

	
	socket.broadcast.emit('add usuario lobby', {
		usuario: usuario,
		id: usuarioId
	});

	socket.on('enviar mensaje', (data)=>{
		socket.broadcast.emit('recibir mensaje', {
			mensaje:data.mensaje,
			usuario:data.usuario
		});
	});

	socket.on('disconnect', ()=>{
		const index = () =>{
			for(let i=0; i<connectedUsers.length; i++){
				if(connectedUsers[i].usuario==usuario && connectedUsers[i].id==usuarioId){
					return i;
				}
			}
			return -1;
		}
		if(index()>-1){
			connectedUsers.splice(index(), 1);
			socket.broadcast.emit('eliminar usuario',{
				id: usuarioId
			});
		}
	});

	id++;
});