(function recibirMensaje(d, io){

	'use strict';

	var io = io();

	var chat = d.querySelector('#chat');
	var chatForm = d.querySelector('#chat-form');
	var chatMessage = d.querySelector('#input-mensaje');
	var usuario = d.querySelector('#input-usuario');
	var lobby = d.querySelector('#lobby');

	//funcion utilitaria para agregar los mensajes

	function mensajeChat(d, usuario, mensaje){
		var nombre = d.querySelector('#input-usuario').value;
		var clase = '';
		if(nombre == usuario){
			clase = 'my-message';
		}else{
			clase = 'another-message';
		}
		var contenido = '<div class="'+clase+'">';
			contenido +='<div class="mensaje '+clase+'-msj">'
			contenido+= '<span name=usuario>'+usuario+'</span><br/>';
			contenido+= '<span name=mensaje>'+mensaje+'</span>';
			contenido+= '</div></div>';
		d.querySelector('#chat').insertAdjacentHTML('beforeend','<br/>' + contenido);

	}

	//funcion para asignar un nombre de usuario desconocido

	io.on('set usuario', (data)=>{
		usuario.value = data.usuario;
	});

	//funcion para enviar el mensaje

	chatForm.onsubmit = function(e){
		e.preventDefault();
		io.emit('enviar mensaje', {
			mensaje: chatMessage.value,
			usuario: usuario.value
		});
		mensajeChat(d,usuario.value, chatMessage.value);
		chat.scrollTop = chat.scrollHeight;
		chatMessage.value = '';


	}

	//funcion para agregar los mensajes recibidos al chat

	io.on('recibir mensaje', (data) => {
		mensajeChat(d, data.usuario, data.mensaje);
		chat.scrollTop = chat.scrollHeight;
	})

	//funcion para agregar a los usuarios conectados en el chat

	io.on('add usuarios lobby', (data)=>{
		lobby.value=null;
		for(var i=0; i<data.usuarios.length; i++){

			const spanUsuarios= '<div id="usu-'+data.usuarios[i].id+'">'+data.usuarios[i].usuario+'</div>';
			lobby.insertAdjacentHTML('beforeend', spanUsuarios);
		}
	});

	//funcion para agregar a los usuarios que se van conectando al chat

	io.on('add usuario lobby', (data)=>{
		lobby.innerHTML += '<div id="usu-'+data.id+'">'+data.usuario+'</div>';
		
	});

	//funcion para eliminar de los usuarios conectados a aquellos que se desconectan

	io.on('eliminar usuario', (data) => {
		var usuarioEliminado = d.querySelector('#usu-'+data.id);
		lobby.removeChild(usuarioEliminado);
	});
})(document,io)