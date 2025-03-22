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

let wave = 1; // Поточна хвиля

// Тепер створення елементу для здоров'я
let playerHealth = 10;
const healthDisplay = document.createElement("div");
healthDisplay.id = "healthCounter";
healthDisplay.innerHTML = `<b>Health: ${playerHealth}</b>`;
document.body.appendChild(healthDisplay);


// Функція отримання урону гравцем
function takeDamage(amount) {
    playerHealth -= amount;
    if (playerHealth < 0) playerHealth = 0;
    healthDisplay.innerHTML = `<b>Health: ${playerHealth}</b>`;
    
    if (playerHealth === 0) {
        gameOver();
    }
}

// Виклик функції при попаданні кулі у гравця
function onPlayerHit() {
    takeDamage(0.5);
}

// Функція завершення гри
function gameOver() {
          showGameOverMessage("You Lose!");
          cancelAnimationFrame(gameLoop);
    // Додатковий код для завершення гри
}

class Player {
  constructor() {
    this.width = 55;
    this.height = 55;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 2;
    this.color = "#941111";
    this.movingLeft = false;
    this.movingRight = false;
    this.movingUp = false;
    this.movingDown = false;
    this.alive = true;
    this.maxUpwardMovement = this.y - 50;
    this.health = 1; // 10 здоров'я у гравця
    this.image = new Image();
    this.image.src = 'img/playerShipLevel1.webp';
  }
  draw() {
    if (this.alive) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      // Виводимо здоров'я гравця на екран
      document.getElementById("healthCounter").innerHTML = `<b>Health: ${this.health}</b>`;
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
    this.speed = 2.3;
    this.origin = origin;
    this.alive = true;
  }

  draw() {
    ctx.fillStyle = this.origin === "player" ? "#4de9e6" : "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y -= this.origin === "player" ? this.speed : -this.speed;
    if (this.y < 0 || this.y > canvas.height) {
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
    this.speed = 0.6;
    this.image = new Image();
    this.image.src = 'img/virusLevel1.png';
    this.bullets = [];
  }

  draw() {
    if (this.alive) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    this.bullets.forEach((bullet) => bullet.draw());
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
      // Вороги типу "Enemy" не стріляють, тому ця частина пропускається.
    }
  }
}

class EnemyLevel2 extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.color = "#33cc33";
    this.speed = 0.2 + wave * 0.1;
    this.image.src = 'img/virusLevel2.png';
    this.shootCooldown = 7500;
    this.lastShotTime = 0;
  }

  update() {
    super.update();
    if (!isPaused && this.alive) {
      const currentTime = Date.now();
      if (currentTime - this.lastShotTime >= this.shootCooldown) {
        this.shoot();
        this.lastShotTime = currentTime;
      }
    }

    // Оновлюємо кулі та перевіряємо їх зіткнення з гравцем
    this.bullets.forEach((bullet, index) => {
      bullet.update();

      // Перевірка на зіткнення з гравцем
      if (
        bullet.x < player.x + player.width &&
        bullet.x + bullet.width > player.x &&
        bullet.y < player.y + player.height &&
        bullet.y + bullet.height > player.y
      ) {
        takeDamage(0.5); // Забираємо 0.5 HP у гравця
        this.bullets.splice(index, 1); // Видаляємо кулю після зіткнення
      }
    });

    // Видаляємо кулі, які вийшли за межі екрану
    this.bullets = this.bullets.filter(bullet => bullet.y < canvas.height);
  }

  shoot() {
    const bullet = new Bullet(this.x + this.width / 2 - 2, this.y + this.height, "enemy");
    this.bullets.push(bullet);
  }
}

class EnemyLevel3 extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.speed = 4; // Швидкість збільшується з кожною хвилею
    this.image.src = 'img/virusLevel3.png'; // Ти можеш використовувати інший малюнок
  }

  draw() {
    if (this.alive) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  update() {
    super.update();
    
    // Рухаємо ворога швидше, ніж Enemy
    this.x -= this.speed;

    // Перевірка на зіткнення з гравцем
    if (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    ) {
      takeDamage(0.5); // Якщо ворог стикається з гравцем, знімаємо здоров'я
      this.alive = false; // Вбиваємо ворога
    }
  }
}

