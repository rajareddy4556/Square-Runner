const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const muteBtn = document.getElementById('muteBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const container = document.getElementById('gameContainer');

let width, height, scale;
function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  scale = width / 480; // base scale reference
  canvas.width = width * window.devicePixelRatio;
  canvas.height = height * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- Game variables ---
let player = { x: 50, y: height - 80, size: 20, velocityY: 0, jumping: false };
let obstacles = [];
let gameSpeed = 4;
let score = 0;
let gameRunning = true;
let lastObstacleTime = 0;

const gravity = 0.6;
const jumpPower = -12;
const obstacleInterval = 1500;

// --- Sounds ---
const bgMusic = new Audio('https://cdn.pixabay.com/download/audio/2022/10/12/audio_6d3ceefc6b.mp3?filename=8-bit-game-139886.mp3');
const jumpSound = new Audio('https://cdn.pixabay.com/download/audio/2021/09/01/audio_7fcd5b070e.mp3?filename=jump-145527.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;
bgMusic.play().catch(() => {});

let muted = false;
muteBtn.addEventListener('click', () => {
  muted = !muted;
  bgMusic.muted = muted;
  jumpSound.muted = muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
});

// --- Fullscreen feature ---
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(err => console.log(err));
  } else {
    document.exitFullscreen();
  }
});

// Re-adjust when fullscreen changes
document.addEventListener('fullscreenchange', resizeCanvas);

function jump() {
  if (!player.jumping) {
    player.velocityY = jumpPower;
    player.jumping = true;
    if (!muted) jumpSound.play();
  }
}

function spawnObstacle() {
  const obsHeight = 20 + Math.random() * 30;
  obstacles.push({ x: width, width: 20 * scale, height: obsHeight * scale });
}

function update() {
  player.velocityY += gravity;
  player.y += player.velocityY * scale;

  if (player.y + player.size * scale >= height - 30) {
    player.y = height - 30 - player.size * scale;
    player.velocityY = 0;
    player.jumping = false;
  }

  if (Date.now() - lastObstacleTime > obstacleInterval) {
    spawnObstacle();
    lastObstacleTime = Date.now();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= gameSpeed * scale;
    if (obs.x + obs.width < 0) obstacles.splice(i, 1);

    if (
      player.x * scale < obs.x + obs.width &&
      player.x * scale + player.size * scale > obs.x &&
      player.y + player.size * scale > height - obs.height - 30
    ) {
      gameRunning = false;
    }
  }

  if (gameRunning) {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    gameSpeed += 0.0008;
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, height - 30, width, 30);

  ctx.fillStyle = '#ff4b5c';
  ctx.fillRect(player.x * scale, player.y, player.size * scale, player.size * scale);

  ctx.fillStyle = '#00f5d4';
  for (let obs of obstacles) {
    ctx.fillRect(obs.x, height - obs.height - 30, obs.width, obs.height);
  }

  if (!gameRunning) {
    ctx.fillStyle = 'white';
    ctx.font = `${24 * scale}px Arial`;
    ctx.fillText('Game Over! Tap to Restart', width / 5, height / 2);
  }
}

function resetGame() {
  player.y = height - 80;
  player.velocityY = 0;
  obstacles = [];
  score = 0;
  gameSpeed = 4;
  gameRunning = true;
  loop();
}

function loop() {
  update();
  draw();
  if (gameRunning) requestAnimationFrame(loop);
}

document.addEventListener('touchstart', () => {
  if (gameRunning) jump();
  else resetGame();
});
document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    if (gameRunning) jump();
    else resetGame();
  }
});

loop();