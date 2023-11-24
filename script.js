class Player {
  constructor(game) {
    this.game = game;
    this.width = 100;
    this.height = 100;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 5;
    this.lives = 3;
  }

  draw(context) {
    context.fillRect(this.x, this.y, this.width, this.height);
  }
  update() {
    //horizontal movement
    if (this.game.keys.includes('ArrowLeft')) this.x -= this.speed;
    if (this.game.keys.includes('ArrowRight')) this.x += this.speed;

    //horizontal boundaries
    if (this.x < -this.width * 0.5) this.x = -this.width * 0.5;
    else if (this.x > this.game.width - this.width * 0.5)
      this.x = this.game.width - this.width * 0.5;
  }
  shoot() {
    const projectile = this.game.getProjectile();
    if (projectile) projectile.start(this.x + this.width * 0.5, this.y);
  }
}
class Projectile {
  constructor() {
    this.width = 4;
    this.height = 20;
    this.x = 0;
    this.y = 0;
    this.speed = 20;
    this.free = true;
  }

  draw(context) {
    if (!this.free) {
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  update(context) {
    if (!this.free) {
      this.y -= this.speed;
      if (this.y < -this.height) this.reset();
    }
  }
  start(x, y) {
    this.x = x - this.width * 0.5;
    this.y = y;
    this.free = false;
  }
  reset() {
    this.free = true;
  }
}
class Enemy {
  constructor(game, positionX, positionY) {
    this.game = game;
    this.width = this.game.enemySize;
    this.height = this.game.enemySize;
    this.x = 0;
    this.y = 0;
    this.positionX = positionX;
    this.positionY = positionY;
    this.markedForDeletion = false;
  }

  draw(context) {
    context.strokeRect(this.x, this.y, this.width, this.height);
  }
  update(x, y) {
    this.x = x + this.positionX;
    this.y = y + this.positionY;
    //check enemies collision - projectiles
    this.game.projectilesPool.forEach((projectile) => {
      if (!projectile.free && this.game.checkCollision(this, projectile)) {
        this.markedForDeletion = true;
        projectile.reset();
        this.game.score += 1;
      }
    });
    //check collision enemies - player
    if (this.game.checkCollision(this, this.game.player)) {
      this.markedForDeletion = true;

      if (!this.game.gameOver && this.game.score > 0) this.game.score -= 1;
      this.game.player.lives -= 1;
      if (this.game.player.lives < 1) this.game.gameOver = true;
    }
    //lose condition
    if (this.y + this.height > this.game.height) {
      this.game.gameOver = true;
      this.markedForDeletion = true;
    }
  }
}

class Wave {
  constructor(game) {
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = 0;
    this.y = -this.height;
    this.speedX = 3;
    this.speedY = 0;
    this.enemies = [];
    this.nextWaveTrigger = false;
    this.create();
  }

  render(context) {
    if (this.y < 0) this.y += 5;
    this.speedY = 0;
    if (this.x < 0 || this.x > this.game.width - this.width) {
      this.speedX *= -1;
      this.speedY = this.game.enemySize;
    }

    this.x += this.speedX;
    this.y += this.speedY;
    this.enemies.forEach((enemy) => {
      enemy.update(this.x, this.y);
      enemy.draw(context);
    });
    this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
  }
  create() {
    for (let y = 0; y < this.game.rows; y++) {
      for (let x = 0; x < this.game.columns; x++) {
        let enemyX = x * this.game.enemySize;
        let enemyY = y * this.game.enemySize;
        this.enemies.push(new Enemy(this.game, enemyX, enemyY));
      }
    }
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = [];
    this.player = new Player(this);

    this.projectilesPool = [];
    this.numberOfProjectiles = 10;
    this.createProjectiles();

    this.columns = 5;
    this.rows = 5;
    this.enemySize = 60;

    this.waves = [];
    this.waves.push(new Wave(this));
    this.waveCount = 1;

    this.score = 0;
    this.gameOver = false;

    window.addEventListener('keydown', (ev) => {
      if (!this.keys.includes(ev.key)) this.keys.push(ev.key);
      if (ev.key === '1') this.player.shoot();
    });
    window.addEventListener('keyup', (ev) => {
      const index = this.keys.indexOf(ev.key);
      if (index > -1) this.keys.splice(index, 1);
    });
  }

  render(context) {
    this.drawStatusText(context);
    this.player.draw(context);
    this.player.update();
    this.projectilesPool.forEach((projectile) => {
      projectile.update();
      projectile.draw(context);
    });
    this.waves.forEach((wave) => {
      wave.render(context);
      if (wave.enemies.length < 1 && !wave.nextWaveTrigger && !this.gameOver) {
        this.newWave();
        this.waveCount += 1;
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

    const liveShape = { marginLeft: 20, marginTop: 80, gap: 10, width: 5, height: 15 };
    for (let i = 0; i < this.player.lives; i++) {
      context.fillRect(
        liveShape.marginLeft + liveShape.gap * i,
        liveShape.marginTop,
        liveShape.width,
        liveShape.height
      );
    }

    if (this.gameOver) {
      context.textAlign = 'center';
      context.font = '80px Monospace';
      context.fillText('GAME OVER!', this.width * 0.5, this.height * 0.5);
    }
    context.restore();
  }
  newWave() {
    if (Math.random() < 0.5 && this.columns * this.enemySize < this.width * 0.8) {
      this.columns += 1;
    } else if (this.rows * this.enemySize < this.enemySize * 0.6) {
      this.rows += 1;
    }
    this.waves.push(new Wave(this));
  }
}

window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 600;
  canvas.height = 800;
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.font = '18px Monospace';

  const game = new Game(canvas);
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    requestAnimationFrame(animate);
  }
  animate();
});
