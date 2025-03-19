const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");
const gameMessage = document.getElementById("gameMessage");
const waveCounter = document.getElementById("waveCounter");
const pauseButton = document.getElementById("pauseButton");
let isPaused = false;
canvas.width = 400;
canvas.height = 650;

const table = document.querySelector('table');
const image = new Image();
image.src = 'img/galaxian.jpeg'; // Замініть на шлях до вашого зображення
image.onload = function() {
    table.style.backgroundImage = `url(${image.src})`;
    table.style.backgroundSize = "cover";
    table.style.backgroundPosition = "center";
    table.style.backgroundRepeat = "no-repeat";
};

let playerHealth = 1; // У гравця лише 1 здоров'я
let wave = 1; // Поточна хвиля

class Player {
  constructor() {
    this.width = 55;
    this.height = 55;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 2.8; 
    this.color = "#941111";
    this.movingLeft = false;
    this.movingRight = false;
    this.movingUp = false;
    this.movingDown = false;
    this.alive = true;
    this.maxUpwardMovement = this.y - 50;
    this.image = new Image();
    this.image.src = 'img/playerShipLevel1.webp';
  }
  draw() {
    if (this.alive) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
  update() {
    if (!isPaused && this.alive) {
      if (this.movingLeft && this.x > 0) this.x -= this.speed;
      if (this.movingRight && this.x + this.width < canvas.width)
        this.x += this.speed;
      if (this.movingUp && this.y > this.maxUpwardMovement)
        this.y -= this.speed;
      if (this.movingDown && this.y < canvas.height - this.height - 10)
        this.y += this.speed;
    }
  }
}

class Bullet {
  constructor(x, y, origin = "player") {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 10;
    this.speed = 3.5;
    this.origin = origin;
    this.alive = true;
  }
  draw() {
    ctx.fillStyle = "#4de9e6";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y -= this.speed;
    if (this.y < 0) {
      this.alive = false;
    }
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 55;
    this.color = "#35e116";
    this.alive = true;
    this.speed = 1.5 + wave * 0.1;
    this.image = new Image();
    this.image.src = 'img/virusLevel1.png';
  }
  draw() {
    if (this.alive) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
  update() {
    if (!isPaused && this.alive) {
      this.y += this.speed;
      if (this.y + this.height >= player.y && player.alive) {
        playerHealth -= 1;
        if (playerHealth <= 0) {
          player.alive = false;
          showGameOverMessage("You Lose!");
          cancelAnimationFrame(gameLoop);
        }
      }
    }
  }
}

class Boss {
  constructor(x, y, health) {
    this.x = x;
    this.y = y;
    this.width = 122;
    this.height = 134;
    this.color = "#f44336";
    this.alive = true;
    this.health = 25;
    this.speed = 2;
    this.bullets = [];
    this.image = new Image();
    this.image.src = 'img/bossLevel1.webp'; 
  }

  draw() {
    if (this.alive) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.fillText(`Health: ${this.health}`, this.x + 5, this.y - 10);
    }
  }

  update() {
    if (!isPaused && this.alive) {
      this.x += this.speed;
      if (this.x + this.width > canvas.width || this.x < 0) {
        this.speed = -this.speed;
      }

      if (Math.random() < 0.05) {
        this.bullets.push(new BossBullet(this.x + this.width / 2 - 2, this.y + this.height));
      }

      this.bullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw();
        if (bullet.y > canvas.height) {
          this.bullets.splice(index, 1); 
        }
      });
    }
  }
}

class BossBullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 10;
    this.speed = 1.9;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    if (!isPaused) this.y += this.speed;

    if (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    ) {
      playerHealth -= 1;
      if (playerHealth <= 0) {
        player.alive = false;
        showGameOverMessage("You Lose!");
        cancelAnimationFrame(gameLoop);
      }
      this.alive = false;
    }
  }
}

const player = new Player();
const bullets = [];
let enemies = [];
let boss;
let lastShotTime = 0;
const shotCooldown = 110;

function spawnEnemies() {
  enemies = [];
  for (let i = 0; i < 5 + (wave - 1); i++) {
    let randomX = Math.random() * (canvas.width - 40);
    let startY = -Math.random() * 100 - 20;
    enemies.push(new Enemy(randomX, startY));
  }
  waveCounter.textContent = `Wave: ${wave}`;
}

function spawnBoss() {
  boss = new Boss(canvas.width / 2 - 30, 50);
}

function checkNextWave() {
  if (enemies.every((enemy) => !enemy.alive)) {
    wave++;
    if (wave == 10) {
      spawnBoss();
    } else if (wave <= 9) {
      spawnEnemies();
    } else {
      showGameOverMessage("You Win!");
      cancelAnimationFrame(gameLoop);
    }
  }
}

function showGameOverMessage(messageText) {
  gameMessage.textContent = messageText;
  message.style.display = "block";
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.update();
  player.draw();

  bullets.forEach((bullet, bulletIndex) => {
    bullet.update();
    bullet.draw();
    if (bullet.y < 0) bullets.splice(bulletIndex, 1);
    enemies.forEach((enemy, enemyIndex) => {
      if (
        enemy.alive &&
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        enemy.alive = false;
        bullets.splice(bulletIndex, 1);
        checkNextWave();
      }
    });

    if (boss && bullet.origin === "player") {
      if (
        bullet.x < boss.x + boss.width &&
        bullet.x + bullet.width > boss.x &&
        bullet.y < boss.y + boss.height &&
        bullet.y + bullet.height > boss.y
      ) {
        boss.health -= 1;
        if (boss.health <= 0) {
          boss.alive = false;
          showGameOverMessage("You Win!");
          cancelAnimationFrame(gameLoop);
        }
        bullets.splice(bulletIndex, 1);
      }
    }
  });

  enemies.forEach((enemy) => {
    enemy.update();
    enemy.draw();
  });

  if (boss) {
    boss.update();
    boss.draw();
  }

  gameLoop = requestAnimationFrame(updateGame);
}

let gameLoop = requestAnimationFrame(updateGame);

window.addEventListener("keydown", (e) => {
  if (e.key === "a" || e.key === "ArrowLeft") {
    player.movingLeft = true;
  }
  if (e.key === "d" || e.key === "ArrowRight") {
    player.movingRight = true;
  }
  if (e.key === "w" || e.key === "ArrowUp") {
    player.movingUp = true;
  }
  if (e.key === "s" || e.key === "ArrowDown") {
    player.movingDown = true;
  }
  if (e.key === " ") {
    const currentTime = Date.now();
    if (currentTime - lastShotTime >= shotCooldown) {
      bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y));
      lastShotTime = currentTime;
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "a" || e.key === "ArrowLeft") {
    player.movingLeft = false;
  }
  if (e.key === "d" || e.key === "ArrowRight") {
    player.movingRight = false;
  }
  if (e.key === "w" || e.key === "ArrowUp") {
    player.movingUp = false;
  }
  if (e.key === "s" || e.key === "ArrowDown") {
    player.movingDown = false;
  }
});

// Початкова ініціалізація ворогів
spawnEnemies();