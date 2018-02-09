var constRegisterTitle = 'Welcome to ';
var constRegisterSpan = 'Digite su nombre de usuario';
(function chat(d,io){

  "use strict";

  var io = io('/cha');
  var room;
  var main = d.querySelector('#main');
  var roomsList = d.querySelector('#rooms-list');
  var createRoom = d.querySelector('#create-room');
  var register = d.querySelector('#user-register');
  var registerTitle = d.querySelector('#register-title');
  var registerForm = d.querySelector('#register-form');
  var registerSpan = d.querySelector('#register-span');
  var registerUsername = d.querySelector('#register-username');
  var chat = d.querySelector('#chat');
  var chatMessages = d.querySelector('#chat-messages');
  var chatForm = d.querySelector('#chat-form');
  var chatMessage = d.querySelector('#input-mensaje');
  var usuario = d.querySelector('#input-usuario');
  var connectedUsers = d.querySelector('#connected-users');
  var menuFlotante = d.querySelector('#menu-flotante');
  var imgUpload = d.querySelector('#img-upload');
  var img = d.querySelector('#img');
  var imgs = d.getElementsByClassName('thumb');
  //var imagenesArray = new Array();
  var imagen = new Object();

  roomsList.onclick = function (e){
    if(e.target.id!=='rooms-list'){
      var roomId = d.querySelector('#'+e.target.id);
      var roomName = roomId.innerHTML;
      var id = e.target.id.split('_')[1];
      io.emit('has password', id, function(cbValue){
        var pssw = '';
        console.log('entra');
        room = {
          id: id,
          name: roomName,
          pssw: pssw
        };
        putPassword(io,room,cbValue,function (){
          io.emit('join',{room: room});
        })
      });
    }
  };

  menuFlotante.onclick = function (e){
    if(e.target.name==='salir'){
      io.emit('exit');
      if(connectedUsers.childElementCount===0) {
        deleteRoom(d,roomsList,room);
      }

      setDefaultToMain();
    }
    if(e.target.name==='close'){
      io.emit('close room');
      deleteRoom(d,roomsList,room);
      setDefaultToMain();
    }
  };

  function setDefaultToMain(){
    room = null;
    registerTitle.innerHTML = constRegisterTitle;
    registerSpan.innerHTML = constRegisterSpan;
    registerUsername.value = '';
    chatMessages.innerHTML=null;
    connectedUsers.innerHTML = null;

    chat.classList.remove('display-flex');
    chat.classList.add('display-none');

    main.classList.remove('display-none');
    main.classList.add('display-flex');
  }

  createRoom.onclick = function(){
    createRoomF(io);
  };

  io.on('rooms', rooms => {
    if(rooms.length!==0) {
      agregarSalas(roomsList, rooms);
    }
  });

  io.on('new room', room => {
    agregarSalas(roomsList,new Array(room));
  });

  io.on('enter room', room => {
    main.classList.remove('display-flex');
    main.classList.add('display-none');
    register.classList.remove('display-none');
    register.classList.add('display-flex');
    registerTitle.innerHTML += room.name;
    registerUsername.focus();
  });

  io.on('create room', newRoom => {
    room = newRoom;
    agregarSalas(roomsList, new Array(newRoom));
    main.classList.remove('display-flex');
    main.classList.add('display-none');
    chat.classList.remove('display-none');
    chat.classList.add('display-flex');
    renderCloseRoom(d,menuFlotante);
  });

  registerForm.onsubmit = function(e){

    e.preventDefault();

    var username = registerUsername.value;
    if(username!==''){
      io.emit('existe usuario', username,  function (cbValue){
        if(!cbValue){
          register.classList.remove("display-flex");
          register.classList.add("display-none");
          chat.classList.remove("display-none");
        }else{
          registerSpan.innerHTML = "El usuario \"" + username + "\" ya existe";
          registerUsername.value = null;
        }
      });
    }

  }

  //funcion para enviar el mensaje

  chatForm.onsubmit = function(e){
    e.preventDefault();
    if(img.hasChildNodes()){
      io.emit('enviar imagen', imagen);
      mensajeChat(d,usuario.value, imagen);
      img.innerHTML='';

    }else{
      if(chatMessage.value!==''){
        io.emit('enviar mensaje', {
          mensaje: chatMessage.value,
          usuario: usuario.value
        });
        mensajeChat(d,usuario.value, chatMessage.value);
        chatMessage.value = '';
      }
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  //funcion utilitaria para agregar los mensajes

  function mensajeChat(d, usuarioI, mensaje){
    var clase = '';
    if(usuario.value == usuarioI){
      clase = 'my-message';
    }else{
      clase = 'another-message';
    }
    var contenido = '<div class="'+clase+'">';
    contenido +='<div class="mensaje '+clase+'-msj">';
    contenido+= '<span name=usuario>'+usuarioI+'</span><br/>';
    if(mensaje.url){
      contenido += '<a href="'+mensaje.url+'" target="_blank"><img class="thumb" src="'+mensaje.url+'" title="'+mensaje.nombre+'"/></a>'
    }else{
      contenido+= '<span name=mensaje>'+mensaje+'</span>';
    }
    contenido+= '</div></div>';
    chatMessages.insertAdjacentHTML('beforeend','<br/>' + contenido);

  }

  //sockets events

  //funcion para asignar un nombre de usuario desconocido

  io.on('set usuario', (data)=>{
    usuario.value = data.usuario;
  });

  //funcion para agregar los mensajes recibidos al chat

  io.on('recibir mensaje', (data) => {
    mensajeChat(d, data.usuario, data.mensaje);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  })

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
    console.log(connectedUsers);

  });

  //funcion para eliminar de los usuarios conectados a aquellos que se desconectan

  io.on('eliminar usuario', (data) => {
    var usuarioEliminado = d.querySelector('#usu-'+data.id);
    connectedUsers.removeChild(usuarioEliminado);
  });

  io.on('delete room', room =>{
    deleteRoom(d,roomsList, room);
  });

  io.on('close room', ()=>{
    console.log('emitido');
    deleteRoom(d,roomsList,room);
    setDefaultToMain();
  });

})(document,io);

