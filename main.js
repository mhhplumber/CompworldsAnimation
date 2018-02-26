var AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    var canvas = document.getElementById("gameWorld");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled= false;
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y, canvas.width, canvas.height);
};

Background.prototype.update = function () {
};

// inheritance 
function Hero(game, spritesheet) {
    this.animation = new Animation(spritesheet, 50, 50, 4, 0.15, 10, true, 4);
    this.speed = 160;
    this.ctx = game.ctx;
    var y = window.innerHeight - this.animation.frameHeight * this.animation.scale;
    Entity.call(this, game, 0, y);
}

Hero.prototype = new Entity();
Hero.prototype.constructor = Hero;

Hero.prototype.update = function () {
    this.x += this.game.clockTick * this.speed;
    if (this.x > window.innerWidth) this.x = -30;
    this.y = window.innerHeight - this.animation.frameHeight * this.animation.scale;
    Entity.prototype.update.call(this);
}

Hero.prototype.draw = function () {
	var that = this;
    this.animation.drawFrame(this.game.clockTick, this.ctx, that.x, that.y);
    this.ctx.font="20px Arial";
    this.ctx.textAlign="left";
    this.ctx.fillStyle = "#fff";
    this.ctx.fillText("Click somewhere to make this interesting", this.x, this.y);
    Entity.prototype.draw.call(this);
}

function Idle(game, spritesheet, x, y) {
    this.animation = new Animation(spritesheet, 25, 50, 1, 0.15, 13, true, 3);
    this.speed = 0;
    this.weight = 1.3;
    this.iv = 1;
    this.ctx = game.ctx;
    Entity.call(this, game, x, y);
}

Idle.prototype = new Entity();
Idle.prototype.constructor = Idle;

Idle.prototype.update = function () {
    if (this.y < window.innerHeight - this.animation.frameHeight * this.animation.scale * 2){
        this.y += this.iv;
        this.iv *= this.weight;
    }
    Entity.prototype.update.call(this);
}

Idle.prototype.draw = function () {
    var that = this;
    this.animation.drawFrame(this.game.clockTick, this.ctx, that.x, that.y);
    Entity.prototype.draw.call(this);
}

function addIdle(x, y){
    gameEngine.addEntity(new Idle(gameEngine, AM.getAsset("./img/samus_suit.png"), x, y));
}

var gameEngine = new GameEngine();
AM.queueDownload("./img/samus.png");
AM.queueDownload("./img/samus_suit.png");
AM.queueDownload("./img/Hallway.bmp");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/Hallway.bmp")));
    gameEngine.addEntity(new Hero(gameEngine, AM.getAsset("./img/samus.png")));

    console.log("All Done!");
});