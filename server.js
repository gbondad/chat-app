/*
SENG 513 - A3 Chat Application
Juan Bondad 30050828

*/

const express = require('express');
var app = express();// load the express module
var http = require('http').createServer(app); // create http server
var io = require('socket.io')(http);
var numUsers = 0;
let usersList = new Map();
let messageList = [];
let currentTime;
app.use(express.static(__dirname + '/public')); // serve static files

// Send the page index.html
app.get('/', (req, res) => { // when browser requests / send a copy of index.html
  res.sendFile(__dirname+ '/index.html');
});


// establish connections
io.on('connection', (socket) => {

    
    // check cookies
    socket.emit('check user', createName())
    console.log('a user connected');

    // user disconnects
    socket.on('disconnect', () => {
      console.log('user disconnected');
      if(usersList.delete(socket.username)){
        let transitString = JSON.stringify(Array.from(usersList));
        io.emit('new userlist', transitString);
      }
    });

    // returning user
    socket.on('returning user', (user) =>{
      if(usersList.has(user)){
        //console.log("This user exists" + usersList);
        socket.username = createName();
        socket.emit('new cookie', socket.username);
      } else{
        socket.username = user;
      }
      //console.log(user +" has reconnected");
      socket.color = rainbowStop(Math.random());
      //console.log(socket.color);
      usersList.set(socket.username, socket.color)
      updateChat();
    });

    // new user
    socket.on('new user', () => {
      numUsers++;
      console.log("new user");
      socket.username = createName();
      var randomColor = Math.floor(Math.random()*16777215).toString(16);
      socket.color = rainbowStop(Math.random());
      usersList.set(socket.username, socket.color);
      socket.emit('new cookie', socket.username);
      updateChat();
      });

    // message
    socket.on('chat message', (msg) => {
      currentTime = new Date().toLocaleTimeString();

      // delete oldest message when over 200
      if(messageList.length >200){
        console.log(messageList.length);
        messageList.shift();
        let transitString = JSON.stringify(Array.from(usersList));
        io.emit('message list', messageList, transitString);
      }
      
      if(msg.startsWith("/getColor")){
        socket.emit('chat message', {message: "COLOR " + socket.color, username: "SERVER", color: "ff0000", time: currentTime});
        //console.log(usersList);
      }
      else if(msg.startsWith("/color ")){ // change color
        var hexColor = msg.split(' ')[1];
        //console.log(isHexColor(hexColor));
       
        if(isHexColor(hexColor)){
          socket.color = hexColor;
          usersList.set(socket.username, socket.color);
          //socket.emit('chat message', {message: "COLOR CHANGE SUCCESFUL", username: "SERVER", color: "ff0000", time: currentTime});
          //console.log(messageList);
          updateChat();
        } else{
          socket.emit('chat message', {message: "NOT A VALID COLOR ", username: "SERVER", color: "ff0000", time: currentTime});
        }  
      }
      else if(msg.startsWith("/name ")){ // change name
        var newName = msg.split(' ')[1];
        if(usersList.has(newName)){
          socket.emit('chat message', {message: "NAME TAKEN", username: "SERVER", color: "ff0000", time: currentTime});
        }
        else{
            var oldName = socket.username;  // get old name
            usersList.set(newName, socket.color); // add new name to list of users
            socket.username = newName; // set new name
            usersList.delete(oldName) // delete old key
            socket.emit('change user', newName); // change user name in app

            for(let i = 0; i < messageList.length ; i++){
              if(messageList[i].username === newName){
                messageList[i].username = "User" + (numUsers);
              }
              if(messageList[i].username === oldName){
                messageList[i].username = newName;
              }
            }
            updateChat();
        }
      }
      else if(msg.startsWith("/")){ // invalid command
        socket.emit('chat message', {message: "Invalid Command: use /color or /name", username: "SERVER", color: "ff0000", time: currentTime});
      }
      else{ // send message
        console.log('message: ' + msg);
        io.emit('chat message', {message: msg, username: socket.username, color: socket.color, time: currentTime});
        messageList.push({message: msg, username: socket.username, time: currentTime})
      }
     // messageList.push({});
      });
    
  });

// creates a listener on the specified port or path
http.listen(3000, () => {
  console.log('listening on *:3000');
});


// update chat and list of users
function updateChat(){
  let transitString = JSON.stringify(Array.from(usersList));
  io.emit('new userlist', transitString);
  io.emit('message list', messageList, transitString);
}


//create name
function createName(){
  var userName;
  userName = "User" + numUsers;
  return userName;

}

// check if color is valid
function isValidColor(str) {
  return str.match(/^#[a-f0-9]{6}$/i) !== null;
}


// https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation/8027444
isHexColor = hex => typeof hex === 'string' && hex.length === 6 && !isNaN(Number('0x' + hex)) // check if valid hex color

// Generates a random color
//http://blog.adamcole.ca/2011/11/simple-javascript-rainbow-color.html
function rainbowStop(h) 
{
  let f= (n,k=(n+h*12)%12) => .5-.5*Math.max(Math.min(k-3,9-k,1),-1);  
  let rgb2hex = (r,g,b) => [r,g,b].map(x=>Math.round(x*255).toString(16).padStart(2,0)).join('');
  return ( rgb2hex(f(0), f(8), f(4)) );
} 