const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const message = document.getElementById("message");
const gameMessage = document.getElementById("gameMessage");
const waveCounter = document.getElementById("waveCounter");
const pauseButton = document.getElementById("pauseButton");
let isPaused = false;
canvas.width = 400;
canvas.height = 650;

let playerHealth = 1; // У гравця лише 1 здоров'я
let wave = 1; // Поточна хвиля

class Player {
  constructor() {
    this.width = 55;
    this.height = 55;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 4.0; 
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
    this.width = 5;   // Ширина кулі
    this.height = 10;  // Висота кулі
    this.speed = 5;    // Швидкість кулі
    this.origin = origin;
    this.alive = true;
  }
  draw() {
    ctx.fillStyle = "#4de9e6";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y -= this.speed; // Оновлюємо позицію кулі
    if (this.y < 0) {
      this.alive = false; // Куля зникає, якщо виходить за межі екрану
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
    this.speed = 2.5 + wave * 0.1; // Швидкість залежить від хвилі
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
class EnemyLevel2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 55;
    this.color = "#33cc33";
    this.alive = true;
    this.speed = 1.5 + wave * 0.1; 
    this.image = new Image();
    this.image.src = 'img/virusLevel2.png'; // Створіть або додайте зображення для EnemyLevel2
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

      if (Math.random() < 0.03) { 
        bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y));
      }
    }
  }
}

class EnemyLevel3 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 55;
    this.color = "#ff6600";
    this.alive = true;
    this.speed = 5 + wave * 0.1; 
    this.image = new Image();
    this.image.src = 'img/virusLevel3.jpeg'; // Створіть або додайте зображення для EnemyLevel3
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

      if (Math.random() < 0.05) { 
        bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y));
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
    this.speed = 5.5;
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
    this.speed = 4.5;
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

//////
const player = new Player();
const bullets = [];
let enemies = [];
let boss;
let lastShotTime = 0;
const shotCooldown = 110;

function spawnEnemies() {
  enemies = [];
  for (let i = 0; i < 5 + (wave - 1); i++) {
    let randomX = Math.random() * (canvas.width - 40); // Випадкове розташування по X
    let startY = -Math.random() * 100 - 20; // Вороги з'являються вище верхнього краю

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
    if (wave === 10) {
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
      // Кулі гравця можуть вражати лише ворогів
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
      // Кулі гравця можуть вражати лише боса
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
        bullets.splice(bulletIndex, 1); // Видаляємо кулю після попадання
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
  console.log(e.key); // Додайте це для відстеження натискання клавіші
  if (e.key === "ArrowLeft" || e.key === "a") {
    player.movingLeft = true;
  }
  if (e.key === "ArrowRight" || e.key === "d") {
    player.movingRight = true;
  }
  if (e.key === "ArrowUp" || e.key === "w") {
    player.movingUp = true;
  }
  if (e.key === "ArrowDown" || e.key === "s") {
    player.movingDown = true;
  }
  if (e.key === " " && !isPaused) {
    const currentTime = Date.now();
    if (currentTime - lastShotTime > shotCooldown) {
      bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y));
      lastShotTime = currentTime;
    }
  }
});

window.addEventListener("keyup", (e) => {
  console.log(e.key); // Додайте це для відстеження відпускання клавіші
  if (e.key === "ArrowLeft" || e.key === "a") {
    player.movingLeft = false;
  }
  if (e.key === "ArrowRight" || e.key === "d") {
    player.movingRight = false;
  }
  if (e.key === "ArrowUp" || e.key === "w") {
    player.movingUp = false;
  }
  if (e.key === "ArrowDown" || e.key === "s") {
    player.movingDown = false;
  }
});


pauseButton.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? "Resume" : "Pause";
});

document.getElementById("restartButton").addEventListener("click", () => {
  location.reload();
});
function checkNextWave() {
  if (enemies.every((enemy) => !enemy.alive)) {
    wave++;
    if (wave === 10) {
      spawnBoss();
    } else if (wave <= 9) {
      showWaveMessage(`Next Wave...`);
      setTimeout(() => {
        spawnEnemies();
        hideWaveMessage();
      }, 1500);
    } else {
      showGameOverMessage("You Win!");
      cancelAnimationFrame(gameLoop);
    }
  }
}

// Функція для відображення повідомлення про хвилю
function showWaveMessage(text) {
  const waveMessage = document.createElement("div");
  waveMessage.id = "waveMessage";
  waveMessage.textContent = text;
  waveMessage.style.position = "absolute";
  waveMessage.style.top = "50%";
  waveMessage.style.left = "50%";
  waveMessage.style.transform = "translate(-50%, -50%)";
  waveMessage.style.color = "white";
  waveMessage.style.fontSize = "28px";
  waveMessage.style.fontWeight = "bold";
  document.body.appendChild(waveMessage);
}

// Функція для приховування повідомлення про хвилю
function hideWaveMessage() {
  const waveMessage = document.getElementById("waveMessage");
  if (waveMessage) {
    waveMessage.remove();
  }
}

// Запуск першої хвилі
spawnEnemies();