const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const popSound = document.getElementById('popSound');
const shootSound = document.getElementById('shootSound');
const powerupSound = document.getElementById('powerupSound');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

// Mobile controls
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');

let score = 0;
let level = 1;
let bullets = [];
let balloons = [];
let powerups = [];
let bulletSpeed = 5;
let multiShot = false;
let gameInterval;
let balloonInterval;
let powerupInterval;
let isRunning = false;

// Start / Stop
startBtn.addEventListener('click', () => {
  if(!isRunning){
    isRunning = true;
    gameInterval = requestAnimationFrame(update);
    createBalloon();
    createPowerup();
  }
});
stopBtn.addEventListener('click', () => {
  isRunning = false;
  cancelAnimationFrame(gameInterval);
  clearTimeout(balloonInterval);
  clearTimeout(powerupInterval);
});

// Mobile touch controls
leftBtn.addEventListener('touchstart', () => movePlayer(-1));
rightBtn.addEventListener('touchstart', () => movePlayer(1));
shootBtn.addEventListener('touchstart', shoot);

// Keyboard controls
document.addEventListener('keydown', e => {
  if(!isRunning) return;
  const left = player.offsetLeft;
  if(e.code === 'ArrowLeft') player.style.left = Math.max(0, left - 20) + 'px';
  if(e.code === 'ArrowRight') player.style.left = Math.min(game.offsetWidth - player.offsetWidth, left + 20) + 'px';
  if(e.code === 'Space') shoot();
});

// Player movement function
function movePlayer(direction) {
  const left = player.offsetLeft;
  const moveAmount = 20;
  if(direction === -1) player.style.left = Math.max(0, left - moveAmount) + 'px';
  if(direction === 1) player.style.left = Math.min(game.offsetWidth - player.offsetWidth, left + moveAmount) + 'px';
}

// Shoot
function shoot() {
  shootSound.play();
  if(multiShot) {
    createBullet(-15);
    createBullet(0);
    createBullet(15);
  } else {
    createBullet(0);
  }
}
function createBullet(offsetX) {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = (player.offsetLeft + player.offsetWidth/2 - 5 + offsetX) + 'px';
  bullet.style.bottom = '70px';
  game.appendChild(bullet);
  bullets.push(bullet);
}

// Balloons
function createBalloon() {
  if(!isRunning) return;
  const balloon = document.createElement('div');
  balloon.classList.add('balloon');
  balloon.style.left = Math.random() * (game.offsetWidth - 40) + 'px';
  balloon.style.bottom = '-60px';
  balloon.style.backgroundColor = ['red','blue','green','yellow','pink','purple'][Math.floor(Math.random()*6)];
  game.appendChild(balloon);
  balloons.push(balloon);

  // Next balloon
  let speed = Math.max(1000 - level*100, 300);
  balloonInterval = setTimeout(createBalloon, speed);
}

// Power-ups
function createPowerup() {
  if(!isRunning) return;
  const power = document.createElement('div');
  power.classList.add('powerup');
  power.style.left = Math.random() * (game.offsetWidth - 30) + 'px';
  power.style.bottom = '-30px';
  game.appendChild(power);
  powerups.push(power);

  powerupInterval = setTimeout(createPowerup, 10000);
}

// Update loop
function update() {
  if(!isRunning) return;

  // Move balloons
  balloons.forEach((balloon, bIndex) => {
    balloon.style.bottom = parseInt(balloon.style.bottom) + 2 + level + 'px';
    if(parseInt(balloon.style.bottom) > game.offsetHeight) {
      game.removeChild(balloon);
      balloons.splice(bIndex,1);
    }
    // Collision bullets
    bullets.forEach((bullet, blIndex) => {
      if(checkCollision(bullet, balloon)) {
        popSound.play();
        createPopEffect(balloon.offsetLeft + 20, parseInt(balloon.style.bottom)+30);
        score += 10;
        updateScore();
        game.removeChild(balloon);
        game.removeChild(bullet);
        balloons.splice(bIndex,1);
        bullets.splice(blIndex,1);
      }
    });
  });

  // Move bullets
  bullets.forEach((bullet, index) => {
    bullet.style.bottom = parseInt(bullet.style.bottom) + bulletSpeed + 'px';
    if(parseInt(bullet.style.bottom) > game.offsetHeight) {
      game.removeChild(bullet);
      bullets.splice(index,1);
    }
  });

  // Move power-ups
  powerups.forEach((power, pIndex) => {
    power.style.bottom = parseInt(power.style.bottom) + 2 + level + 'px';
    if(parseInt(power.style.bottom) > game.offsetHeight) {
      game.removeChild(power);
      powerups.splice(pIndex,1);
    }
    if(checkCollision(power, player)) {
      powerupSound.play();
      multiShot = true;
      setTimeout(()=> multiShot = false, 5000);
      game.removeChild(power);
      powerups.splice(pIndex,1);
    }
  });

  // Level progression
  if(score >= level * 100) {
    level++;
    levelDisplay.textContent = "Nivel: " + level;
  }

  requestAnimationFrame(update);
}

// Collision detection
function checkCollision(a, b) {
  const rect1 = a.getBoundingClientRect();
  const rect2 = b.getBoundingClientRect();
  return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}

// Pop effect
function createPopEffect(x, y) {
  for(let i=0;i<5;i++){
    const pop = document.createElement('div');
    pop.classList.add('pop');
    pop.style.left = x + Math.random()*20 - 10 + 'px';
    pop.style.bottom = y + Math.random()*20 - 10 + 'px';
    pop.style.backgroundColor = ['red','blue','green','yellow','pink','purple'][Math.floor(Math.random()*6)];
    game.appendChild(pop);
    setTimeout(()=> game.removeChild(pop),500);
  }
}

// Update score
function updateScore() {
  scoreDisplay.textContent = 'Scor: ' + score;
  scoreDisplay.style.transform = 'scale(1.3)';
  setTimeout(()=> scoreDisplay.style.transform = 'scale(1)',100);
}
