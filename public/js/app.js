/*
SENG 513 - A3 Chat Application
Juan Bondad 30050828

*/

let username;
let color;

$(function () {
  
  
  var socket = io();
  $('form').submit(function(){
    socket.emit('chat message', $('#m').val().replace(":)","&#128512;").replace(':(',"&#128577;").replace(':o',"&#128558;"));
    $('#m').val(''); // clear input
    return false;
  });

  // check if user already visited before
  socket.on('check user', function(name){
    if(document.cookie){
      username = document.cookie;
      socket.emit('returning user', username);

    }else{
      socket.emit('new user');
    }
  });

  // cookie
  socket.on('new cookie', function(user){
    username = user;
    document.cookie = user;
  });

  socket.on('chat message', function(msg){
    //console.log(socket.username)
    if(msg.username == document.cookie){
      //console.log(msg.color);
      text = "<span class ='time'>" + msg.time + "</span>"+ " "+ '<span style="color:#' + msg.color +'">'+ msg.username  + '</span>' +": "+ '<b>'+ msg.message+'</b>';
    }
    else{
      text = "<span class ='time'>" + msg.time + "</span>"+ " "+ '<span style="color:#' + msg.color +'">'+ msg.username  + '</span>' +": "+ msg.message;
    }
    $('#messages').append($('<li></li>').html(text));
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
  });


  socket.on('new userlist', function (transitString) {
    var userMap = new Map(JSON.parse(transitString));
    //console.log("users list called");
    //console.log(userMap);
    $('.user-list').text("");
    userMap.forEach( function(value, key, map){
      let users;
      if(key === document.cookie){
        users = '<span style="color:#'+ value + '"><b>' + key + "(YOU)" +'</b></span>'
      } else{
        users = '<span style="color:#'+ value + '">' + key + '</span>'
      }
      //console.log(users);
      $('.user-list').append($('<div>').html(users));
    });

});


// change username
socket.on('change user', function(name) {
  document.cookie =name;
  username = name; 
});


// update message list
socket.on('message list', function (messageList, str) {
  $("#messages").html(" ");
  //console.log("message list called");
  //console.log(messageList);
  let transitString = str;
  //console.log(transitString);
  var userMap = new Map(JSON.parse(transitString));
  for (let i = 0; i < messageList.length; i++) {

    if(messageList[i].username == document.cookie){
      text = "<span class ='time'>" + messageList[i].time + "</span>"+ " "+ '<span style="color:#' + userMap.get(messageList[i].username)  +'">'+ messageList[i].username  + '</span>' +": "+ '<b>'+ messageList[i].message+'</b>';
    } 
    else{
      text = "<span class ='time'>" + messageList[i].time + "</span>"+ " "+ '<span style="color:#' + userMap.get(messageList[i].username)  +'">'+ messageList[i].username  + '</span>' +": "+ messageList[i].message;
    }
    
    $('#messages').append($('<li></li>').html(text));


   
  
}
// scroll to bottom
$('#messages').scrollTop($('#messages')[0].scrollHeight);
});

});


