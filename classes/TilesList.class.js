import Tile from "./Tile.class";
import {gameOverReasons} from "../enum/gameOverReasons";

export default class TilesList extends Phaser.GameObjects.Group {
    constructor(scene) {
        super(scene);
        
        this.scene = scene;
        
        this.lastId = 1;
        this.selectedTilesList = [];
        this.rows = 0;
        this.cols = 0;
        this.isAnimationActive = false;

        this.tiles = null
        
        this.initTilesList()
    }
    
    initTilesList() {
        this.tiles = this.scene.add.group()
            .on('generate', payload => this.generateTiles(payload.rows, payload.cols));
    }
    
    generateTiles(rows, cols) {
        this.selectedTilesList = [];
        
        this.rows = rows;
        this.cols = cols;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.addTile(j, i);
            }
        }
    }
    
    addTile(col, row, offset = -1) {
        const x = col * this.scene.tileSize + this.scene.tileSize / 2 + this.scene.coordsOffset;
        let y = row * this.scene.tileSize + this.scene.tileSize / 2 + this.scene.coordsOffset;

        const data = {
            id: this.lastId,
            row,
            col
        }

        const tile = new Tile(this.scene, x, y, data).tile;

        if (offset >= 0) {
            tile.y -= this.scene.tileSize * offset;

            this.scene.tweens.add({
                targets: tile,
                y: tile.y + this.scene.tileSize * offset,
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

                ths.getClickedTileNeighbours(tile);

                if (ths.selectedTilesList.length > 1) {
                    ths.isAnimationActive = true;

                    if (!this.isBonusBombActive) {
                        ths.scene.turns--;
                        ths.scene.updateTurnText();
                    }

                    ths.destroySelectedTiles();
                }
            }
        });
    }

    getClickedTileNeighbours(clickedTile, depth = 0) {
        clickedTile.setData('isChecked', true);

        if (depth === 0) {
            this.selectedTilesList.push(clickedTile.getData('id'));
        }

        if (this.scene.isBonusBombActive) {
            this.getTilesForBombBonus(clickedTile);
        } else {
            const tiles = this.getNeighbourTiles(clickedTile);
            tiles.forEach(tile => this.pushTileIdToSelectedList(tile));

            this.selectedTilesList.forEach(id => {
                const tile = this.tiles
                    .getChildren()
                    .find(t => t.getData('id') === id);

                if (!tile.getData('isChecked')) {
                    this.getClickedTileNeighbours(tile, depth + 1);
                }
            });
        }
    }
    
    getNeighbourTiles(checkedTile) {
        const tilesList = this.tiles.getChildren();
        let tiles = [];
        
        if (checkedTile.getData('col') + 1 < this.cols) {
            const tile = tilesList.find(t => {
                return t.getData('row') === checkedTile.getData('row')
                && t.getData('col') === checkedTile.getData('col') + 1
                && t.getData('color') === checkedTile.getData('color')
            });
            
            if (tile) tiles.push(tile);
        }

        if (checkedTile.getData('col') - 1 >= 0) {
            const tile = tilesList.find(t => {
                return t.getData('row') === checkedTile.getData('row') 
                && t.getData('col') === checkedTile.getData('col') - 1
                && t.getData('color') === checkedTile.getData('color')
            });

            if (tile) tiles.push(tile);
        }

        if (checkedTile.getData('row') + 1 < this.rows) {
            const tile = tilesList.find(t => {
                return t.getData('row') === checkedTile.getData('row') + 1 
                && t.getData('col') === checkedTile.getData('col')
                && t.getData('color') === checkedTile.getData('color')
            });

            if (tile) tiles.push(tile);
        }

        if (checkedTile.getData('row') - 1 >= 0) {
            const tile = tilesList.find(t => {
                return t.getData('row') === checkedTile.getData('row') - 1 
                && t.getData('col') === checkedTile.getData('col')
                && t.getData('color') === checkedTile.getData('color')
            });

            if (tile) tiles.push(tile);
        }
        
        return tiles;
    }
    
    pushTileIdToSelectedList(targetTile) {
        if (
            targetTile &&
            !this.selectedTilesList.filter(id => id === targetTile.getData('id')).length
        ) {
            targetTile.setData('isChecked', false);
            this.selectedTilesList.push(targetTile.getData('id'));
        }
    }

    getTilesForBombBonus(clickedTile) {
        const row = clickedTile.getData('row');
        const col = clickedTile.getData('col');

        this.tiles.getChildren().forEach(t => {
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

        this.scene.bonusScores -= this.scene.bonusCurrentPrice;
        this.scene.updateBonusScoresText();

        this.scene.bonusCurrentPrice = 0;
        this.scene.bonusBombButton.untintButton();
        this.scene.isBonusBombActive = false;
    }

    destroySelectedTiles() {
        const deletedTiles = {};

        this.scene.scores += this.selectedTilesList.length;
        this.scene.updateScoresText();
        this.scene.updateProgressBar();

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

        this.generateNewTilesAfterDestroy(deletedTiles);

        this.checkAvailableTurns();

        setTimeout(() => {
            if (this.isAnimationActive) {
                this.isAnimationActive = false;
            }
        }, 1100);
    }
    
    generateNewTilesAfterDestroy(deletedTiles) {
        Object.entries(deletedTiles).forEach(entry => {
            let [col, selectedRows] = entry;
            const lastRow = Math.max.apply(null, selectedRows);
            const rows = [];

            col = parseInt(col);

            for (let i = lastRow; i >= 0; i--) {
                rows.push(i);
            }

            let offset = 1;
            rows.forEach(row => {
                if (row - 1 >= 0) {
                    const aboveTile = this.tiles
                        .getChildren()
                        .find(t => t.getData('col') === col && t.getData('row') === row - 1);

                    if (aboveTile) {
                        aboveTile.emit('move', offset)
                    } else {
                        offset++;
                    }
                }
            });

            for (let i = 0; i < offset; i++) {
                this.addTile(col, i, offset);
            }
        });
    }
    
    checkAvailableTurns() {
        let canTurn = false;

        const figuresList = this.tiles.getChildren();

        for (let i = 0; i < figuresList.length; i++) {
            const tile = figuresList[i];
            
            if (this.getNeighbourTiles(tile).length) {
                canTurn = true;
                break;
            }
        }

        if (!canTurn) {
            this.scene.gameOver(gameOverReasons.noTurnsAvailable)
        }

        this.onTilesListChanged();
    }

    onTilesListChanged() {
        if (this.scene.scores >= this.scene.scoresToWin) {
            this.scene.gameOver(gameOverReasons.youWon);
        } else {
            if (this.scene.turns <= 0) {
                this.scene.gameOver(gameOverReasons.turnsAreOver);
            }
        }
    }
}