

'use strict';
document.addEventListener("DOMContentLoaded", evt => {
  const sock = io();

  // select canvas element
  const cvs = document.getElementById("pong");

  /**
   * Models to Paddle, user1, user2, ball, net and finalResult
   */
  // User1 Paddle
  const user1 = {
    x: 0, // left side of cvs
    y: (cvs.height - 100) / 2, // -100 the height of paddle
    width: 10,
    height: 100,
    score: 0,

    color: "red"
  }

  // User1 Paddle
  const user2 = {
    x: cvs.width - 10, // - width of paddle
    y: (cvs.height - 100) / 2, // -100 the height of paddle
    width: 10,
    height: 100,
    score: 0,

    color: "green"
  }

  // Ball 
  const ball = {
    x: cvs.width / 2,
    y: cvs.height / 2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,

    color: "WHITE"
  }

  // net
  const net = {
    x: (cvs.width - 2) / 2,
    y: 0,
    height: 10,
    width: 2,
    color: "WHITE"
  }

  //final result msg
  const finalResult = {
    msg1: "",
    msg2: ""
  }

  /**
   * functions for gameelements drawing 
   */


  // getContext of canvas = methods and properties to draw and do a lot of thing to the canvas
  const ctx = cvs.getContext('2d');

  // draw a rectangle, will be used to draw paddles
  function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // draw circle, will be used to draw the ball
  function drawcircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }

  // draw text
  function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "45px fantasy";
    ctx.fillText(text, x, y);
  }

  // draw the net
  function drawNet() {   // ( 10 +5 ) * Y + 10 = 400   -> Y = 26
    for (let i = 0; i <= cvs.height; i += 15) {
      drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
  }

  /**
   * render function, the function that does al the drawing
   */
  function render() {

    // clear the canvas
    drawRect(0, 0, cvs.width, cvs.height, "#000");

    // draw the net
    drawNet();

    // draw the user1 score to the left
    drawText(user1.score, cvs.width / 4, cvs.height / 5, user1.color);

    // draw the user2 score to the right
    drawText(user2.score, 3 * cvs.width / 4, cvs.height / 5, user2.color);

    // draw thefinal result message in the middle -> `gewonnen` or ` verloren`
    drawText(finalResult.msg1, cvs.width / 3, 3 * cvs.height / 5, "WHITE");

    // draw thefinal result message in the middle -> `gewonnen` or ` verloren`
    drawText(finalResult.msg2, 2, 4 * cvs.height / 5, "GREY");

    // draw the user1's paddle
    drawRect(user1.x, user1.y, user1.width, user1.height, user1.color);

    // ddraw the user2's paddle
    drawRect(user2.x, user2.y, user2.width, user2.height, user2.color);

    // draw the ball
    drawcircle(ball.x, ball.y, ball.radius, ball.color);
  }

  //write text on ul element
  const writeEvent = (text) => {
    // <ul> element
    const parent = document.querySelector('#events');

    // <li> element
    const el = document.createElement('li');
    el.innerHTML = text;

    parent.appendChild(el);
  };

  //write scketId on div
  const writePlayerId = id => {
    const element = document.querySelector('#playerId');
    element.innerHTML = id;
  }

  // send Paddele position to server by mousemove on canvas
  cvs.addEventListener("mousemove", (obj) => {
    let rect = cvs.getBoundingClientRect();
    let mvtData = {
      clientY: event.clientY,
      rectTop: rect.top
    };
    sock.emit('mousmoved', mvtData);
  });


  /**
   * listen to server on various topics
   */
  sock.on('message', writeEvent);
  sock.on('idMessage', writePlayerId);
  sock.on('finalResult', (result) => {

    finalResult.msg1 = result.msg1;
    finalResult.msg2 = result.msg2;

  });
  sock.on('ballPos', (data) => {
    ball.x = data.ball.x;
    ball.y = data.ball.y;
    user1.score = data.p1Score;
    user2.score = data.p2Score;
    let winner = data.winner;
    if (winner == 0) {

    }
    else if (winner == 1) {

    }

  });
  sock.on('mousmoved', (posPlayers) => {
    console.log("sock.on(mousemov)");
    user1.y = posPlayers.player1Y;
    user2.y = posPlayers.player2Y;
    console.log(posPlayers.player1Y);
    console.log(posPlayers.player2Y);
  });
  

  /**
   * 
   * send chat message to Server
   */
  const onFormSubmitted = (e) => {
    e.preventDefault();

    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';

    sock.emit('message', text);
  };


  document
  .querySelector('#chat-form')
  .addEventListener('submit', onFormSubmitted);

  // Initialisierung
  const init = () => {
    

    //display Greeting message on chat
    writeEvent('Welcome to Pong Game');

    //call the game function every 20ms
    setInterval(render, 20);

  }

  // INIT
  init();

});
