import * as Phaser from 'phaser';
import BootScene from './scenes/Boot.scene';

const config = {
    name: 'app',
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                y: 0
            }
        }
    },
    scene: [BootScene]
};

window.game = new Phaser.Game(config);