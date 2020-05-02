const Logic = require('../gamelogic/Logic');

class PongGame {

  constructor(pair) {
    console.log(`ponggame constr: ${pair.p1.id}  vs ${pair.p2.id} `);
    this.pair = pair;
    let p1 = pair.p1;
    let p2 = pair.p2;
    this._players = [p1, p2];
    this.idIntervall = null;
    this._mousmouveevents = [null, null];
    this._sendToPlayers(`${p1.id} und ${p2.id}  startenjetzt das Spiel!`);

    // für jeden spieler hören auf seine Schlägerbewegung (mousebewegung)
    this._players.forEach((player, idx) => {
      player.on('mousmoved', (event) => {

        this._onMousmoved(idx, event);
      });
    });

    this._logic = new Logic();


    this._startGameLogicLoop();
  }

  _sendToPlayers(msg) {
    this._players.forEach((player) => {
      player.emit('message', msg);
    });
  }

  _onMousmoved(playerIndex, mvtData) {
    // Schläger position neu berechnen
    let playerY = mvtData.clientY - mvtData.rectTop - this._logic.player1.height / 2;
    if (playerIndex == 0) this._logic.player1.y = playerY;
    else if (playerIndex == 1) this._logic.player2.y = playerY;
    //console.log(`mousemovedEvt vom -> ${this._players[playerIndex].id}`);
    
    //send neue berechnete Schläger pos zu Spielern (Clients)
    this._updatePlayerpos();

  }

  _startGameLogicLoop() {
   
    this.idIntervall = setInterval(function (that) {

      //wenn ein spieler disconnected -> Spiel Ende und  Ergebnisse mitteilen an verbundenen Spieler Client
      that._checkPlayerAlive();
      
      //update Spiel Logic (ball, Ergebisse...)
      that._logic.updateBall();

      // update spieler Clients mit aktuellen ball position und Ergebinissen
      that._updatePlayers();

    }, 50, this);

  }

  _checkPlayerAlive ()
  {
    let resul3 = {
      msg1: "Gewonnen",
      msg2: "Your opponent is diconnected"
    };

    if (this.pair.p1Connected == false) {
      console.log("player1 is disconnected");

      this._players[1].emit('finalResult', resul3);
      clearInterval(this.idIntervall);
    }
    else console.log("player1 is connected");
    if (this.pair.p2Connected == false) {
      console.log("player2 is disconnected");
      let resul = {
        msg1: "Gewonnen",
        msg2: "Your opponent is diconnected"
      }
      this._players[0].emit('finalResult', resul3);
      clearInterval(this.idIntervall);
    }
    else console.log("player2 is connected");
    
  }

  _updatePlayers()
  {
    let resul1 = {
      msg1: "Gewonnen",
      msg2: ""
    };
    let resul2 = {
      msg1: "verloren",
      msg2: ""
    };
    let ball = this._logic.ball;
      let p1Score = this._logic.player1.score;
      let p2Score = this._logic.player2.score;
      let data = {
        ball: ball,
        p1Score: p1Score,
        p2Score: p2Score,
      }

      //send ball position
      this._players.forEach((player) => {
        player.emit('ballPos', data);
      });

      //if winner -> Spiel Ende ->sen Gratualtion message for winner and message for loser
      console.log(this._logic.winner);
      if (this._logic.winner === 0) {

        this._players[0].emit('finalResult', resul1);
        this._players[1].emit('finalResult', resul2);
        clearInterval(this.idIntervall);

      }
      else if (this._logic.winner === 1) {

        this._players[0].emit('finalResult', resul2);
        this._players[1].emit('finalResult', resul1);
        clearInterval(this.idIntervall);
      }
  }

  _updatePlayerpos(){
    let posPlayers = {
      player1Y: this._logic.player1.y,
      player2Y: this._logic.player2.y,

    }
    this._players.forEach((player) => {
      player.emit('mousmoved', posPlayers);
    });
  }

}

module.exports = PongGame;
