import {buttons} from "../enum/buttons";
import {coin} from "../enum/coin";
import Phaser from "phaser";

export default class ButtonBonus extends Phaser.GameObjects.Container {
    type;
    constructor(scene, x, y, data) {
        super(scene, x, y);

        this.scene = scene;
        this.x = x;
        this.y = y;
        this.data = data;
        
        this.button = null;
        this.nameText = null;
        this.coinIcon = null;
        this.priceText = null;
        
        this.createButton();
    }
    
    createButton() {
        this.button = this.scene.add.image(this.x, this.y, buttons.bonus)
            .setInteractive()
            .setScale(0.25)
            .on('pointerdown', () => {
                this.button.y += 2;
                this.nameText.y += 2;
                this.coinIcon.y += 2;
                this.priceText.y += 2;
            })
            .on('pointerup', () => {
                this.button.y -= 2;
                this.nameText.y -= 2;
                this.coinIcon.y -= 2;
                this.priceText.y -= 2;
            })
            .on('pointerover', () => {
                this.button.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);
            })
            .on('pointerout', () => {
                if (!this.scene.isBonusBombActive) {
                    this.button.clearTint();
                }
            });
        
        this.nameText = this.scene.add.text(
            this.x, 
            this.y - 18, 
            this.data.nameText, 
            {
                fontFamily: 'Marvin',
                fontSize: 20
            }
        )
            .setOrigin(0.5);

        this.coinIcon = this.scene.add.image(
            this.x,
            this.y + 23,
            coin.main
        )
            .setScale(0.8)
            .setOrigin(0.5);
        
        this.priceText = this.scene.add.text(
            this.x,
            this.y + 21,
            this.data.price,
            {
                fontFamily: 'Marvin',
                fontSize: 16
            }
        )
            .setOrigin(0.5);
        
        this.coinIcon.setX(this.coinIcon.x - this.priceText.width / 2);
        this.priceText.setX(this.priceText.x + this.coinIcon.width / 2);
    }
    
    tintButton() {
        this.button.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);
    }
    
    untintButton() {
        this.button.clearTint();
    }
}