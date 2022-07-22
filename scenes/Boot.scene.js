import Phaser from "phaser";
import {loadFont} from "../helpers/loadFont";
import {tileColor} from "../enum/tile";
import {fields} from "../enum/fields";
import {buttons} from "../enum/buttons";
import {coin} from "../enum/coin";

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }
    
    preload() {
        this.loadImages();
        this.loadFont();
    }
    
    create() {
        this.scene.start('MainScene');
    }

    loadImages() {
        this.load.image(tileColor.blue, 'assets/img/tiles/blue.png');
        this.load.image(tileColor.green, 'assets/img/tiles/green.png');
        this.load.image(tileColor.purple, 'assets/img/tiles/purple.png');
        this.load.image(tileColor.red, 'assets/img/tiles/red.png');
        this.load.image(tileColor.yellow, 'assets/img/tiles/yellow.png');
        
        this.load.image(coin.main, 'assets/img/coin.png');
        
        this.load.image(fields.main, 'assets/img/backgrounds/fieldMain.png');
        this.load.image(fields.scores, 'assets/img/backgrounds/fieldScores.png');
        
        this.load.image(buttons.main, 'assets/img/buttons/buttonMain.png');
        this.load.image(buttons.danger, 'assets/img/buttons/buttonDanger.png');
        this.load.image(buttons.bonus, 'assets/img/buttons/buttonBonus.png');
    }
    
    loadFont() {
        loadFont('Marvin', "assets/fonts/marvin/Marvin.ttf")
    }
}