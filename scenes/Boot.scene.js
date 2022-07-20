import * as Phaser from 'phaser';

const ROWS = 8;
const COLS = 6;
const RECT_SIZE = 50;
const COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff];

const TURNS = 10;
const SCORES_TO_WIN = 40;

let lastId = 1;

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
        
        this.tiles = [];
        this.selectedTilesList = [];
    }

    preload() {
    }

    create() {
        this.generateSheet(ROWS, COLS);
        
        this.addText();
    }

    update() {
    }
    
    generateSheet(rows, cols) {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
               this.createNewTile(j, i);
            }
        }
    }

    onSheetChanged() {
        console.log('!!!')
        if (this.scores >= SCORES_TO_WIN) {
            this.gameOver('youWon');
        } else {
            if (this.turns <= 0) {
                this.gameOver('noMoreTurns');
            }
        }
    }
    
    addText() {
        const textOffset = 20;
        const screenWidth = this.game.scale.gameSize.width;
        
        this.turns = TURNS;
        this.scores = 0;
        
        this.scoresToWinText = this.add
            .text(0, textOffset, 'Score ' + SCORES_TO_WIN + ' points to win!');
        
        this.turnsText = this.add
            .text(0, textOffset * 3, 'Turns: ' + this.turns);
        this.scoresText = this.add
            .text(0, textOffset * 4, 'Scores: ' + this.scores);
        
        this.scoresToWinText.x = screenWidth - this.scoresToWinText.width - textOffset;
        this.turnsText.x = screenWidth - this.turnsText.width - textOffset;
        this.scoresText.x = screenWidth - this.scoresText.width - textOffset;
    }
    
    updateTurnText() {
        this.turnsText.setText('Turns: ' + this.turns);
    }
    
    updateScoresText() {
        this.scoresText.setText('Scores: ' + this.scores);
    }
    
    getTileNeighbours(clickedTile, depth = 0) {
        const figuresList = this.scene.scene.children.list;
        
        clickedTile.setData('isChecked', true);
        
        if (depth === 0) {
            this.selectedTilesList.push(clickedTile.getData('id'));
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

        if (clickedTile.getData('col') + 1 < COLS) {
            const tile = figuresList
                .find(t => t.getData('row') === clickedTile.getData('row') && t.getData('col') === clickedTile.getData('col') + 1);
            _pushTileToArray(tile);
        }
        
        if (clickedTile.getData('col') - 1 >= 0) {
            const tile = figuresList
                .find(t => t.getData('row') === clickedTile.getData('row') && t.getData('col') === clickedTile.getData('col') - 1);
            _pushTileToArray(tile);
        }

        if (clickedTile.getData('row') + 1 < ROWS) {
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
            const tile = this.children.getByName('rect_' + id);
            
            if (!tile.getData('isChecked')) {
                this.getTileNeighbours(tile, depth + 1);
            }
        });
    }
    
    destroySelectedTiles() {
        const deletedTiles = {};

        this.scores += this.selectedTilesList.length;
        this.updateScoresText();

        this.selectedTilesList.forEach(id => {
            const tile = this.children.getByName('rect_' + id);

            const row = tile.getData('row');
            const col = tile.getData('col');
            
            if (!deletedTiles[col]) {
                deletedTiles[col] = [row];
            } else if (!deletedTiles[col].includes(row)) {
                deletedTiles[col].push(row);
            }
            
            tile.destroy();
            this.children.getByName('text_' + id).destroy();
        });
        
        const figuresList = this.scene.scene.children.list;
        
        Object.entries(deletedTiles).forEach(entry => {
            let [col, selectedRows] = entry;
            const lastRow = Math.max.apply(null, selectedRows);
            const rows = [];
            
            col = parseInt(col);

            for (let i = lastRow; i >= 0; i--) {
                rows.push(i);
            }

            const _moveTile = (tile, offset) => {
                const id = tile.getData('id');
                const currentRow = tile.getData('row');
                tile.setData('row', currentRow + offset);
                tile.y += RECT_SIZE * offset;

                const text = this.children.getByName('text_' + id);
                text.y += RECT_SIZE * offset;
            }

            let offset = 1;
            rows.forEach(row => {
                if (row - 1 >= 0) {
                    const aboveTile = figuresList.find(t => t.getData('col') === col && t.getData('row') === row - 1);
                    
                    if (aboveTile) {
                        _moveTile(aboveTile, offset);
                    } else {
                        offset++;
                    }
                }
            });
            
            for (let i = 0; i < offset; i++) {
                this.createNewTile(col, i);
            }
        });

        this.checkAvailableTurns();
    }
    
    createNewTile(col, row) {
        const x = col * RECT_SIZE + RECT_SIZE / 2;
        const y = row * RECT_SIZE + RECT_SIZE / 2;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        const tile = this.add
            .rectangle(x, y, RECT_SIZE, RECT_SIZE, color)
            .setInteractive()
            .setName('rect_' + lastId)
            .setData('id', lastId)
            .setData('type', 'tile')
            .setData('color', color)
            .setData('row', row)
            .setData('col', col);

        const text = this.add
            .text(0, 0, lastId + '\n' + row + 'x' + col)
            .setFill('#797979')
            .setName('text_' + lastId);
        Phaser.Display.Align.In.Center(text, tile);

        lastId++;
        
        const ths = this;
        tile.on('pointerup', function() {
            ths.turns--;
            ths.updateTurnText();
            
            ths.selectedTilesList = [];
            ths.getTileNeighbours(tile);

            if (ths.selectedTilesList.length > 1) {
                ths.destroySelectedTiles();
            }
        });
    }

    checkAvailableTurns() {
        let canTurn = false;

        const figuresList = this.scene.scene.children.list.filter(child => child.getData('type') === 'tile');

        for (let i = 0; i < figuresList.length; i++) {
            const tile = figuresList[i];
            
            if (tile.getData('col') + 1 < COLS) {
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

            if (tile.getData('row') + 1 < ROWS) {
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
            this.gameOver('noTurnsAvailable')
        }
        
        this.onSheetChanged();
    }

    gameOver(reason) {
        const screenWidth = this.game.scale.gameSize.width;
        const screenHeight = this.game.scale.gameSize.height;
        
        console.log(reason)
        switch (reason) {
            case 'noMoreTurns':
                this.add.text(screenWidth / 2, screenHeight / 2, 'Game Over');
                this.add.text(screenWidth / 2, screenHeight / 2 + 20, 'You have run out of turns', {align: 'center'});
                break;
                
            case 'noTurnsAvailable':
                this.add.text(screenWidth / 2, screenHeight / 2, 'Game Over');
                this.add.text(screenWidth / 2, screenHeight / 2 + 20, 'No any turns available', {align: 'center'});
                break;
                
            case 'youWon':
                this.add.text(screenWidth / 2, screenHeight / 2, 'You Won!');
                this.add.text(screenWidth / 2, screenHeight / 2 + 20, 'Collected scores: ' + this.scores, {align: 'center'});
                break;
                
            default:
                this.add.text(screenWidth / 2, screenHeight / 2, 'Game Over');
                break;
        }
        
        this.scene.pause();
    }
}