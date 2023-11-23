// gameplay
const NUM_INITIAL_LIVES = 3;
const DEFAULT_HEALTH = 100;

// explosions
const EXPLOSION_WIDTH = 40;
const EXPLOSION_HEIGHT = 40;

// own ship
const DEFAULT_SHOT_INTERVAL = 300;
const ENHANCED_SHOT_INTERVAL = 100;
const OWN_SHIP_X_DIMENSION = 50;
const OWN_SHIP_Y_DIMENSION = 50;
const OWN_SHIP_X_SPEED = 7;
const OWN_SHIP_Y_SPEED = 7;

// own shot
const OWN_SHOT_Y_SPEED = -10;
const OWN_SHOT_X_SPEED = 0;
const OWN_SHOT_X_DIMENSION = 20;
const OWN_SHOT_Y_DIMENSION = 20;

// enemy ship
const ENEMY_SHIP_X_DIMENSION = 75;
const ENEMY_SHIP_Y_DIMENSION = 100;
const ENEMY_SHIP_DEFAULT_Y_SPEED = 1.6;
const ENEMY_SHIP_DEFAULT_X_SPEED = 1;
const ENEMY_SHIP_DESTROY_SCORE = 400;
const ENEMY_SHIP_SPAWN_TIMEOUT_MS = 4500;
const ENEMY_SHIP_FIRE_SHOT_PROBABILITY = 0.008;
const ENEMY_SHIP_CHECK_DIRECTION_PROBABILITY = 0.005;

// enemy shot
const ENEMY_SHOT_X_DIMENSION = 20;
const ENEMY_SHOT_Y_DIMENSION = 20;
const ENEMY_SHOT_Y_SPEED = 3;
const ENEMY_SHOT_X_SPEED = 0;

// enemy boss
const ENEMY_BOSS_X_DIMENSION = 250;
const ENEMY_BOSS_Y_DIMENSION = 250;
const ENEMY_BOSS_DEFAULT_Y_SPEED = 0;
const ENEMY_BOSS_DEFAULT_X_SPEED = -1;
const ENEMY_BOSS_DEFAULT_HEALTH = 200;
const ENEMY_BOSS_DAMAGE_TAKEN_PER_SHOT = 5;
const ENEMY_BOSS_DESTROY_SCORE = 4000;
const ENEMY_BOSS_CHECK_DIRECTION_PROBABILITY = 0.005;
const ENEMY_BOSS_SPAWN_PROBABILITY = 0.001;
const ENEMY_BOSS_FIRE_SHOT_PROBABILITY = 0.02;

// power ups
const POWER_UP_X_DIMENSION = 40;
const POWER_UP_Y_DIMENSION = 40;
const POWER_UP_Y_SPEED = 3.5;
const POWER_UP_X_SPEED = 0;
const POWER_UP_DURATION_MS = 10000;
const POWER_UP_SPAWN_PROBABILITY = 0.001;

// general variables
const RIGHT_CURSOR_KEY_CODE = 39;
const LEFT_CURSOR_KEY_CODE = 37;
const UP_CURSOR_KEY_CODE = 38;
const DOWN_CURSOR_KEY_CODE = 40;
const SPACEBAR_KEY_CODE = 32;
const R_KEY_CODE = 82;

const ORIGINAL_OWN_SHIP_OBJECT = {
  x: (window.innerWidth - OWN_SHIP_X_DIMENSION) / 2,
  y: window.innerHeight - OWN_SHIP_Y_DIMENSION - 20,
  xDimension: OWN_SHIP_X_DIMENSION,
  yDimension: OWN_SHIP_Y_DIMENSION,
  xSpeed: OWN_SHIP_X_SPEED,
  ySpeed: OWN_SHIP_Y_SPEED,
  exist: true,
};