function renderCloseRoom(d,menu){
  "use strict";
  var btnClose = d.createElement('button');

  btnClose.innerHTML='CLOSE ROOM';
  btnClose.classList.add('boton-flotante');
  btnClose.setAttribute('name', 'close');

  menu.appendChild(btnClose);
}

function deleteRoom(d,roomsList, room){
  "use strict";
  console.log(room);
  var roomDelete = d.querySelector('#rooms_' + room.id);
  roomsList.removeChild(roomDelete);
  if(roomsList.childNodes.length===1){
    roomsList.classList.add('border_none');
  }
}

function agregarSalas(list,rooms){
  "use strict";

  var roomsHtml = '';

  for(var i in rooms){
    roomsHtml += '<li class="room" id="rooms_'+rooms[i].id+'">'+rooms[i].name+'</li>';
  }

  if(!list.classList.contains('border_rooms_list')){
    list.classList.add('border_rooms_list');
  }

  if(list.classList.contains('border_none')){
    list.classList.remove('border_none');
  }

  list.insertAdjacentHTML('beforeend', roomsHtml);
}

function createRoomF(io){
  "use strict";
  var existDiv = document.querySelector('#popup');
  if(!existDiv){
    var body = document.querySelector('#body');
    var popup = document.createElement('div');
    var popupContainer = document.createElement("div");
    var close = document.createElement('button');
    var title = document.createElement('div');
    var formCreateRoom = document.createElement('form');
    var divUsername = document.createElement('div');
    var divRoomName = document.createElement('div');
    var divRoomPssw = document.createElement('div');
    var spanUsername = document.createElement('span');
    var spanName = document.createElement('span');
    var spanPssw = document.createElement('span');
    var inputUsername = document.createElement('input');
    var inputRoomName = document.createElement("input");
    var inputRoomPssw = document.createElement("input");
    var submit = document.createElement("input");

    popup.setAttribute('id','popup');
    popupContainer.setAttribute('id','popup-container');

    close.innerHTML = 'x';
    close.classList.add('close-button');
    close.onclick = function(){
      body.classList.remove('body-blur');
      document.body.removeChild(document.getElementById('popup'));
    };

    title.classList.add('popup-title');
    title.innerHTML = "Create Room";

    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'CREATE');
    submit.classList.add('popup-submit');

    inputUsername.setAttribute('name', 'username');
    inputUsername.setAttribute('type', 'text');

    inputRoomName.setAttribute('name', 'room_name');
    inputRoomName.setAttribute('type', 'text');

    inputRoomPssw.setAttribute('name','room_pssw');
    inputRoomPssw.setAttribute('type', 'text');

    spanUsername.innerHTML = "Username";
    spanName.innerHTML = "Room name";
    spanPssw.innerHTML = "Room pssw";

    divUsername.classList.add('popup-input');
    divUsername.appendChild(spanUsername);
    divUsername.appendChild(inputUsername);

    divRoomName.classList.add('popup-input');
    divRoomName.appendChild(spanName);
    divRoomName.appendChild(inputRoomName);

    divRoomPssw.classList.add('popup-input');
    divRoomPssw.appendChild(spanPssw);
    divRoomPssw.appendChild(inputRoomPssw);

    formCreateRoom.appendChild(divUsername);
    formCreateRoom.appendChild(divRoomName);
    formCreateRoom.appendChild(divRoomPssw);
    formCreateRoom.appendChild(submit);

    formCreateRoom.onsubmit = function (e) {
      e.preventDefault();
      io.emit('create room',{
        username: inputUsername.value,
        name: inputRoomName.value,
        pssw: inputRoomPssw.value
      });
      body.classList.remove('body-blur');
      document.body.removeChild(document.getElementById('popup'));
    };

    popupContainer.appendChild(close);
    popupContainer.appendChild(title);
    popupContainer.appendChild(formCreateRoom);

    popup.appendChild(popupContainer);

    body.classList.add('body-blur');

    document.body.appendChild(popup);
  }

}

