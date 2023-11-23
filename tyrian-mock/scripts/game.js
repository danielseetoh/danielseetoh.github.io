document.addEventListener("DOMContentLoaded", function (event) {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  //initialize background
  //background repetition isn't seamless right now
  var vx = 0;
  var vy = 0;
  var background = new Image();
  background.src = "img/background.jpg";
  var score = 0;
  var health = 100;
  var lives = 3;
  var gameOver = false;

  //initialize explosions
  var tickCount = 0;
  var explosionArray = [];
  var tempExplosionArray = [];
  var shift = 0;
  var explosionWidth = 40;
  var explosionHeight = 40;
  var totalFrames = 7;
  var currentFrame = 0;
  var explosion = new Image();
  explosion.src = "sprite/particle_largeBall1.png";

  //Projectile Prototype
  function Projectile(x, y, xDimension, yDimension, xSpeed, ySpeed, exist) {
    this.x = x;
    this.y = y;
    this.xDimension = xDimension;
    this.yDimension = yDimension;
    this.ySpeed = ySpeed;
    this.xSpeed = xSpeed;
    this.exist = exist;
  }

  //ownShip attributes
  var ownShipXDimension = 50;
  var ownShipYDimension = 50;
  var firing;
  var shotInterval = 300;
  var ownShip = new Image();
  ownShip.src = "img/ownShip.png";
  var ownShipLeft = new Image();
  ownShipLeft.src = "img/ownShipLeft.png";
  var ownShipRight = new Image();
  ownShipRight.src = "img/ownShipRight.png";

  //initialize own ship
  var ownShipObject = new Projectile(
    (window.innerWidth - ownShipXDimension) / 2,
    window.innerHeight - ownShipYDimension - 20,
    50,
    50,
    7,
    7,
    true
  );

  //ownShot attributes
  var ownShotArray = [];
  var ownShotYSpeed = -10;
  var ownShotXSpeed = 0;
  var ownShotXDimension = 20;
  var ownShotYDimension = 20;
  var shotAwaiting = false;
  var ownShot = new Image();
  ownShot.src = "img/ownShot.png";

  //enemyShip attributes
  var enemyShipArray = [];
  var enemyShipXDimension = 75;
  var enemyShipYDimension = 100;
  var enemyShipSpawnAwaiting = false;
  var enemyShipYSpeed = 1.6;
  var enemyShipXSpeed = 1;
  var enemyFiring = false;
  var enemyShip = new Image();
  enemyShip.src = "img/enemy1.png";

  //enemyShot attributes
  var enemyShotArray = [];
  var enemyShotXDimension = 20;
  var enemyShotYDimension = 20;
  var enemyShotYSpeed = 3;
  var enemyShotXSpeed = 0;
  var enemyShot = new Image();
  enemyShot.src = "img/enemyShot1.png";

  //enemyBoss attributes
  var enemyBoss;
  var enemyBossExist = false;
  var enemyBossXDimension = 250;
  var enemyBossYDimension = 250;
  var enemyBossYSpeed = 0;
  var enemyBossXSpeed = -1;
  var enemyBossHealth = 200;
  var enemyBoss1 = new Image();
  enemyBoss1.src = "img/enemyBoss1.png";

  //powerup
  var powerUpArray = [];
  var powerUpXDimension = 40;
  var powerUpYDimension = 40;
  var powerUpYSpeed = 3.5;
  var powerUpXSpeed = 0;
  var powerUp = new Image();
  powerUp.src = "img/powerup.png";

  //controls
  var rightPressed = false;
  var leftPressed = false;
  var upPressed = false;
  var downPressed = false;
  var spacebarPressed = false;

  //general variables
  var rightCursorKeyCode = 39;
  var leftCursorKeyCode = 37;
  var upCursorKeyCode = 38;
  var downCursorKeyCode = 40;
  var spacebarKeyCode = 32;
  var tempArray = [];

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
    if (Math.random() * 1000 > 999) {
      powerUpArray.push(
        new Projectile(
          Math.random() * canvas.width - powerUpXDimension,
          20 + Math.random() * 10,
          powerUpXDimension,
          powerUpYDimension,
          powerUpXSpeed,
          powerUpYSpeed,
          true
        )
      );
    }
  }

  //fires enemy shots based on boss firing rate
  function fireEnemyBossShots() {
    if (Math.random() * 1000 > 960) {
      enemyShotArray.push(
        new Projectile(
          enemyBoss.x + (enemyBoss.xDimension - enemyShotXDimension) / 3,
          enemyBoss.y + enemyBossYDimension,
          enemyShotXDimension,
          enemyShotYDimension,
          enemyShotXSpeed,
          enemyShotYSpeed,
          true
        )
      );
      enemyShotArray.push(
        new Projectile(
          enemyBoss.x + ((enemyBoss.xDimension - enemyShotXDimension) * 2) / 3,
          enemyBoss.y + enemyBossYDimension,
          enemyShotXDimension,
          enemyShotYDimension,
          enemyShotXSpeed,
          enemyShotYSpeed,
          true
        )
      );
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
    if (enemyBossExist) {
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
      //alert('GAME OVER');
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
    ownShotArray.push(
      new Projectile(
        ownShipObject.x + (ownShipObject.xDimension - ownShotXDimension) / 2,
        ownShipObject.y,
        ownShotXDimension,
        ownShotYDimension,
        ownShotXSpeed,
        ownShotYSpeed,
        true
      )
    );
  }

  //after waiting a certain period of time, the ship can fire again
  function finishedReloading() {
    shotAwaiting = false;
  }

  //draw enemy spaceships
  function drawProjectiles(projectileArray, projectileType) {
    for (var i = 0; i < projectileArray.length; i++) {
      var obj = projectileArray[i];
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
    tempArray = [];
    for (var i = 0; i < projectileArray.length; i++) {
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
      setTimeout(finishedAwaitingSpawn, Math.random() * 4500);
    }
    if (!enemyFiring) {
      fireEnemyShots();
      enemyFiring = true;
      setTimeout(finishedFiringEnemyShots, Math.random() * 2500);
    }
    for (var i = 0; i < enemyShipArray.length; i++) {
      if (Math.floor(Math.random() * 1000 > 995)) {
        enemyShipArray[i].xSpeed = -1 * enemyShipXSpeed;
      } else if (Math.floor(Math.random() * 1000 > 995)) {
        enemyShipArray[i].xSpeed = -2 * enemyShipXSpeed;
      } else if (Math.floor(Math.random() * 1000 > 995)) {
        enemyShipArray[i].ySpeed = Math.random() * enemyShipYSpeed;
      }
    }

    if (enemyBossExist) {
      drawEnemyBossHealth();
      ctx.drawImage(
        enemyBoss1,
        enemyBoss.x,
        enemyBoss.y,
        enemyBoss.xDimension,
        enemyBoss.yDimension
      );
      fireEnemyBossShots();
      if (Math.floor(Math.random() * 1000 > 995)) {
        enemyBoss.xSpeed *= -1;
      }
    } else {
      if (Math.random() * 10000 > 9990) {
        spawnEnemyBoss();
      }
    }
  }

  //spawn an enemy at a random spot
  function spawnEnemyShip() {
    enemyShipArray.push(
      new Projectile(
        Math.max(Math.random() * canvas.width - enemyShipXDimension, 0),
        30 + Math.random() * 20,
        enemyShipXDimension,
        enemyShipYDimension,
        enemyShipXSpeed,
        enemyShipYSpeed,
        true
      )
    );
  }

  function spawnEnemyBoss() {
    enemyBossExist = true;
    enemyBossHealth = 200;
    enemyBoss = new Projectile(
      Math.max(Math.random() * canvas.width - enemyBossXDimension, 0),
      10 + Math.random() * 5,
      enemyBossXDimension,
      enemyBossYDimension,
      enemyBossXSpeed,
      enemyBossYSpeed,
      true
    );
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
    for (var i = 0; i < enemyShipArray.length; i++) {
      if (Math.random() > 0.4) {
        enemyShotArray.push(
          new Projectile(
            enemyShipArray[i].x +
              (enemyShipArray[i].xDimension - enemyShotXDimension) / 2,
            enemyShipArray[i].y,
            enemyShotXDimension,
            enemyShotYDimension,
            enemyShotXSpeed,
            enemyShotYSpeed,
            true
          )
        );
      }
    }
  }

  //allows enemies to fire again
  function finishedFiringEnemyShots() {
    enemyFiring = false;
  }

  //returns shot interval for own ship to 300
  function resetShotInterval() {
    shotInterval = 300;
  }

  //identify any collisions that exist between any objects that can destroy each other
  //one hit one kill for now
  function detectCollision() {
    for (var i = 0; i < enemyShipArray.length; i++) {
      for (var j = 0; j < ownShotArray.length; j++) {
        if (checkCollision(ownShotArray[j], enemyShipArray[i])) {
          enemyShipArray[i].exist = false;
          explosionArray.push([enemyShipArray[i], 0]);
          ownShotArray[j].exist = false;
          score += 400;
        }
      }
      if (checkCollision(ownShipObject, enemyShipArray[i])) {
        enemyShipArray[i].exist = false;
        explosionArray.push([enemyShipArray[i], 0]);
        reduceHealth(50);
      }
      if (
        enemyShipArray[i].x <= 0 ||
        enemyShipArray[i].x >= canvas.width - enemyShipXDimension
      ) {
        enemyShipArray[i].xSpeed *= -1;
      }
    }
    for (var i = 0; i < enemyShotArray.length; i++) {
      if (checkCollision(ownShipObject, enemyShotArray[i])) {
        enemyShotArray[i].exist = false;
        reduceHealth(30);
      }
    }
    for (var i = 0; i < powerUpArray.length; i++) {
      if (checkCollision(ownShipObject, powerUpArray[i])) {
        shotInterval = 120;
        setTimeout(resetShotInterval, 8000);
        powerUpArray[i].exist = false;
      }
    }
    if (enemyBossExist) {
      if (
        enemyBoss.x <= 0 ||
        enemyBoss.x >= canvas.width - enemyBossXDimension
      ) {
        enemyBoss.xSpeed *= -1;
      }
      if (checkCollision(ownShipObject, enemyBoss)) {
        reduceHealth(1);
      }
      for (var j = 0; j < ownShotArray.length; j++) {
        if (checkCollision(ownShotArray[j], enemyBoss)) {
          enemyBossHealth -= 4;
          ownShotArray[j].exist = false;
          if (enemyBossHealth <= 0) {
            enemyBossHealth = 0;
            enemyBossExist = false;
            explosionArray.push([enemyBoss, 0]);
            score += 3500;
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
        new Projectile(
          ownShipObject.x,
          ownShipObject.y,
          ownShipObject.xDimension,
          ownShipObject.yDimension,
          ownShipObject.xSpeed,
          ownShipObject.ySpeed,
          ownShipObject.exist
        ),
        0,
      ]);
      if (lives > 0) {
        lives -= 1;
        health = 100;
        ownShipObject.x = (window.innerWidth - ownShipXDimension) / 2;
        ownShipObject.y = window.innerHeight - ownShipYDimension - 20;
      } else {
        ownShipObject.exist = false;
      }
    }
  }

  //helper function to check for collision
  function checkCollision(objA, objB) {
    if (
      objA.x + objA.xDimension >= objB.x &&
      objA.x <= objB.x + objB.xDimension &&
      objA.y + objA.yDimension >= objB.y &&
      objA.y <= objB.y + objB.yDimension
    ) {
      return true;
    } else {
      return false;
    }
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
    tempExplosionArray = [];
    for (var i = 0; i < explosionArray.length; i++) {
      var obj = explosionArray[i][0];
      ctx.drawImage(
        explosion,
        explosionWidth * explosionArray[i][1],
        0,
        explosionWidth,
        explosionHeight,
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
    tempExplosionArray = [];
  }

  //starts a new game
  function resetGame() {
    ownShipObject = new Projectile(
      (window.innerWidth - ownShipXDimension) / 2,
      window.innerHeight - ownShipYDimension - 20,
      50,
      50,
      7,
      7,
      true
    );
    lives = 3;
    health = 100;
    score = 0;
    gameOver = false;
    enemyBossExist = false;
    enemyShipArray = [];
    ownShotArray = [];
    enemyShotArray = [];
    powerUpArray = [];
    explosionArray = [];
    tempArray = [];
    draw();
  }

  //handles keydown events
  function keyDownHandler(e) {
    if (e.keyCode == rightCursorKeyCode) {
      rightPressed = true;
    }
    if (e.keyCode == leftCursorKeyCode) {
      leftPressed = true;
    }
    if (e.keyCode == upCursorKeyCode) {
      upPressed = true;
    }
    if (e.keyCode == downCursorKeyCode) {
      downPressed = true;
    }
    if (e.keyCode == spacebarKeyCode) {
      spacebarPressed = true;
    }
    if (e.keyCode == 82 && gameOver) {
      resetGame();
    }
  }

  //handles keyup events
  function keyUpHandler(e) {
    if (e.keyCode == rightCursorKeyCode) {
      rightPressed = false;
    }
    if (e.keyCode == leftCursorKeyCode) {
      leftPressed = false;
    }
    if (e.keyCode == upCursorKeyCode) {
      upPressed = false;
    }
    if (e.keyCode == downCursorKeyCode) {
      downPressed = false;
    }
    if (e.keyCode == spacebarKeyCode) {
      spacebarPressed = false;
    }
  }

  draw();
});
