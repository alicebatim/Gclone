import { Bullet } from "./Bullet.js";

export class Player {
  constructor(x, y, width = 40, height = 20, speed = 5) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.color = "lime";
    this.bullets = [];
    this.shootCooldown = 180; // ms between shots
    this._lastShotAt = 0;
    this.invulnerableUntil = 0; // ms timestamp
  }

  move(keys, canvasWidth) {
    if (keys["ArrowLeft"] || keys["a"]) this.x -= this.speed;
    if (keys["ArrowRight"] || keys["d"]) this.x += this.speed;
    // clamp
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
  }

  tryShoot(nowMs) {
    if (nowMs - this._lastShotAt < this.shootCooldown) return;
    this._lastShotAt = nowMs;
    this.bullets.push(new Bullet(
      this.x + this.width / 2 - 2,
      this.y - 2,
      -7 // upward
    ));
  }

  updateBullets(canvasHeight) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.update();
      if (b.y + b.height < 0 || b.y > canvasHeight) {
        this.bullets.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Blink while invulnerable
    if (performance.now() < this.invulnerableUntil) {
      ctx.strokeStyle = "lime";
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    }

    this.bullets.forEach(b => b.draw(ctx));
  }
}
