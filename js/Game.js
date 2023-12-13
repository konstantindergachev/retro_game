import { Player } from './Player.js';
import { Wave } from './Wave.js';
import { Projectile } from './Projectale.js';
import { Boss } from './Boss.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = [];
    this.player = new Player(this);

    this.projectilesPool = [];
    this.numberOfProjectiles = 15;
    this.createProjectiles();
    this.fired = false;

    this.columns = 1;
    this.rows = 1;
    this.enemySize = 80;

    this.waves = [];
    this.waveCount = 1;

    this.spriteUpdate = false;
    this.spriteTimer = 0;
    this.spriteInterval = 150;

    this.score = 0;
    this.gameOver = false;

    this.bosses = [];
    this.bossLives = 10;
    this.restart();

    window.addEventListener('keydown', (ev) => {
      if (ev.key === '1' && !this.fired) this.player.shoot();
      this.fired = true;
      if (!this.keys.includes(ev.key)) this.keys.push(ev.key);
      if (ev.key === 'r' && this.gameOver) this.restart();
    });
    window.addEventListener('keyup', (ev) => {
      this.fired = false;
      const index = this.keys.indexOf(ev.key);
      if (index > -1) this.keys.splice(index, 1);
    });
  }

  render(context, deltaTime) {
    //sprite timing
    if (this.spriteTimer > this.spriteInterval) {
      this.spriteUpdate = true;
      this.spriteTimer = 0;
    } else {
      this.spriteUpdate = false;
      this.spriteTimer += deltaTime;
    }
    this.drawStatusText(context);
    this.projectilesPool.forEach((projectile) => {
      projectile.update();
      projectile.draw(context);
    });
    this.player.draw(context);
    this.player.update();
    this.bosses.forEach((boss) => {
      boss.draw(context);
      boss.update();
    });
    this.bosses = this.bosses.filter((boss) => !boss.markedForDeletion);
    this.waves.forEach((wave) => {
      wave.render(context);
      if (wave.enemies.length < 1 && !wave.nextWaveTrigger && !this.gameOver) {
        this.newWave();
        wave.nextWaveTrigger = true;
      }
    });
  }

  //create projectiles object pool
  createProjectiles() {
    for (let i = 0; i < this.numberOfProjectiles; i++) {
      this.projectilesPool.push(new Projectile());
    }
  }
  //get free projectile object from the pool
  getProjectile() {
    for (let i = 0; i < this.projectilesPool.length; i++) {
      if (this.projectilesPool[i].free) return this.projectilesPool[i];
    }
  }
  //collision detection between 2 rectangles
  checkCollision(a, b) {
    return (
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    );
  }
  drawStatusText(context) {
    context.save();
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = 'purple';
    context.fillText(`Score: ${this.score}`, 20, 40);
    context.fillText(`Wave: ${this.waveCount}`, 20, 65);

    const maxLiveShape = { marginLeft: 20, marginTop: 80, gap: 10, width: 5, height: 9 };
    for (let i = 0; i < this.player.maxLives; i++) {
      context.strokeRect(
        maxLiveShape.marginLeft + maxLiveShape.gap * i,
        maxLiveShape.marginTop,
        maxLiveShape.width,
        maxLiveShape.height
      );
    }
    const liveShape = { marginLeft: 20, marginTop: 80, gap: 10, width: 5, height: 9 };
    for (let i = 0; i < this.player.lives; i++) {
      context.fillRect(
        liveShape.marginLeft + liveShape.gap * i,
        liveShape.marginTop,
        liveShape.width,
        liveShape.height
      );
    }

    context.save();
    this.player.cooldown ? (context.fillStyle = 'red') : (context.fillStyle = 'gold');
    const energyShape = { marginLeft: 20, marginTop: 103, gap: 2, width: 2, height: 9 };
    for (let i = 0; i < this.player.energy; i++) {
      context.fillRect(
        energyShape.marginLeft + energyShape.gap * i,
        energyShape.marginTop,
        energyShape.width,
        energyShape.height
      );
    }
    context.restore();

    if (this.gameOver) {
      context.textAlign = 'center';
      context.font = '80px Monospace';
      context.fillText('GAME OVER!', this.width * 0.5, this.height * 0.5);
      context.font = '20px Monospace';
      context.fillText('Press R to restart!', this.width * 0.5, this.height * 0.5 + 30);
    }
    context.restore();
  }
  newWave() {
    this.waveCount += 1;
    if (this.player.lives < this.player.maxLives) this.player.lives += 1;
    if (this.waveCount % 2 === 0) {
      this.bosses.push(new Boss(this, this.bossLives));
    } else {
      if (Math.random() < 0.5 && this.columns * this.enemySize < this.width * 0.8) {
        this.columns += 1;
      } else if (this.rows * this.enemySize < this.height * 0.6) {
        this.rows += 1;
      }
      this.waves.push(new Wave(this));
    }
    this.waves = this.waves.filter((wave) => !wave.markedForDeletion);
  }
  restart() {
    this.player.restart();
    this.columns = 2;
    this.rows = 2;
    this.waves = [];
    this.bosses = [];
    this.bossLives = 10;
    this.waves.push(new Wave(this));
    this.waveCount = 1;
    this.score = 0;
    this.gameOver = false;
  }
}
