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

	//let usuario = `unknow#${usuarioId}`;

	let isRegister = false;

	let usuario = '';

	socket.on('existe usuario', (username, cb)=>{
		let index = connectedUsers.findIndex((o)=>{
			return o.usuario==username;
		});
		if(index>-1){
			cb(false);
		}else{
			usuario = username;

			socket.emit('set usuario', {
				usuario: usuario
			});
			
			socket.emit('add usuarios lobby', {
				usuarios: connectedUsers
			});
			
			socket.broadcast.emit('add usuario lobby', {
				usuario: usuario,
				id: usuarioId
			});
			id++;

			connectedUsers.push({
				usuario: usuario,
				id: usuarioId
			})
			cb(true);
		}
	})

	socket.on('enviar imagen',(imagen)=>{
		var mensaje = '';
		//mensaje += '<a href="'+imagen.url+'" target="_blank"><img class="thumb" src="'+imagen.url+'" title="'+imagen.nombre+'"/></a>'
		socket.broadcast.emit('recibir imagenes',{
			imagen: imagen,
			usuario: usuario
		})
	});

	socket.on('enviar mensaje', (data)=>{
		socket.broadcast.emit('recibir mensaje', {
			mensaje:data.mensaje,
			usuario:data.usuario
		});
	});

	socket.on('disconnect', ()=>{
		const index = connectedUsers.findIndex((o)=>{
			return o.usuario==usuario && o.id == usuarioId
		});
		if(index>-1){
			connectedUsers.splice(index, 1);
			socket.broadcast.emit('eliminar usuario',{
				id: usuarioId
			});
		}
	});

});