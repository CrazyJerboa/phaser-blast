import * as Phaser from 'phaser';
import BootScene from "./scenes/Boot.scene";
import MainScene from "./scenes/Main.scene";
import GameOverScene from "./scenes/GameOver.scene";

const config = {
    name: 'app',
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#333333',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [
        BootScene,
        MainScene,
        GameOverScene
    ]
};

window.game = new Phaser.Game(config);