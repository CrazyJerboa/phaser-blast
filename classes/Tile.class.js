import Phaser from "phaser";

export default class Tile extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, key, frame, data) {
        super(scene, x, y, key, frame);
        
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.key = key;
        this.config = data;
        
        this.tile = null;
        
        this.createTile();
    }
    
    createTile() {
        this.tile = this.scene.add.image(this.x, this.y, this.key)
            .setInteractive()
            .setSize(this.scene.tileSize, this.scene.tileSize)
            .setData(this.config)
            .setDepth(-this.config.row * 10);
    }
}