import Phaser from "phaser";
import {fields} from "../enum/fields";
import {progress} from "../enum/progress";

export default class Progress extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        this.progressLine = null;
        
        this.initProgress();
    }
    
    initProgress() {
        this.scene.add.image(this.x, this.y, fields.progress)
            .setScale(0.3)
            .setDepth(200)
            .setOrigin(0.5, 0);
        
        this.progressLine = this.scene.add.image(
            this.x - 2,
            this.y + 75,
            progress.line
        )
            .setScale(0.3, 0.29)
            .setDepth(210);

        this.progressLine.setCrop(0, 0, 0, this.progressLine.height);

        this.scene.add.text(this.x, this.y + 73, 'Progress', {
            fontFamily: 'Marvin',
            fontSize: 18
        })
            .setDepth(220)
            .setOrigin(0.5);
    }
    
    updateWidth() {
        let scoresPercents = this.scene.scores * 100 / this.scene.scoresToWin;
        let lineWidth;
        
        if (scoresPercents > 100) {
            scoresPercents = 100;
        }
        
        lineWidth = (this.progressLine.width * scoresPercents / 100).toFixed();
        
        this.progressLine.setCrop(0, 0, lineWidth, this.progressLine.height);
    }
 }