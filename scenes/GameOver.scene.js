import {gameOverReasons} from "../enum/gameOverReasons";
import {buttons} from "../enum/buttons";
import Phaser from "phaser";

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');

        this.data = null;
    }
    
    init(data) {
        this.data = data;
        this.initGameOverScreen();
        this.initReloadButton();
    }
    
    initGameOverScreen() {
        this.add.rectangle(
            0, 
            0, 
            this.data.screenWidth, 
            this.data.screenHeight,
            '#000000',
            0.7
        )
            .setOrigin(0, 0);
        
        switch (this.data.reason) {
            case gameOverReasons.turnsAreOver:
                this.add.text(
                    this.data.screenWidth / 2, 
                    this.data.screenHeight / 2, 
                    'Game Over',
                    {
                        fontFamily: 'Marvin',
                        fontSize: 50
                    }
                )
                    .setOrigin(0.5);
                
                this.add.text(
                    this.data.screenWidth / 2, 
                    this.data.screenHeight / 2 + 50, 
                    'You have run out of turns', 
                    {
                        fontFamily: 'Marvin',
                        fontSize: 30
                    }
                )
                    .setOrigin(0.5);
                
                break;

            case gameOverReasons.noTurnsAvailable:
                this.add.text(
                    this.data.screenWidth / 2, 
                    this.data.screenHeight / 2, 
                    'Game Over',
                    {
                        fontFamily: 'Marvin',
                        fontSize: 50
                    }
                )
                    .setOrigin(0.5);
                
                this.add.text(
                    this.data.screenWidth / 2, 
                    this.data.screenHeight / 2 + 50, 
                    'No any turns available',
                    {
                        fontFamily: 'Marvin',
                        fontSize: 30
                    }
                )
                    .setOrigin(0.5);
                
                break;

            case gameOverReasons.youWon:
                this.add.text(
                    this.data.screenWidth / 2, 
                    this.data.screenHeight / 2, 
                    'You Won!',
                    {
                        fontFamily: 'Marvin',
                        fontSize: 30
                    }
                )
                    .setOrigin(0.5);
                
                this.add.text(
                    this.data.screenWidth / 2,
                    this.data.screenHeight / 2 + 50, 
                    'Collected scores: ' + this.data.scores,
                    {
                        fontFamily: 'Marvin',
                        fontSize: 30
                    }
                )
                    .setOrigin(0.5);
                
                break;

            default:
                this.add.text(this.data.screenWidth / 2, this.data.screenHeight / 2, 'Game Over');
                break;
        }
    }
    
    initReloadButton() {
        const button = this.add.image(
            this.data.screenWidth / 2,
            this.data.screenHeight - 120,
            buttons.danger
        )
            .setInteractive()
            .setScale(0.7)
            .on('pointerup', () => {
                this.scene.launch('MainScene', {isClearData: true});
                this.scene.setVisible(false);
            });
        
        const text = this.add.text(
            this.data.screenWidth / 2,
            this.data.screenHeight - 120,
            'New game',
            {
                fontFamily: 'Marvin',
                fontSize: 30
            }
        )
            .setOrigin(0.5);

        Phaser.Display.Align.In.Center(text, button);
    }
}