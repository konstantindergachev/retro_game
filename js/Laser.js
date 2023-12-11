class Laser {
  constructor(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.height = this.game.height - 50;
  }
  render(context) {
    this.x = this.game.player.x + this.game.player.width * 0.5 - this.width * 0.5;

    context.save();
    context.fillStyle = 'gold';
    context.fillRect(this.x, this.y, this.width, this.height);
    context.restore();
  }
}
export class SmallLaser extends Laser {
  constructor(game) {
    super(game);
    this.width = 5;
  }
  render(context) {
    super.render(context);
  }
}
export class BigLaser extends Laser {}