function spawnEnemies() {
  enemies = [];
  let maxEnemies = 5; // Максимальна кількість ворогів на хвилю

  // Визначаємо кількість ворогів кожного типу випадковим чином
  let numEnemies = Math.floor(Math.random() * (maxEnemies - 1)) + 1; // Кількість "Enemy", мінімум 1
  let numEnemyLevel2 = maxEnemies - numEnemies; // Кількість "EnemyLevel2", решта

  if (wave >= 3 && wave <= 6) {
    enemies.push(new EnemyLevel2(randomX, startY),new Enemy(randomX, startY)); // Повільні, але зі стріляниною
  } else if (wave >= 7 && wave <= 9){
    enemies.push(new EnemyLevel3(randomX, startY),new Enemy(randomX, startY)); // Повільні, але зі стріляниною
  } else {
    enemies.push(new Enemy(randomX, startY)); // Звичайні вороги
  }

  // Генерація звичайних ворогів (Enemy)
  for (let i = 0; i < numEnemies; i++) {
    let randomX = Math.random() * (canvas.width - 40);
    let startY = -Math.random() * 100 - 20;
    enemies.push(new Enemy(randomX, startY)); // Створюємо звичайного ворога
  }

  // Генерація ворогів "EnemyLevel2"
  for (let i = 0; i < numEnemyLevel2; i++) {
    let randomX = Math.random() * (canvas.width - 40);
    let startY = -Math.random() * 100 - 20;
    enemies.push(new EnemyLevel2(randomX, startY)); // Створюємо ворога "EnemyLevel2"
  }


  waveCounter.textContent = `Wave: ${wave}`;
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.update();
  player.draw();

  // Оновлюємо і перевіряємо кулі
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
        bullet.y + bullet.height > enemy.y &&
        bullet.origin === "player" // Перевіряємо, чи це куля гравця
      ) {
        enemy.alive = false;
        bullets.splice(bulletIndex, 1);
        checkNextWave();
      }
    });

    // Перевірка на кулі боса
    if (bullet.origin === "enemy") {
      if (
        bullet.x < player.x + player.width &&
        bullet.x + bullet.width > player.x &&
        bullet.y < player.y + player.height &&
        bullet.y + bullet.height > player.y
      ) {
        playerHealth -= 10;
        if (playerHealth <= 0) {
          player.alive = false;
          showGameOverMessage("You Lose!");
          cancelAnimationFrame(gameLoop);
        }
        bullet.alive = false;
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

class Boss {
  constructor(x, y, health) {
    this.x = x;
    this.y = y;
    this.width = 122;
    this.height = 134;
    this.color = "#f44336";
    this.alive = true;
    this.health = 25;
    this.speed = 1;
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
    this.speed = 1.3;
    this.alive = true; // Важливо, щоб пуля була живою після кожного оновлення
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    if (!isPaused) this.y += this.speed;

    // Перевірка на зіткнення кулі з гравцем
    if (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    ) {
      // Перевірка, чи гравець ще живий
      if (player.alive && playerHealth > 0) {
        playerHealth -= 1; // Зменшення здоров'я гравця
        console.log(`Player health: ${playerHealth}`); // Лог для перевірки здоров'я
      }

      // Знищення кулі після зіткнення
      this.alive = false;

      // Якщо здоров'я гравця стало 0, програш
      if (playerHealth <= 0) {
        player.alive = false;
        showGameOverMessage("You Lose!");
        cancelAnimationFrame(gameLoop); // Завершуємо гру
      }
    }

    // Якщо пуля вийшла за межі екрану, її треба знищити
    if (this.y > canvas.height) {
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

    // Рандомно вибираємо тип ворога в залежності від хвилі
    if (wave >= 4 && wave < 7) {
      enemies.push(new EnemyLevel2(randomX, startY),new Enemy(randomX, startY)); // Повільні, але зі стріляниною
    } else {
      enemies.push(new Enemy(randomX, startY)); // Звичайні вороги
    }
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
    let currentTime = Date.now();
    if (currentTime - lastShotTime >= shotCooldown) {
      bullets.push(new Bullet(player.x + player.width / 2 - 2, player.y, "player"));
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