import Phaser from "phaser";
import {fields} from "../enum/fields";
import ButtonBonus from "../classes/ButtonBonus.class";
import {buttons} from "../enum/buttons";
import {coin} from "../enum/coin";
import Progress from "../classes/Progress.class";
import TilesList from "../classes/TilesList.class";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        
        this.coordsOffset = 100;
        this.tileSize = 50;
        this.rows = 8;
        this.cols = 6;
        this.tiles = null;
        this.bonusBombButton = null;
        this.progressBar = null;
        this.scores = 0;
        this.bonusScores = 10;
        this.bonusCurrentPrice = 0;
        this.turns = 10;
        this.scoresToWin = 40;
        
        this.isBonusBombActive = false;
    }
    
    create(data) {
        if (data?.isClearData) {
            this.lastId = 1;
            this.tiles = null;
            this.scores = 0;
            this.turns = 10;
            this.selectedTilesList = [];
            this.isAnimationActive = false;
        }
        
        this.addMainField();
        this.addScoresField();
        
        this.generateSheet(this.rows, this.cols);
        
        this.initProgressBar();
        
        this.initBonusScores();
        this.initBonusButtons();
    }

    generateSheet(rows, cols) {
        this.tiles = new TilesList(this).tiles;
        
        this.tiles.emit('generate', {rows, cols});
    }
    
    gameOver(reason) {
        this.scene.setActive(false);
        
        this.scene.launch('GameOverScene', {
            screenWidth: this.game.scale.gameSize.width,
            screenHeight: this.game.scale.gameSize.height,
            scores: this.scores,
            reason,
        });
    }

    addMainField() {
        const borderOffset = 30;
        const background = this.add.image(
            this.coordsOffset - borderOffset / 2,
            this.coordsOffset - borderOffset / 2,
            fields.main
        )
            .setOrigin(0, 0)
            .setDepth(-1000);

        const targetWidth = this.cols * this.tileSize + borderOffset;
        const targetHeight = this.rows * this.tileSize + borderOffset;

        const width = background.width;
        const height = background.height;

        background.setScale(targetWidth / width, targetHeight / height);
        
        this.add.rectangle(
            this.coordsOffset,
            0,
            this.cols * this.tileSize,
            this.coordsOffset - borderOffset / 2,
            this.game.config.backgroundColor.color
        )
            .setOrigin(0, 0)
            .setDepth(10);
    }
    
    addScoresField() {
        const x = this.cols * this.tileSize + this.coordsOffset * 2;
        const y = this.coordsOffset * 1.5;
        
        this.add.image(x, y, fields.scores)
            .setOrigin(0, 0)
            .setScale(0.5)
            .setDepth(10);
        
        this.addText(x, y);
    }

    addText(offsetX, offsetY) {
        this.scoresToWinText = this.add
            .text(offsetX + 105, offsetY -20, 
                'Score ' + this.scoresToWin + ' points to win!', {
                    fontFamily: 'Marvin',
                    fontSize: 20
                })
            .setDepth(20)
            .setOrigin(0.5);

        this.turnsText = this.add
            .text(offsetX + 105, offsetY + 57, this.turns, {
                    fontFamily: 'Marvin',
                    fontSize: 50
                })
            .setDepth(20)
            .setOrigin(0.5);
        
        this.add
            .text(offsetX + 105, offsetY + 130,'scores:', {
                    fontFamily: 'Marvin',
                    fontSize: 14
                })
            .setDepth(20)
            .setOrigin(0.5);
        
        this.scoresText = this.add
            .text(offsetX + 105, offsetY + 155, this.scores, {
                    fontFamily: 'Marvin',
                    fontSize: 30
                })
            .setDepth(20)
            .setOrigin(0.5);
    }

    initBonusScores() {
        const x = 702;
        const y = 30;
        
        const bg = this.add.image(x, y, buttons.main)
            .setScale(0.2);
        
        this.add.image(x + 8 - bg.width * 0.2 / 2, y - 1, coin.main)
            .setScale(1.3);
        
        this.bonusScoresText = this.add
            .text(x + 7, y - 3, this.bonusScores, {
                fontFamily: 'Marvin',
                fontSize: 20
            })
            .setOrigin(0.5, 0.5);
    }

    updateTurnText() {
        this.turnsText.setText(this.turns);
    }

    updateScoresText() {
        this.scoresText.setText(this.scores);
    }

    updateBonusScoresText() {
        this.bonusScoresText.setText(this.bonusScores);
    }
    
    initBonusButtons() {
        const price = 5;
        
        this.bonusBombButton = new ButtonBonus(this, 608, 450, {
            nameText: 'Bomb',
            price
        });
        
        this.bonusBombButton.button.on('pointerup', () => {
            if (this.bonusScores >= price && !this.isBonusBombActive) {
                this.isBonusBombActive = true;
                this.bonusCurrentPrice = price;

                this.bonusBombButton.tintButton();
            } else {
                this.isBonusBombActive = false;
                this.bonusBombButton.untintButton();
            }
        });
    }

    initProgressBar() {
        this.progressBar = new Progress(this, this.game.config.width / 2, -45);
    }
    
    updateProgressBar() {
        this.progressBar.updateWidth();
    }
}