export class Bullet {
  constructor(x, y, speed, width = 4, height = 10, color = "red") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed; // negative = up, positive = down
    this.color = color;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  collidesWith(entity) {
    return (
      this.x < entity.x + entity.width &&
      this.x + this.width > entity.x &&
      this.y < entity.y + entity.height &&
      this.y + this.height > entity.y
    );
  }
}
