export class Boss {
  constructor(game) {
    this.game = game;
    this.width = 200;
    this.height = 200;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = -this.height;
    this.speedX = Math.random() < 0.5 ? -1 : 1;
    this.speedY = 0;
    this.lives = 10;
    this.maxLives = this.lives;
    this.markedForDeletion = false;
    this.image = document.getElementById('boss');
    this.frameX = 1;
    this.frameY = Math.floor(Math.random() * 4);
    this.maxFrame = 11;
  }
  draw(context) {
    let sourceX = this.frameX * this.width;
    let sourceY = this.frameY * this.height;
    const sourceWidth = this.width;
    const sourceHeight = this.height;
    context.drawImage(
      this.image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    context.save();
    context.textAlign = 'center';
    context.shadowOffsetX = 3;
    context.shadowOffsetY = 3;
    context.shadowColor = 'black';
    context.fillText(this.lives, this.x + this.width * 0.5, this.y + 50);
    context.restore();
  }
  update() {
    this.speedY = 0;
    if (this.y < 0) this.y += 4;
    if (this.x < 0 || this.x > this.game.width - this.width) {
      this.speedX *= -1;
      this.speedY = this.height * 0.5;
    }
    this.speedX += this.speedX;
    this.speedY += this.speedY;
  }
}
