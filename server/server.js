'use strict';
const PongGame = require('./pong-game');

// Express
const express = require('express');
let expressServer = express();
expressServer.use(express.static('../client'));

// HTTP
const http = require('http');
let httpServer = http.Server(expressServer);

// Websocket
const socketIo = require('socket.io');
let io = socketIo(httpServer);

let waitingPlayer = null;

// Datenstruktur, die alle Sockets enthält
let users = new Map();
// Datenstruktur, die alle paare enthält
let pairs = new Array();
// Datenstruktur, die alle Spiele enthält
let gameListe = new Array();

//Hilfsfunktionen
{


// let dispalyAllUsers = () => {
//   for (let [k, v] of users) {
//     console.log(`User mit SocketID : ${k}  , ongame : ${v.ongame}`);
//   }
// };
// let displayAllPairs = () => {
//   if (pairs.length > 0) {
//     pairs.forEach((pair, index) => {
//       console.log(`Das Paar N°${index + 1}--> p1: ${pair.p1.id} vs  p2:${pair.p2.id}`);
//       console.log(`is p1 connected: ${pair.p1Connected}  /  is p2 connected: ${pair.p2Connected}`);
//     });
//   }
//   else console.log(" es gibt keine Paare !!!!!")
// };

// let displayPair = (pair) => {

//   console.log(`game run -> p1 : ${pair.p1.id}  vs   P2: ${pair.p2.id}`);
//   console.log(`p1 connected: ${pair.p1Connected}  /  p2 connected: ${pair.p2Connected}`);
// };
// let displayGame = (game, index) => {
//   console.log(` zeile 141: game run -> p1 : ${game._players[0].id}  vs   P2: ${game._players[1].id}`);
//   //console.log(`p1 connected: ${game._players[0].p1Connected}  /  p2 connected: ${game._players[1].p2Connected}`);
// };


// function startGameLoop() {

//   setInterval(function () {
//     //console.log(`${pair.p1.id} vs  ${pair.p2.id}` );
//     if (gameListe.length > 0) {
//       gameListe.forEach((game, index) => {
//         console.log("***********************")
//         console.log(`das Spiel N° ${index + 1}`)
//         displayGame(game, index);


//       })
//     }


//   }, 5000);
// }
}

io.on('connect', (sock) => {
  //add new user to users
  users.set(sock.id, { ongame: false });
  
  //send socket ID to connected user
  sock.emit('idMessage', `your ID :  ${sock.id}`);

  
  if (waitingPlayer) {

    //set user ongame = true
    users.set(sock.id, { ongame: true });
    users.set(waitingPlayer.id, { ongame: true });

    // add new pair
    let pair = {
      p1: waitingPlayer,
      p2: sock,
      p1Connected: true,
      p2Connected: true
    }
    pairs.push(pair)

    //add to GameListe

    gameListe.push(new PongGame(pair));



    waitingPlayer = null;
  } else {
    waitingPlayer = sock;

    //send Nachricht zum user, dass er er am warten von einem Gegner
    waitingPlayer.emit('message', `${waitingPlayer.id}Waiting for an opponent`);
  }

   //wenn der server eine Nachricht bekommt leitet sie weiter an allen 
  sock.on('message', (text) => {
    io.emit('message', text );
  });

  sock.on('disconnect', () => {
    let id = sock.id;

    //set player property `p1Connected` or `p2Connected` to 'false'
    //wenn der user im spiel ist
    if (users.get(id).ongame === true) {
      //console.log("Test");
      pairs.forEach(pair => {
        if (pair.p1.id === id) {
          //console.log("Test p1");
          pair.p1Connected = false;
        }
        else if (pair.p2.id === id) {
          //console.log("Test p2");
          pair.p2Connected = false;
        }
      })

    }

    // romove disconnected user from users
    users.delete(id);
  });

});

//Initialisierung
function init() {
  // Server starten
  httpServer.listen(8080, err => console.log(err || 'Pong started on 8080'));

  //startGameLoop();
}

init();