function putPassword(io,room,cbValue, emitir){
  "use strict";
  if(cbValue){
    var existDiv = document.querySelector('#popup');
    if(!existDiv){
      var body = document.querySelector('#body');
      var popup = document.createElement('div');
      var popupContainer = document.createElement("div");
      var close = document.createElement('button');
      var title = document.createElement('div');
      var formRoomPssw = document.createElement('form');
      var divRoomPssw = document.createElement('div');
      var spanPssw = document.createElement('span');
      var inputRoomPssw = document.createElement("input");
      var submit = document.createElement("input");

      popup.setAttribute('id', 'popup');

      popupContainer.setAttribute('id','popup-container');

      close.innerHTML = 'x';
      close.classList.add('close-button');
      close.onclick = function(){
        body.classList.remove('body-blur');
        document.body.removeChild(document.getElementById('popup'));
      };

      title.classList.add('popup-title');
      title.innerHTML = room.name;

      submit.setAttribute('type', 'submit');
      submit.setAttribute('value', 'ENTER');
      submit.classList.add('popup-submit');

      inputRoomPssw.setAttribute('name','room_pssw');
      inputRoomPssw.setAttribute('type', 'password');

      spanPssw.innerHTML = "Room pssw";

      divRoomPssw.classList.add('popup-input');
      divRoomPssw.appendChild(spanPssw);
      divRoomPssw.appendChild(inputRoomPssw);

      formRoomPssw.appendChild(divRoomPssw);
      formRoomPssw.appendChild(submit);

      formRoomPssw.onsubmit = function (e) {
        e.preventDefault();
        var pssw = inputRoomPssw.value;
        io.emit('confirm pssw',{
          id: room.id,
          pssw: pssw
        }, function(cbValue){
          if(cbValue){
            room.pssw = pssw;
            console.log(room);
            emitir();
            body.classList.remove('body-blur');
            document.body.removeChild(document.getElementById('popup'));
          }
          var error = document.createElement('div');
          error.classList.add('popup-error');
          error.innerHTML = "Error contraseña incorrecta";
          popupContainer.appendChild(error);
        });
      };

      popupContainer.appendChild(close);
      popupContainer.appendChild(title);
      popupContainer.appendChild(formRoomPssw);

      popup.appendChild(popupContainer);

      body.classList.add('body-blur');

      document.body.appendChild(popup);
    }
  }else{
    console.log('entra a la funcion');
    emitir();
  }


}