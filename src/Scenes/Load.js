class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.image("tilemap_tiles", "tilemap_packed.png");
        this.load.image("parallaxMap", "parallax.png");
        this.load.tilemapTiledJSON("level1Set", "level1.tmj");
        this.load.audio("run", [
            "audio/footstep01.ogg",
            "audio/footstep02.ogg",
            "audio/footstep03.ogg",
            "audio/footstep04.ogg",
            "audio/footstep05.ogg",
            "audio/footstep06.ogg"
        ])
        this.load.audio("coins", [
            "audio/handleCoins.ogg",
            "audio/handleCoins2.ogg"
        ])
        this.load.audio("jump1", [
            "audio/cloth1.ogg",
            "audio/cloth2.ogg"
        ])
        this.load.audio("jump2", [
            "audio/cloth3.ogg",
            "audio/cloth4.ogg"
        ])
        this.load.audio("death", [
            "audio/knifeSlice.ogg",
            "audio/knifeSlice2.ogg"
        ])
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        //  // ...and pass to the next Scene
        this.scene.start("platformerScene");
    }

    update() {

    }
}