export class Alien {
  constructor(x, y, width = 30, height = 20, speed = 1) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = 1; // 1 right, -1 left
    this.color = "white";
  }

  update(canvasWidth) {
    this.x += this.speed * this.direction;
    if (this.x <= 0 || this.x + this.width >= canvasWidth) {
      this.direction *= -1;
      this.y += 20; // step down
      // nudge back inside bounds to avoid getting stuck on edge
      if (this.x < 0) this.x = 0;
      if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
