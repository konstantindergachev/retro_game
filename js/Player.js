export class Player {
  constructor(game) {
    this.game = game;
    this.width = 140;
    this.height = 120;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 5;
    this.lives = 3;
    this.maxLives = 10;
    this.image = document.getElementById('player');
    this.image_jets = document.getElementById('player_jets');
    this.frameX = 0;
    this.jetsFrame = 1;
  }

  draw(context) {
    //handle sprite frames
    if (this.game.keys.includes('1')) {
      this.frameX = 1;
    } else {
      this.frameX = 0;
    }
    let jetsSourceX = this.jetsFrame * this.width;
    let sourceY = 0;
    const sourceWidth = this.width;
    const sourceHeight = this.height;
    context.drawImage(
      this.image_jets,
      jetsSourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    let sourceX = this.frameX * this.width;
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
  }
  update() {
    //horizontal movement
    if (this.game.keys.includes('ArrowLeft')) {
      this.x -= this.speed;
      this.jetsFrame = 0;
    } else if (this.game.keys.includes('ArrowRight')) {
      this.x += this.speed;
      this.jetsFrame = 2;
    } else {
      this.jetsFrame = 1;
    }

    //horizontal boundaries
    if (this.x < -this.width * 0.5) this.x = -this.width * 0.5;
    else if (this.x > this.game.width - this.width * 0.5)
      this.x = this.game.width - this.width * 0.5;
  }
  shoot() {
    const projectile = this.game.getProjectile();
    if (projectile) projectile.start(this.x + this.width * 0.5, this.y);
  }
  restart() {
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.lives = 3;
  }
}