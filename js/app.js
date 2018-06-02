class Enemy {
    constructor() {
        // random number between 0 and 3, coresponding to each row
        let randomRow = Math.round(Math.random() * 3);

        const enemy = 'images/red-enemy-bug.png';

        this.rows = [60, 145, 230, 315];

        // initial position, outside canvas between -100 and -200
        this.x = -(Math.round(Math.random() * 100) + 100);
        this.y = this.rows[randomRow];

        // random speed setter (80 - 300)
        this.speed = Math.round(Math.random() * 220) + 80;
        this.sprite = enemy;
    }

    // set the bug back to the starting position once it gets out of frame (canvas)
    setInitialX() {
        return -(Math.round(Math.random() * 100) + 100);
    }

    setRow() {
        return Math.round(Math.random() * 3);
    }

    // pauses the bugs in their current position
    // used when the modal on loss is displayed
    freeze() {
        this.speed = 0;
    }

    update(dt) {
        this.x += dt * this.speed;

        if (this.x > 500) {
            // reset the enemy to random position behind the canvas
            this.x = this.setInitialX();

            // randomizing enemy position on each update
            this.y = this.rows[this.setRow()];
        }

        // check whether the player and the enemy are in the same row
        // ... and if they're overlapping (colliding)
        if (this.y == player.y && (this.x > player.x - 70 && this.x < player.x + 60)) {
            player.collision = true;
        };
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

// ----- PLAYER CLASS -----

class Player {
    constructor() {
        this.x = 200;
        this.y = 400;

        this.moves = 0;
        this.collision = false;
        this.crossed = false;
        this.unmoveable = false;
        this.sprite = 'images/char-cat-girl.png';
    }

    // player's starting position
    reset() {
        this.x = 200; 
        this.y = 400;
        this.moves = 0;
    }

    handleInput(key) {
        if (!this.unmoveable) {
            if (key === 'left') {
                this.moves++;
                if (this.x > 0)
                    this.x -= 100; // one column to the left
            } else if (key === 'up') {
                this.moves++;
                if (this.y >= 60) 
                    this.y -= 85; // one row up
                if (this.y == -25) {
                    this.unmoveable = true;
                    // this allows the character to get to the last row before being reset back to the first row
                    setTimeout(() => { this.crossed = true; }, 400);
                }
            } else if (key === 'right') {
                this.moves++;
                if (this.x < 400)
                    this.x += 100; // one column to the right
            } else if (key === 'down') {
                this.moves++;
                if (this.y < 400)
                    this.y += 85; // one row down
            }
        }
    }

    update() {
        if (this.crossed) {
            this.crossed = false;
            this.unmoveable = false;
            
            if (this.moves === 5) {
                score.count += 200;
            }

            score.count += 100;
            this.reset();

            if (score.count >= 1000) {
                congratsMsg();
            } else if (score.count >= 2000) {
                surpriseScreen();
            }
        }

        if (this.collision) {
            this.collision = false;

            lives.reduce();
            this.reset();

            if (lives.count === 0) {
                this.unmoveable = true;
                pauseGame();
                toggleModal();
            }
        }
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

class Lives {
    constructor() {
        this.x = 50;
        this.y = 10;

        this.count = 3;
        this.sprite = 'images/Heart.png';
    }

    reduce() {
        this.count--;
    }

    reset() {
        this.count = 3;
    }

    static get spriteWidth() {
        return 50;
    }

    static get spriteHeight() {
        return 50;
    }

    render() {
        let xPos = this.x;

        for (let index = 0; index < this.count; index++) { // renders lives
            ctx.drawImage(Resources.get(this.sprite), xPos, this.y, Lives.spriteWidth, Lives.spriteHeight);
            xPos += this.x + 10;
        }
    }
}

class Score {
    constructor() {
        this.x = 20;
        this.y = 575;

        this.count = 0;
    }

    reset() {
        this.count = 0;
    }

    render() {
        ctx.fillText("SCORE:", this.x, this.y);
        ctx.font = "25px Impact";
        ctx.fillText(this.count, this.x + 100, this.y);
    }
}

function pauseGame() {
    allEnemies.forEach((enemy) => {
        enemy.freeze();
    })
}

function gameRestart() {
    player.reset();
    lives.reset();
    score.reset();
}

let allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy(), new Enemy()];
let player = new Player();
let lives = new Lives();
let score = new Score();

function congratsMsg() {
    const msg = document.getElementsByClassName('header__msg')[0];

    msg.innerHTML = 'Perfect! You reached 1000 points. Can you collect 2000?';
}

function surpriseScreen() {
    const loseMsg = document.getElementsByClassName('lose__msg')[0];
    const win = document.getElementsByClassName('win')[0];

    loseMsg.style.display = "none";
    win.style.display = "block";
    pauseGame();
    toggleModal();
}

function toggleModal() {
    const modal = document.getElementsByClassName('modal')[0];

    if (modal.style.display == "none" || !modal.style.display) {
        modal.style.display = "block";
    } else {
        modal.style.display = "none";
    }
}
const popup = document.getElementById("popup");

window.onload = function () { // Call start PopUp on page load
    popup.classList.remove("hidden"); // Show the popup.
    setTimeout(()=>popup.classList.add("fade-in")); //Fade the popup in 
    document.getElementById("popup").onclick = function () { //Close the popup when it's clicked. 
    setTimeout(()=>popup.classList.add("hidden")); // Hide the popup.
    };
};

(() => {
    const restartBtn = document.getElementsByClassName('restart')[0];
    const tryAgainBtn = document.getElementsByClassName('try__again')[0];
    
    restartBtn.addEventListener('click', () => {
        gameRestart();
    });

    tryAgainBtn.addEventListener('click', () => {
        toggleModal();
        location.reload();
    });
})();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
    };

    player.handleInput(allowedKeys[e.keyCode]);
});