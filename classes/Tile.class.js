import Phaser from "phaser";
import {getRandomTileColor} from "../helpers/getRandomTileColor";

export default class Tile extends Phaser.GameObjects.Container {
    constructor(scene, x, y, data) {
        super(scene, x, y);
        
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.color = getRandomTileColor();
        this.config = {
            ...data,
            color: this.color
        };
        
        this.tile = null;
        
        this.createTile();
    }
    
    createTile() {
        this.tile = this.scene.add.image(this.x, this.y, this.color)
            .setInteractive()
            .setSize(this.scene.tileSize, this.scene.tileSize)
            .setData(this.config)
            .setDepth(-this.config.row * 10)
            .on('move', (e) => this.moveTile(e))
    }
    
    moveTile(offset) {
        const currentRow = this.tile.getData('row');
        this.tile.setData('row', currentRow + offset);
        this.tile.setDepth(-(currentRow + offset) * 10);

        this.scene.tweens.add({
            targets: this.tile,
            y: this.tile.y + this.scene.tileSize * offset,
            duration: 1000,
            ease: 'Bounce'
        })
            .on('complete', () => {
                this.scene.isAnimationActive = false;
            });
    }
}