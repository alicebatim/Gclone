import { Player } from "./entities/Player.js";
import { Alien } from "./entities/Alien.js";
import { Starfield } from "./entities/Starfield.js";
import { Bullet } from "./entities/Bullet.js";

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Canvas 2D context not available");
    return;
  }

  const keys = Object.create(null);
  const starfield = new Starfield(canvas.width, canvas.height);
  const player = new Player(canvas.width / 2 - 20, canvas.height - 40);
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const shootBtn = document.getElementById("shootBtn");

// Shared key state
function pressKey(key) { keys[key] = true; }
function releaseKey(key) { keys[key] = false; }

// Left
leftBtn.addEventListener("mousedown", e => pressKey("ArrowLeft"));
leftBtn.addEventListener("mouseup", e => releaseKey("ArrowLeft"));
leftBtn.addEventListener("mouseleave", e => releaseKey("ArrowLeft"));
leftBtn.addEventListener("touchstart", e => { e.preventDefault(); pressKey("ArrowLeft"); });
leftBtn.addEventListener("touchend", e => { e.preventDefault(); releaseKey("ArrowLeft"); });

// Right
rightBtn.addEventListener("mousedown", e => pressKey("ArrowRight"));
rightBtn.addEventListener("mouseup", e => releaseKey("ArrowRight"));
rightBtn.addEventListener("mouseleave", e => releaseKey("ArrowRight"));
rightBtn.addEventListener("touchstart", e => { e.preventDefault(); pressKey("ArrowRight"); });
rightBtn.addEventListener("touchend", e => { e.preventDefault(); releaseKey("ArrowRight"); });

// Shoot (fires once per press)
shootBtn.addEventListener("mousedown", e => player.tryShoot(performance.now()));
shootBtn.addEventListener("touchstart", e => { e.preventDefault(); player.tryShoot(performance.now()); });
// --- Mouse movement ---
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  player.x = mouseX - player.width / 2;

  // Keep player inside canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
});

// --- Mouse click to fire ---
canvas.addEventListener("mousedown", e => {
  player.tryShoot(performance.now());
});
  // Aliens
  const rows = 4;
  const cols = 8;
  let aliens = [];
  function createAliens() {
    aliens = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        aliens.push(new Alien(40 + c * 50, 50 + r * 35));
      }
    }
  }
  createAliens();

  // State
  let score = 0;
  let lives = 3;
  let gameOver = false;
  let paused = false;

  // Alien bullets
  const alienBullets = [];
  let lastAlienShotAt = 0;
  const alienShotCooldown = 450; // ms

  // Input
  window.addEventListener("keydown", (e) => {
    // prevent page scroll on arrows/space
    if (["ArrowLeft", "ArrowRight", " ", "Spacebar"].includes(e.key) || e.code === "Space") {
      e.preventDefault();
    }
    if (gameOver && e.key === "Enter") {
      window.location.reload();
      return;
    }
    if (e.key.toLowerCase() === "p") paused = !paused;

    keys[e.key] = true;
    if (!gameOver && !paused && (e.code === "Space" || e.key === " " || e.key === "Spacebar")) {
      player.tryShoot(performance.now());
    }
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  function update() {
    if (gameOver || paused) return;

    const now = performance.now();

    starfield.update();
    player.move(keys, canvas.width);
    player.updateBullets(canvas.height);

    // Dynamic alien speed: fewer aliens -> faster
    const base = 1;
    const boost = Math.max(0, 3 - aliens.length / 10);
    aliens.forEach(a => { a.speed = base + boost; a.update(canvas.width); });

    // Player bullets vs aliens — iterate backwards to splice safely
    for (let i = player.bullets.length - 1; i >= 0; i--) {
      const b = player.bullets[i];
      let hit = false;
      for (let j = aliens.length - 1; j >= 0; j--) {
        const a = aliens[j];
        if (b.collidesWith(a)) {
          aliens.splice(j, 1);
          player.bullets.splice(i, 1);
          score += 100;
          hit = true;
          break;
        }
      }
      if (hit) continue;
    }

    // Aliens shoot (cooldown + randomness)
    if (aliens.length > 0 && now - lastAlienShotAt >= alienShotCooldown) {
      if (Math.random() < 0.6) { // fairly active fire
        const shooter = aliens[Math.floor(Math.random() * aliens.length)];
        alienBullets.push(new Bullet(
          shooter.x + shooter.width / 2 - 2,
          shooter.y + shooter.height,
          4, 4, 10, "yellow"
        ));
      }
      lastAlienShotAt = now;
    }

    // Update alien bullets
    for (let i = alienBullets.length - 1; i >= 0; i--) {
      const b = alienBullets[i];
      b.update();
      if (b.y > canvas.height) {
        alienBullets.splice(i, 1);
        continue;
      }
      // Hit player?
      if (b.collidesWith(player)) {
        alienBullets.splice(i, 1);
        // Grant brief invulnerability to avoid instant multi-hit
        if (now >= player.invulnerableUntil) {
          lives -= 1;
          player.invulnerableUntil = now + 1000;
          if (lives <= 0) gameOver = true;
        }
      }
    }

    // Aliens reach player/bottom
    for (const a of aliens) {
      if (a.y + a.height >= player.y || rectOverlap(a, player)) {
        gameOver = true;
        break;
      }
    }

    // Wave cleared -> new wave + bonus life
    if (!gameOver && aliens.length === 0) {
      createAliens();
      lives += 1;
    }
  }

  function rectOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  function drawHUD() {
    ctx.fillStyle = "lime";
    ctx.font = "16px monospace";
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 20);

    if (paused) {
      ctx.fillStyle = "yellow";
      ctx.font = "20px monospace";
      ctx.fillText("PAUSED (press P)", canvas.width / 2 - 90, canvas.height / 2 - 20);
    }

    if (gameOver) {
      ctx.fillStyle = "red";
      ctx.font = "24px monospace";
      ctx.fillText("GAME OVER", canvas.width / 2 - 70, canvas.height / 2);
      ctx.font = "16px monospace";
      ctx.fillText("Press Enter to Restart", canvas.width / 2 - 100, canvas.height / 2 + 30);
    }
  }

  function draw() {
    // background first
    starfield.draw(ctx);

    // entities
    player.draw(ctx);
    aliens.forEach(a => a.draw(ctx));
    alienBullets.forEach(b => b.draw(ctx));

    // UI
    drawHUD();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }
  loop();
});
