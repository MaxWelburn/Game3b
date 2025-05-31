class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        this.ACCELERATION = 1000;
        this.DRAG = 1000;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -300;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 3.0;
        this.canDoubleJump = true;
        this.Keys = 0;
        this.Coins = 0;
    }

    create() {
        this.map = this.add.tilemap("level1Set", 18, 18, 80, 24);
        this.tileset = this.map.addTilesetImage("set1", "tilemap_tiles");
        this.parallax = this.add.image(0, 0, "parallaxMap")
            .setDepth(-1)
            .setOrigin(0)
            .setScale(0.75)
            .setScrollFactor(0.25);
        //Layers
        this.flagLayer = this.map.createLayer("Flag", this.tileset, 0, 0).setDepth(1);
        this.foregroundLayer = this.map.createLayer("Foreground", this.tileset, 0, 0).setDepth(6);
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0).setDepth(5);
        this.killPartLayer = this.map.createLayer("KillPart", this.tileset, 0, 0).setDepth(4);
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0).setDepth(3);
        this.keysLayer = this.map.createLayer("Keys", this.tileset, 0, 0).setDepth(2);
        this.coinsLayer = this.map.createLayer("Coins", this.tileset, 0, 0).setDepth(1);
        this.killPartLayer.setCollisionByExclusion([-1]);
        this.groundLayer.setCollisionByExclusion([-1]);
        this.keysLayer.setCollisionByExclusion([-1]);
        this.coinsLayer.setCollisionByExclusion([-1]);
        my.sprite.player = this.physics.add.sprite(40, 320, "platformer_characters", "tile_0000.png").setDepth(7);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setMaxVelocity(180, 350).setDisplaySize(18, 18);

        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.killPartLayer.setTileIndexCallback([54, 69, 74], this.killPlayer, this);
        this.physics.add.overlap(my.sprite.player, this.killPartLayer);
        this.keysLayer.setTileIndexCallback([28], this.addKey, this);
        this.physics.add.overlap(my.sprite.player, this.keysLayer);
        this.coinsLayer.setTileIndexCallback([152], this.addCoin, this);
        this.physics.add.overlap(my.sprite.player, this.coinsLayer);
        this.flagLayer.setTileIndexCallback([113], this.reachFlag, this);
        this.physics.add.overlap(my.sprite.player, this.flagLayer);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        this.runSound = this.sound.add('run', {
            loop: true,
            volume: 0.2
        });
        this.runSound.stop();
        this.coinSound = this.sound.add('coins', {
            loop: false,
            volume: 0.2
        });
        this.coinSound.stop();
        this.jumpSound1 = this.sound.add('jump1', {
            loop: false,
            volume: 0.2
        });
        this.jumpSound1.stop();
        this.jumpSound2 = this.sound.add('jump2', {
            loop: false,
            volume: 0.2
        });
        this.jumpSound2.stop();
        this.deathSound = this.sound.add('death', {
            loop: false,
            volume: 0.2
        });
        this.deathSound.stop();
        
        cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_01.png', 'smoke_02.png', 'smoke_03.png'],
            scale: {start: 0.03, end: 0.1},
            lifespan: 350,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.runSound.stop();
        });
    }

    killPlayer(plr, tile) {
        this.cameras.main.flash(100, 255, 0, 0);
        my.sprite.player.setTint(0xff0000);
        this.deathSound.play();
        this.time.delayedCall(50, () => {
            this.Keys = 0;
            this.Coins = 0;
            this.scene.restart();
        });
    }

    addKey(plr, tile) {
        this.keysLayer.removeTileAt(tile.x, tile.y, true, true);
        this.Keys++;
        this.coinSound.play();
    }

    addCoin(plr, tile) {
        this.coinsLayer.removeTileAt(tile.x, tile.y, true, true);
        this.Coins++;
        this.coinSound.play();
    }
    
    reachFlag (plr, tile) {
        if (this.Keys == 3) {
            this.flagLayer.removeTileAt(tile.x, tile.y, true, true);
            this.physics.pause();
            this.sound.stopAll();
            plr.setVelocity(0).anims.stop();
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.time.delayedCall(1000, () => {
                this.add.text(
                    this.cameras.main.midPoint.x,
                    this.cameras.main.midPoint.y,
                    'YOU WIN!',
                    { fontSize: '32px', color: '#ffffff' }
                ).setOrigin(0.5).setScrollFactor(0);
            });
        }
    }

    update() {
        if (cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
                if (!this.runSound.isPlaying) this.runSound.play();
            } else {
                my.vfx.walking.stop();
                if (this.runSound.isPlaying) this.runSound.stop();
            }
        } else if (cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
                if (!this.runSound.isPlaying) this.runSound.play();
            } else {
                my.vfx.walking.stop();
                if (this.runSound.isPlaying) this.runSound.stop();
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
            if (this.runSound.isPlaying) this.runSound.stop();
        }
        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        } else {
            this.canDoubleJump = true;
        }
        let isJumpPressed = Phaser.Input.Keyboard.JustDown(cursors.up);
        if (isJumpPressed && this.canDoubleJump) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            if (!my.sprite.player.body.blocked.down) {
                this.canDoubleJump = false;
                this.jumpSound2.play();
            } else {
                this.jumpSound1.play();
            }
            my.vfx.walking.start();
        }
    }
}