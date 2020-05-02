var Ball = require('./Ball');
var Player = require('./Player');
class Logic {
    constructor() {
        this.canvasHeight = 400;
        this.canvasWidth = 600;
        this.ballStartSpeed = 6;
        this.ball = new Ball(
            10,
            this.canvasWidth / 2,
            this.canvasHeight / 2,
            this.ballStartSpeed,
            this.ballStartSpeed,
            this.canvasWidth,
            this.canvasHeight
        );

        this.player1 = new Player(
            0,
            (this.canvasHeight - 100) / 2
        );
        this.player2 = new Player(
            (this.canvasWidth - 10),
            (this.canvasHeight - 100) / 2
        );
        this.maxScore = 3;
        this.winner = null;
    }

    updateBall() {

        console.log("updateball function");
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        //// we check if the ball hit the tpo or buttom of canvas
        if (this.ball.y + this.ball.radius > this.canvasHeight || this.ball.y - this.ball.radius < 0) {
            this.ball.vy = - this.ball.vy;
            //console.log("ball collision top or buttom");
        }
        // else console.log("ball no collision top or buttom!!!!!");

        // we check if the paddle hit the player1 or the player2 paddle
        let player = (this.ball.x < this.canvasWidth / 2) ? this.player1 : this.player2;

        // if the ball hits a paddle
        if (this.collision(player)) {

            this.ball.vx = this.ball.vx * -1;
        }

        //update the score
        if (this.ball.x - this.ball.radius < 0) { //linke Kante
            //player2 win
            this.player2.score++;

            this.resetBall();
        } else if (this.ball.x + this.ball.radius > this.canvasWidth) {  //rechte Kante
            //player1 win
            this.player1.score++;

            this.resetBall();
        }

        this.hasWon();
    }

    collision(player) {
        this.ball.top = this.ball.y - this.ball.radius;
        this.ball.bottom = this.ball.y + this.ball.radius;
        this.ball.left = this.ball.x - this.ball.radius;
        this.ball.right = this.ball.x + this.ball.radius;

        player.top = player.y;
        player.bottom = player.y + player.height;
        player.left = player.x;
        player.right = player.x + player.width;



        return this.ball.right > player.left && this.ball.left < player.right && this.ball.bottom > player.top && this.ball.top < player.bottom;
    }

    // when user1 or USER2 scores, we reset the ball
    resetBall() {
        this.ball.x = this.canvasWidth / 2;
        this.ball.y = this.canvasHeight / 2;
        this.ball.vx = -this.ball.vx;

    }

    hasWon() {

        if (this.player1.score >= this.maxScore) {
            console.log("player1", this.player1.score);
            this.winner = 0;
        } else if (this.player2.score >= this.maxScore) {
            console.log("player2", this.player2.score);
            this.winner = 1;
        }
    }

}


module.exports = Logic;
