import Phaser from "phaser";
import {getRandomTileColor} from "../helpers/getRandomTileColor";
import Tile from "../classes/Tile.class";
import {fields} from "../enum/fields";
import {gameOverReasons} from "../enum/gameOverReasons";
import ButtonBonus from "../classes/ButtonBonus.class";
import {buttons} from "../enum/buttons";
import {coin} from "../enum/coin";

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        
        this.coordsOffset = 100;
        this.lastId = 1;
        this.tileSize = 50;
        this.rows = 8;
        this.cols = 6;
        this.tiles = null;
        this.bonusBombButton = null;
        this.scores = 0;
        this.bonusScores = 10;
        this.bonusCurrentPrice = 0;
        this.turns = 10;
        this.scoresToWin = 40;
        this.selectedTilesList = [];
        this.isAnimationActive = false;
        
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
        
        this.initBonusScores();
        this.initBonusButtons();
    }

    generateSheet(rows, cols) {
        this.tiles = this.physics.add.group();
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.createNewTile(j, i);
            }
        }
    }

    createNewTile(col, row, offset = -1) {
        const x = col * this.tileSize + this.tileSize / 2 + this.coordsOffset;
        let y = row * this.tileSize + this.tileSize / 2 + this.coordsOffset;
        const color = getRandomTileColor();
        
        const data = {
            id: this.lastId,
            type: 'tile',
            color,
            row,
            col
        }
        
        const tile = new Tile(this, x, y, color, 0, data).tile;
        
        if (offset >= 0) {
            tile.y -= this.tileSize * offset;
            
            this.tweens.add({
                targets: tile,
                y: tile.y + this.tileSize * offset,
                duration: 1000,
                ease: 'Bounce',
            });
        }
        
        this.tiles.add(tile);

        this.lastId++;

        const ths = this;
        tile.on('pointerup', () => {
            if (!ths.isAnimationActive) {
                ths.selectedTilesList = [];
                
                ths.getTileNeighbours(tile);
    
                if (ths.selectedTilesList.length > 1) {
                    ths.isAnimationActive = true;
                    
                    if (!this.isBonusBombActive) {
                        ths.turns--;
                        ths.updateTurnText();
                    }
    
                    ths.destroySelectedTiles();
                }
            }
        });
    }

    getTileNeighbours(clickedTile, depth = 0) {
        const figuresList = this.tiles.getChildren();

        clickedTile.setData('isChecked', true);

        if (depth === 0) {
            this.selectedTilesList.push(clickedTile.getData('id'));
        }
        
        const _getTilesForBombBonus = () => {
            const row = clickedTile.getData('row');
            const col = clickedTile.getData('col');

            figuresList.forEach(t => {
                const targetRow = t.getData('row');
                const targetCol = t.getData('col');
                const id = t.getData('id');
                
                if (
                    targetRow >= row - 1 && targetRow <= row + 1
                    && targetCol >= col - 1 && targetCol <= col + 1
                    && !this.selectedTilesList.includes(id)
                ) {
                    this.selectedTilesList.push(id);
                }
            });

            this.bonusScores -= this.bonusCurrentPrice;
            this.updateBonusScoresText();
            
            this.bonusCurrentPrice = 0;
            this.bonusBombButton.untintButton();
            this.isBonusBombActive = false;
        }

        const _pushTileToArray = (tile) => {
            if (
                tile &&
                clickedTile.getData('color') === tile.getData('color') &&
                !this.selectedTilesList.filter(id => id === tile.getData('id')).length
            ) {
                tile.setData('isChecked', false);
                this.selectedTilesList.push(tile.getData('id'));
            }
        }

        if (this.isBonusBombActive) {
            _getTilesForBombBonus();
        } else {
            if (clickedTile.getData('col') + 1 < this.cols) {
                const tile = figuresList
                    .find(t => t.getData('row') === clickedTile.getData('row') && t.getData('col') === clickedTile.getData('col') + 1);
                _pushTileToArray(tile);
            }
    
            if (clickedTile.getData('col') - 1 >= 0) {
                const tile = figuresList
                    .find(t => t.getData('row') === clickedTile.getData('row') && t.getData('col') === clickedTile.getData('col') - 1);
                _pushTileToArray(tile);
            }
    
            if (clickedTile.getData('row') + 1 < this.rows) {
                const tile = figuresList
                    .find(t => t.getData('row') === clickedTile.getData('row') + 1 && t.getData('col') === clickedTile.getData('col'));
                _pushTileToArray(tile);
            }
    
            if (clickedTile.getData('row') - 1 >= 0) {
                const tile = figuresList
                    .find(t => t.getData('row') === clickedTile.getData('row') - 1 && t.getData('col') === clickedTile.getData('col'));
                _pushTileToArray(tile);
            }
    
            this.selectedTilesList.forEach(id => {
                const tile = this.tiles
                    .getChildren()
                    .find(t => t.getData('id') === id);
                
                if (!tile.getData('isChecked')) {
                    this.getTileNeighbours(tile, depth + 1);
                }
            });
        }
    }

    destroySelectedTiles() {
        const deletedTiles = {};

        this.scores += this.selectedTilesList.length;
        this.updateScoresText();

        this.selectedTilesList.forEach(id => {
            const tile = this.tiles
                .getChildren()
                .find(t => t.getData('id') === id);

            const row = tile.getData('row');
            const col = tile.getData('col');

            if (!deletedTiles[col]) {
                deletedTiles[col] = [row];
            } else if (!deletedTiles[col].includes(row)) {
                deletedTiles[col].push(row);
            }

            tile.destroy();
        });

        Object.entries(deletedTiles).forEach(entry => {
            let [col, selectedRows] = entry;
            const lastRow = Math.max.apply(null, selectedRows);
            const rows = [];

            col = parseInt(col);

            for (let i = lastRow; i >= 0; i--) {
                rows.push(i);
            }

            const _moveTile = (tile, offset) => {
                const currentRow = tile.getData('row');
                tile.setData('row', currentRow + offset);
                tile.setDepth(-(currentRow + offset) * 10);

                this.tweens.add({
                    targets: tile,
                    y: tile.y + this.tileSize * offset,
                    duration: 1000,
                    ease: 'Bounce'
                })
                    .on('complete', () => {
                        this.isAnimationActive = false;
                    });
            }

            let offset = 1;
            rows.forEach(row => {
                if (row - 1 >= 0) {
                    const aboveTile = this.tiles
                        .getChildren()
                        .find(t => t.getData('col') === col && t.getData('row') === row - 1);

                    if (aboveTile) {
                        _moveTile(aboveTile, offset);
                    } else {
                        offset++;
                    }
                }
            });

            for (let i = 0; i < offset; i++) {
                this.createNewTile(col, i, offset);
            }
        });

        this.checkAvailableTurns();
        
        setTimeout(() => {
            if (this.isAnimationActive) {
                this.isAnimationActive = false;
            }
        }, 1100);
    }

    checkAvailableTurns() {
        let canTurn = false;

        const figuresList = this.tiles.getChildren();

        for (let i = 0; i < figuresList.length; i++) {
            const tile = figuresList[i];

            if (tile.getData('col') + 1 < this.cols) {
                const neighboringTile = figuresList
                    .find(t =>
                        t.getData('row') === tile.getData('row')
                        && t.getData('col') === tile.getData('col') + 1
                        && t.getData('color') === tile.getData('color')
                    );
                if (neighboringTile) canTurn = true;
            }

            if (tile.getData('col') - 1 >= 0) {
                const neighboringTile = figuresList
                    .find(t =>
                        t.getData('row') === tile.getData('row')
                        && t.getData('col') === tile.getData('col') - 1
                        && t.getData('color') === tile.getData('color')
                    );
                if (neighboringTile) canTurn = true;
            }

            if (tile.getData('row') + 1 < this.rows) {
                const neighboringTile = figuresList
                    .find(t =>
                        t.getData('row') === tile.getData('row') + 1
                        && t.getData('col') === tile.getData('col')
                        && t.getData('color') === tile.getData('color')
                    );
                if (neighboringTile) canTurn = true;
            }

            if (tile.getData('row') - 1 >= 0) {
                const neighboringTile = figuresList
                    .find(t =>
                        t.getData('row') === tile.getData('row') - 1
                        && t.getData('col') === tile.getData('col')
                        && t.getData('color') === tile.getData('color')
                    );
                if (neighboringTile) canTurn = true;
            }

            if (canTurn) break;
        }

        if (!canTurn) {
            this.gameOver(gameOverReasons.noTurnsAvailable)
        }

        this.onSheetChanged();
    }

    onSheetChanged() {
        if (this.scores >= this.scoresToWin) {
            this.gameOver(gameOverReasons.youWon);
        } else {
            if (this.turns <= 0) {
                this.gameOver(gameOverReasons.turnsAreOver);
            }
        }
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
        const x = 610;
        const y = 35;
        
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
        })
    }
}