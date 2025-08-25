export class Starfield {
  constructor(canvasWidth, canvasHeight, numStars = 60) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      s: Math.random() * 2 + 1,
      v: Math.random() * 0.5 + 0.2
    }));
  }

  update() {
    this.stars.forEach(star => {
      star.y += star.v;
      if (star.y > this.canvasHeight) {
        star.y = 0;
        star.x = Math.random() * this.canvasWidth;
      }
    });
  }

  draw(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    ctx.fillStyle = "white";
    this.stars.forEach(star => ctx.fillRect(star.x, star.y, star.s, star.s));
  }
}