document.addEventListener("DOMContentLoaded", function () {
  let canvas = document.getElementById("canvas");
  let ctx = canvas.getContext("2d");

  // initialize background
  // background repetition isn't seamless right now
  let vx = 0;
  let vy = 0;
  let background = new Image();
  background.src = "img/background.jpg";
  let score = 0;
  let health = DEFAULT_HEALTH;
  let lives = NUM_INITIAL_LIVES;
  let gameOver = false;

  //initialize explosions
  let explosionArray = [];
  let totalFrames = 7;
  let explosion = new Image();
  explosion.src = "sprite/particle_largeBall1.png";

  //ownShip attributes
  let shotInterval = DEFAULT_SHOT_INTERVAL;
  let ownShip = new Image();
  ownShip.src = "img/ownShip.png";
  let ownShipLeft = new Image();
  ownShipLeft.src = "img/ownShipLeft.png";
  let ownShipRight = new Image();
  ownShipRight.src = "img/ownShipRight.png";

  //initialize own ship
  let ownShipObject = { ...ORIGINAL_OWN_SHIP_OBJECT };

  //ownShot attributes
  let ownShotArray = [];
  let shotAwaiting = false;
  let ownShot = new Image();
  ownShot.src = "img/ownShot.png";

  //enemyShip attributes
  let enemyShipArray = [];
  let enemyShipSpawnAwaiting = false;
  let enemyFiring = false;
  let enemyShip = new Image();
  enemyShip.src = "img/enemy1.png";

  //enemyShot attributes
  let enemyShotArray = [];
  let enemyShot = new Image();
  enemyShot.src = "img/enemyShot1.png";

  //enemyBoss attributes
  let enemyBoss;
  let enemyBossHealth = ENEMY_BOSS_DEFAULT_HEALTH;
  let enemyBossExist = false; // we need this to maintain the enemyboss object for sprite explosion placement
  let enemyBoss1 = new Image();
  enemyBoss1.src = "img/enemyBoss1.png";

  //powerup
  let powerUpArray = [];
  let powerUp = new Image();
  let powerUpTimeoutId;
  powerUp.src = "img/powerup.png";

  //controls
  let rightPressed = false;
  let leftPressed = false;
  let upPressed = false;
  let downPressed = false;
  let spacebarPressed = false;

  //event listeners
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  //main draw function
  function draw() {
    drawBackground();
    drawSpaceShips();
    drawScore();
    drawHealthBar();
    drawLives();
    dropPowerUp();
    animateExplosion();
    if (!gameOver) {
      requestAnimationFrame(draw);
    }
  }

  //repeat the background over and over
  function drawBackground() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.drawImage(background, vx, vy, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(
      background,
      vx,
      -ctx.canvas.height + Math.abs(vy),
      ctx.canvas.width,
      ctx.canvas.height
    );
    if (Math.abs(vy) > ctx.canvas.height) {
      vy = 0;
    }
    vy += 1;
  }

  //update the score
  function drawScore() {
    ctx.font = "25px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 20, 50);
  }

  //update lives
  function drawLives() {
    ctx.font = "25px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Lives: " + lives, 20, 100);
  }

  //update health bar
  function drawHealthBar() {
    ctx.beginPath();
    ctx.rect(20, 150, (300 * health) / 100, 20);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 1.0)";
    ctx.stroke();
    ctx.closePath();
  }

  //drop power ups
  function dropPowerUp() {
    if (checkProbability(POWER_UP_SPAWN_PROBABILITY)) {
      powerUpArray.push({
        x: Math.random() * canvas.width - POWER_UP_X_DIMENSION,
        y: 20 + Math.random() * 10,
        xDimension: POWER_UP_X_DIMENSION,
        yDimension: POWER_UP_Y_DIMENSION,
        xSpeed: POWER_UP_X_SPEED,
        ySpeed: POWER_UP_Y_SPEED,
        exist: true,
      });
    }
  }

  //fires enemy shots based on boss firing rate
  function fireEnemyBossShots() {
    if (
      enemyBossExist &&
      enemyBoss != null &&
      checkProbability(ENEMY_BOSS_FIRE_SHOT_PROBABILITY)
    ) {
      enemyShotArray.push({
        x: enemyBoss.x + (enemyBoss.xDimension - ENEMY_SHOT_X_DIMENSION) / 3,
        y: enemyBoss.y + ENEMY_BOSS_Y_DIMENSION,
        xDimension: ENEMY_SHOT_X_DIMENSION,
        yDimension: ENEMY_SHOT_Y_DIMENSION,
        xSpeed: ENEMY_SHOT_X_SPEED,
        ySpeed: ENEMY_SHOT_Y_SPEED,
        exist: true,
      });
      enemyShotArray.push({
        x:
          enemyBoss.x +
          ((enemyBoss.xDimension - ENEMY_SHOT_X_DIMENSION) * 2) / 3,
        y: enemyBoss.y + ENEMY_BOSS_Y_DIMENSION,
        xDimension: ENEMY_SHOT_X_DIMENSION,
        yDimension: ENEMY_SHOT_Y_DIMENSION,
        xSpeed: ENEMY_SHOT_X_SPEED,
        ySpeed: ENEMY_SHOT_Y_SPEED,
        exist: true,
      });
    }
  }

  //updates enemy boss health
  function drawEnemyBossHealth() {
    ctx.beginPath();
    ctx.rect(canvas.width - 650, 50, (600 * enemyBossHealth) / 200, 20);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 1.0)";
    ctx.stroke();
    ctx.closePath();
  }

  //draw all spaceships own and enemy
  function drawSpaceShips() {
    detectCollision();
    drawOwnShip();
    enemyShipActions();

    drawProjectiles(powerUpArray, powerUp);
    drawProjectiles(ownShotArray, ownShot);
    drawProjectiles(enemyShotArray, enemyShot);
    drawProjectiles(enemyShipArray, enemyShip);
    if (enemyBossExist && enemyBoss != null) {
      drawProjectiles([enemyBoss], enemyBoss1);
    }
  }

  //draw own spaceship
  function drawOwnShip() {
    ownShipAction();
    if (ownShipObject.exist) {
      if (leftPressed) {
        ctx.drawImage(
          ownShipLeft,
          ownShipObject.x,
          ownShipObject.y,
          ownShipObject.xDimension,
          ownShipObject.yDimension
        );
      } else if (rightPressed) {
        ctx.drawImage(
          ownShipRight,
          ownShipObject.x,
          ownShipObject.y,
          ownShipObject.xDimension,
          ownShipObject.yDimension
        );
      } else {
        ctx.drawImage(
          ownShip,
          ownShipObject.x,
          ownShipObject.y,
          ownShipObject.xDimension,
          ownShipObject.yDimension
        );
      }
    } else {
      drawGameOver();
    }
  }

  //perform actions on own ship
  function ownShipAction() {
    if (
      rightPressed &&
      ownShipObject.x < canvas.width - ownShipObject.xDimension
    ) {
      ownShipObject.x += ownShipObject.xSpeed;
    }
    if (leftPressed && ownShipObject.x > 0) {
      ownShipObject.x -= ownShipObject.xSpeed;
    }
    if (upPressed && ownShipObject.y > 0) {
      ownShipObject.y -= ownShipObject.ySpeed;
    }
    if (
      downPressed &&
      ownShipObject.y < canvas.height - ownShipObject.yDimension
    ) {
      ownShipObject.y += ownShipObject.ySpeed;
    }
    if (spacebarPressed) {
      if (!shotAwaiting) {
        fireShot();
        shotAwaiting = true;
        setTimeout(finishedReloading, shotInterval);
      }
    }
  }

  //adds a shot to the list to be drawn
  function fireShot() {
    ownShotArray.push({
      x:
        ownShipObject.x + (ownShipObject.xDimension - OWN_SHOT_X_DIMENSION) / 2,
      y: ownShipObject.y,
      xDimension: OWN_SHOT_X_DIMENSION,
      yDimension: OWN_SHOT_Y_DIMENSION,
      xSpeed: OWN_SHOT_X_SPEED,
      ySpeed: OWN_SHOT_Y_SPEED,
      exist: true,
    });
  }

  //after waiting a certain period of time, the ship can fire again
  function finishedReloading() {
    shotAwaiting = false;
  }

  //draw enemy spaceships
  function drawProjectiles(projectileArray, projectileType) {
    for (let i = 0; i < projectileArray.length; i++) {
      let obj = projectileArray[i];
      obj.y += obj.ySpeed;
      obj.x += obj.xSpeed;
      ctx.drawImage(
        projectileType,
        obj.x,
        obj.y,
        obj.xDimension,
        obj.yDimension
      );
      if (obj.y > canvas.height * 3 || obj.y < -200) {
        obj.exist = false;
      }
      projectileArray[i] = obj;
    }
    let tempArray = [];
    for (let i = 0; i < projectileArray.length; i++) {
      if (projectileArray[i].exist) {
        tempArray.push(projectileArray[i]);
      }
    }
    //can work on this part
    if (projectileType == ownShot) {
      ownShotArray = tempArray;
    } else if (projectileType == enemyShip) {
      enemyShipArray = tempArray;
    } else if (projectileType == enemyShot) {
      enemyShotArray = tempArray;
    } else if (projectileType == powerUp) {
      powerUpArray = tempArray;
    }
  }

  //updates the enemy ship movements and firing, as well as spawns enemies at random intervals
  function enemyShipActions() {
    if (!enemyShipSpawnAwaiting) {
      spawnEnemyShip();
      enemyShipSpawnAwaiting = true;
      setTimeout(
        finishedAwaitingSpawn,
        Math.random() * ENEMY_SHIP_SPAWN_TIMEOUT_MS
      );
    }
    fireEnemyShots();
    for (let i = 0; i < enemyShipArray.length; i++) {
      if (checkProbability(ENEMY_SHIP_CHECK_DIRECTION_PROBABILITY)) {
        enemyShipArray[i].xSpeed = -1 * ENEMY_SHIP_DEFAULT_X_SPEED;
      } else if (checkProbability(ENEMY_SHIP_CHECK_DIRECTION_PROBABILITY)) {
        enemyShipArray[i].xSpeed = -2 * ENEMY_SHIP_DEFAULT_X_SPEED;
      } else if (checkProbability(ENEMY_SHIP_CHECK_DIRECTION_PROBABILITY)) {
        enemyShipArray[i].ySpeed = Math.random() * ENEMY_SHIP_DEFAULT_Y_SPEED;
      }
    }

    if (enemyBossExist && enemyBoss != null) {
      drawEnemyBossHealth();
      ctx.drawImage(
        enemyBoss1,
        enemyBoss.x,
        enemyBoss.y,
        enemyBoss.xDimension,
        enemyBoss.yDimension
      );
      fireEnemyBossShots();
      if (checkProbability(ENEMY_BOSS_CHECK_DIRECTION_PROBABILITY)) {
        enemyBoss.xSpeed *= -1;
      }
    } else {
      if (checkProbability(ENEMY_BOSS_SPAWN_PROBABILITY)) {
        spawnEnemyBoss();
      }
    }
  }

  //spawn an enemy at a random spot
  function spawnEnemyShip() {
    enemyShipArray.push({
      x: Math.max(Math.random() * canvas.width - ENEMY_SHIP_X_DIMENSION, 0),
      y: 30 + Math.random() * 20,
      xDimension: ENEMY_SHIP_X_DIMENSION,
      yDimension: ENEMY_SHIP_Y_DIMENSION,
      xSpeed: ENEMY_SHIP_DEFAULT_X_SPEED,
      ySpeed: ENEMY_SHIP_DEFAULT_Y_SPEED,
      exist: true,
    });
  }

  function spawnEnemyBoss() {
    enemyBossHealth = 200;
    enemyBossExist = true;
    enemyBoss = {
      x: Math.max(Math.random() * canvas.width - ENEMY_BOSS_X_DIMENSION, 0),
      y: 10 + Math.random() * 5,
      xDimension: ENEMY_BOSS_X_DIMENSION,
      yDimension: ENEMY_BOSS_Y_DIMENSION,
      xSpeed: ENEMY_BOSS_DEFAULT_X_SPEED,
      ySpeed: ENEMY_BOSS_DEFAULT_Y_SPEED,
      exist: true,
    };
    ctx.drawImage(
      enemyBoss1,
      enemyBoss.x,
      enemyBoss.y,
      enemyBoss.xDimension,
      enemyBoss.yDimension
    );
  }

  //allow computer to spawn another enemy after a set amount of time
  function finishedAwaitingSpawn() {
    enemyShipSpawnAwaiting = false;
  }

  function fireEnemyShots() {
    for (let i = 0; i < enemyShipArray.length; i++) {
      if (checkProbability(ENEMY_SHIP_FIRE_SHOT_PROBABILITY)) {
        enemyShotArray.push({
          x:
            enemyShipArray[i].x +
            (enemyShipArray[i].xDimension - ENEMY_SHOT_X_DIMENSION) / 2,
          y: enemyShipArray[i].y,
          xDimension: ENEMY_SHOT_X_DIMENSION,
          yDimension: ENEMY_SHOT_Y_DIMENSION,
          xSpeed: ENEMY_SHOT_X_SPEED,
          ySpeed: ENEMY_SHOT_Y_SPEED,
          exist: true,
        });
      }
    }
  }

  //allows enemies to fire again
  function finishedFiringEnemyShots() {
    enemyFiring = false;
  }

  //returns shot interval for own ship to default
  function resetShotInterval() {
    shotInterval = DEFAULT_SHOT_INTERVAL;
  }

  //identify any collisions that exist between any objects that can destroy each other
  //one hit one kill for now
  function detectCollision() {
    for (let i = 0; i < enemyShipArray.length; i++) {
      for (let j = 0; j < ownShotArray.length; j++) {
        if (checkCollision(ownShotArray[j], enemyShipArray[i])) {
          enemyShipArray[i].exist = false;
          explosionArray.push([enemyShipArray[i], 0]);
          ownShotArray[j].exist = false;
          score += ENEMY_SHIP_DESTROY_SCORE;
        }
      }
      if (checkCollision(ownShipObject, enemyShipArray[i])) {
        enemyShipArray[i].exist = false;
        explosionArray.push([enemyShipArray[i], 0]);
        reduceHealth(50);
      }
      if (
        enemyShipArray[i].x <= 0 ||
        enemyShipArray[i].x >= canvas.width - ENEMY_SHIP_X_DIMENSION
      ) {
        enemyShipArray[i].xSpeed *= -1;
      }
    }
    for (let i = 0; i < enemyShotArray.length; i++) {
      if (checkCollision(ownShipObject, enemyShotArray[i])) {
        enemyShotArray[i].exist = false;
        reduceHealth(30);
      }
    }
    for (let i = 0; i < powerUpArray.length; i++) {
      if (checkCollision(ownShipObject, powerUpArray[i])) {
        shotInterval = ENHANCED_SHOT_INTERVAL;
        clearTimeout(powerUpTimeoutId);
        powerUpTimeoutId = setTimeout(resetShotInterval, POWER_UP_DURATION_MS);
        powerUpArray[i].exist = false;
      }
    }
    if (enemyBossExist && enemyBoss != null) {
      if (
        enemyBoss.x <= 0 ||
        enemyBoss.x >= canvas.width - ENEMY_BOSS_X_DIMENSION
      ) {
        enemyBoss.xSpeed *= -1;
      }
      if (checkCollision(ownShipObject, enemyBoss)) {
        reduceHealth(1);
      }
      for (let j = 0; j < ownShotArray.length; j++) {
        if (checkCollision(ownShotArray[j], enemyBoss)) {
          enemyBossHealth -= ENEMY_BOSS_DAMAGE_TAKEN_PER_SHOT;
          ownShotArray[j].exist = false;
          if (enemyBossHealth <= 0) {
            enemyBossHealth = 0;
            enemyBossExist = false;
            explosionArray.push([enemyBoss, 0]);
            score += ENEMY_BOSS_DESTROY_SCORE;
          }
        }
      }
    }
  }

  //own ship takes damage
  function reduceHealth(damageTaken) {
    health -= damageTaken;
    if (health <= 0) {
      health = 0;
      explosionArray.push([
        {
          x: ownShipObject.x,
          y: ownShipObject.y,
          xDimension: ownShipObject.xDimension,
          yDimension: ownShipObject.yDimension,
          xSpeed: ownShipObject.xSpeed,
          ySpeed: ownShipObject.ySpeed,
          exist: ownShipObject.exist,
        },
        0,
      ]);
      if (lives > 0) {
        lives -= 1;
        health = DEFAULT_HEALTH;
        ownShipObject.x = (window.innerWidth - OWN_SHIP_X_DIMENSION) / 2;
        ownShipObject.y = window.innerHeight - OWN_SHIP_Y_DIMENSION - 20;
      } else {
        ownShipObject.exist = false;
      }
    }
  }

  //helper function to check for collision
  function checkCollision(objA, objB) {
    return (
      objA.x + objA.xDimension >= objB.x &&
      objA.x <= objB.x + objB.xDimension &&
      objA.y + objA.yDimension >= objB.y &&
      objA.y <= objB.y + objB.yDimension
    );
  }

  //print words GAME OVER
  function drawGameOver() {
    ctx.font = "50px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText(
      "GAME OVER",
      (canvas.width - 340) / 2,
      (canvas.height - 20) / 2
    );
    ctx.font = "30px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText(
      "Press r to restart",
      (canvas.width - 260) / 2,
      (canvas.height + 100) / 2
    );
    gameOver = true;
  }

  //animate the explosion sprite
  function animateExplosion() {
    let tempExplosionArray = [];
    for (let i = 0; i < explosionArray.length; i++) {
      let obj = explosionArray[i][0];
      ctx.drawImage(
        explosion,
        EXPLOSION_WIDTH * explosionArray[i][1],
        0,
        EXPLOSION_WIDTH,
        EXPLOSION_HEIGHT,
        obj.x + obj.xDimension * 0.125,
        obj.y + obj.yDimension * 0.125,
        0.75 * obj.xDimension,
        0.75 * obj.yDimension
      );
      explosionArray[i][1] += 1;
      if (explosionArray[i][1] < totalFrames) {
        tempExplosionArray.push(explosionArray[i]);
      }
    }
    explosionArray = tempExplosionArray;
  }

  //starts a new game
  function resetGame() {
    ownShipObject = { ...ORIGINAL_OWN_SHIP_OBJECT };
    lives = NUM_INITIAL_LIVES;
    health = DEFAULT_HEALTH;
    score = 0;
    gameOver = false;
    enemyBoss = undefined;
    enemyShipArray = [];
    ownShotArray = [];
    enemyShotArray = [];
    powerUpArray = [];
    explosionArray = [];
    draw();
  }

  //handles keydown events
  function keyDownHandler(e) {
    if (e.keyCode == RIGHT_CURSOR_KEY_CODE) {
      rightPressed = true;
    }
    if (e.keyCode == LEFT_CURSOR_KEY_CODE) {
      leftPressed = true;
    }
    if (e.keyCode == UP_CURSOR_KEY_CODE) {
      upPressed = true;
    }
    if (e.keyCode == DOWN_CURSOR_KEY_CODE) {
      downPressed = true;
    }
    if (e.keyCode == SPACEBAR_KEY_CODE) {
      spacebarPressed = true;
    }
    if (e.keyCode == R_KEY_CODE && gameOver) {
      resetGame();
    }
  }

  //handles keyup events
  function keyUpHandler(e) {
    if (e.keyCode == RIGHT_CURSOR_KEY_CODE) {
      rightPressed = false;
    }
    if (e.keyCode == LEFT_CURSOR_KEY_CODE) {
      leftPressed = false;
    }
    if (e.keyCode == UP_CURSOR_KEY_CODE) {
      upPressed = false;
    }
    if (e.keyCode == DOWN_CURSOR_KEY_CODE) {
      downPressed = false;
    }
    if (e.keyCode == SPACEBAR_KEY_CODE) {
      spacebarPressed = false;
    }
  }

  // takes in probability in [0,1] and checks if it passes
  function checkProbability(probabilty) {
    return Math.random() * 1000 < probabilty * 1000;
  }

  draw();
});
