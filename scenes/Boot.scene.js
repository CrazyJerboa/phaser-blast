import * as Phaser from 'phaser';

const ROWS = 8;
const COLS = 6;
const RECT_SIZE = 50;
const COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff];

let lastId = 1;

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
        
        this.tiles = [];
        this.tilesList = [];
    }

    preload() {
    }

    create() {
        this.generateSheet(ROWS, COLS);
    }

    update() {
    }
    
    generateSheet(rows, cols) {
        const ths = this;
        
        for (let i = 0; i < rows; i++) {
            const row = [];
            
            for (let j = 0; j < cols; j++) {
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                const x = j * RECT_SIZE + RECT_SIZE / 2;
                const y = i * RECT_SIZE + RECT_SIZE / 2;
                
                const tile = this.add.rectangle(x, y, RECT_SIZE, RECT_SIZE, color).setInteractive();
                const tileData = { id: lastId, x, y, color, row: i, col: j };
                
                lastId++;
                row.push(tileData);
                
                tile.on('pointerup', function() {
                    ths.tilesList = [];
                    tileData.isChecked = false;
                    ths.getTileNeighbours(tileData);
                    console.log(ths.tilesList)
                })
            }
            
            this.tiles.push(row);
        }
    }
    
    getTileNeighbours(clickedTile, depth = 0) {
        clickedTile.isChecked = true;
        
        if (depth === 0) {
            this.tilesList.push(clickedTile);
        }

        const _pushTileToArray = (tile) => {
            if (
                tile && 
                clickedTile.color === tile.color && 
                !this.tilesList.filter(t => t.id === tile.id).length
            ) {
                tile.isChecked = false;
                this.tilesList.push(tile);
            }
        }

        if (clickedTile.col + 1 < COLS) {
            const tile = this.tiles
                .find((_, index) => index === clickedTile.row)
                .find(t => t.col === clickedTile.col + 1);
            _pushTileToArray(tile);
        }
        
        if (clickedTile.col - 1 >= 0) {
            const tile = this.tiles
                .find((_, index) => index === clickedTile.row)
                .find(t => t.col === clickedTile.col - 1);
            _pushTileToArray(tile);
        }

        if (clickedTile.row + 1 < ROWS) {
            const tile = this.tiles
                .find((_, index) => index === clickedTile.row + 1)
                .find(t => t.col === clickedTile.col);
            _pushTileToArray(tile);
        }

        if (clickedTile.row - 1 >= 0) {
            const tile = this.tiles
                .find((_, index) => index === clickedTile.row - 1)
                .find(t => t.col === clickedTile.col);
            _pushTileToArray(tile);
        }

        this.tilesList.forEach(tile => {
            if (!tile.isChecked) {
                this.getTileNeighbours(tile, depth + 1);
            }
        });
    }
}