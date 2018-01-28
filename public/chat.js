(function recibirMensaje(d, io){

	'use strict';

	var io = io();
	var register = d.querySelector('#user-register');
	var registerForm = d.querySelector('#register-form');
	var registerSpan = d.querySelector('#register-span');
	var registerUsername = d.querySelector('#register-username');
	var chat = d.querySelector('#chat');
	var chatMessages = d.querySelector('#chat-messages');
	var chatForm = d.querySelector('#chat-form');
	var chatMessage = d.querySelector('#input-mensaje');
	var usuario = d.querySelector('#input-usuario');
	var connectedUsers = d.querySelector('#connected-users');
	var imgUpload = d.querySelector('#img-upload');
	var img = d.querySelector('#img');
	var imgs = d.getElementsByClassName('thumb');
	//var imagenesArray = new Array();
	var imagen = new Object();


	registerForm.onsubmit = function(e){

		e.preventDefault();
		var existe = false;
		var username = registerUsername.value;
		if(username!=''){
			io.emit('existe usuario', username,  function (cbValue){
				if(cbValue){
					register.classList.remove("display-flex");
					register.classList.add("display-none");
					chat.classList.remove("display-none");
					io.emit('add user', username);
				}else{
					registerSpan.innerHTML = "El usuario \"" + username + "\" ya existe";
					registerUsername.value = null;
				}
			});
		}
		
	}

	imgUpload.onchange = function(e){
		var files = e.target.files; 
	    for (var i = 0, f; f = files[i]; i++) {

	      // Only process image files.
		    if (!f.type.match('image.*')) {
		      continue;
		    }

		    var reader = new FileReader();

		    // Closure to capture the file information.
		    reader.onload = (function(theFile) {
		        return function(e) {
		        	var url = e.target.result;
		        	/*imagenesArray.push({
		        		imagen:e.target.result,
		        		nombre:theFile.name
		        	});*/
		        	imagen = {
		        		url: url,
		        		nombre: theFile.name
		        	}
		        	//io.emit('enviar imagen',e.target.result);
		       		// Render thumbnail.
		       		var span = d.createElement('span');
		       		span.innerHTML = ['<a href="',url,'" target="_blank"><img class="thumb" src="',url,'" title="', escape(theFile.name), '"/></a>'].join('');
		       		d.querySelector('#img').insertBefore(span, null);
		        };
		    })(f);

	        // Read in the image file as a data URL.
	        reader.readAsDataURL(f);
	    }
	}

	//funcion para asignar un nombre de usuario desconocido

	io.on('set usuario', (data)=>{
		usuario.value = data.usuario;
	});

	//funcion para enviar el mensaje

	chatForm.onsubmit = function(e){
		e.preventDefault();
		if(img.hasChildNodes()){
			io.emit('enviar imagen', imagen);
			mensajeChat(d,usuario.value, imagen);
			img.innerHTML='';
		}else{
			if(chatMessage.value!=''){
				io.emit('enviar mensaje', {
					mensaje: chatMessage.value,
					usuario: usuario.value
				});
				mensajeChat(d,usuario.value, chatMessage.value);
				chatMessages.scrollTop = chat.scrollHeight;
				chatMessage.value = '';
			}
		}

	}



	//funcion para agregar los mensajes recibidos al chat

	io.on('recibir mensaje', (data) => {
		mensajeChat(d, data.usuario, data.mensaje);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	})

	//funcion utilitaria para agregar los mensajes

	function mensajeChat(d, usuarioI, mensaje){
		var clase = '';
		if(usuario.value == usuarioI){
			clase = 'my-message';
		}else{
			clase = 'another-message';
		}
		var contenido = '<div class="'+clase+'">';
			contenido +='<div class="mensaje '+clase+'-msj">'
			contenido+= '<span name=usuario>'+usuarioI+'</span><br/>';
			if(mensaje.url){
				contenido += '<a href="'+mensaje.url+'" target="_blank"><img class="thumb" src="'+mensaje.url+'" title="'+mensaje.nombre+'"/></a>'
			}else{
				contenido+= '<span name=mensaje>'+mensaje+'</span>';
			}
			contenido+= '</div></div>';
		chatMessages.insertAdjacentHTML('beforeend','<br/>' + contenido);

	}

	io.on('recibir imagenes', data => {
		mensajeChat(d,data.usuario, data.imagen);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	});

	//funcion para agregar a los usuarios conectados en el chat

	io.on('add usuarios lobby', (data)=>{
		connectedUsers.innerHTML=null;
		for(var i=0; i<data.usuarios.length; i++){
			const spanUsuarios= '<div id="usu-'+data.usuarios[i].id+'">'+data.usuarios[i].usuario+'</div>';
			connectedUsers.insertAdjacentHTML('beforeend', spanUsuarios);
		}
	});

	//funcion para agregar a los usuarios que se van conectando al chat

	io.on('add usuario lobby', (data)=>{
		connectedUsers.innerHTML += '<div id="usu-'+data.id+'">'+data.usuario+'</div>';
		
	});

	//funcion para eliminar de los usuarios conectados a aquellos que se desconectan

	io.on('eliminar usuario', (data) => {
		var usuarioEliminado = d.querySelector('#usu-'+data.id);
		connectedUsers.removeChild(usuarioEliminado);
	});
})(document,io)