import { IBoolNumber, IGameState, IKeysDown } from "../interfaces";
import { Component } from "./component";
import { Block, Shape } from "./shape";
import { Game } from "../game";
import { scoreFormula } from "../services";

export class Board extends Component {
    private _sizeX: number;
    private _sizeY: number;
    private _board: Boolean[][];
    private _blocks: Block[][];

    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        x: number,
        y: number
    ) {
        super(ctx, gameState);
        this._sizeX = x;
        this._sizeY = y;
        this._board = new Array(y + 1).fill([]).map(() => new Array(x).fill(false));
        this._blocks = new Array(y).fill([]).map(() => new Array(x).fill(null));
        for (let i = 0; i < this._sizeY; i++) {
            for (let j = 0; j < this._sizeX; j++) {
                this._board[i][j] = false;
                this._blocks[i][j] = null;
            }
        }
        for (let i = 0; i < this._sizeX; i++) {
            this._board[this._sizeY][i] = true;
        }
    }

    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {
        if (this._blocks !== undefined)
            this._blocks.forEach((row, i) => {
                row.forEach((element, j) => {
                    element.onResize(newWidth, newHeight);
                })
            })
    }

    update(delta: number, keysDown: IKeysDown): void {
        this._blocks.forEach((row, i) => {
            row.forEach((element, j) => {
                if (element != null) {
                    element.update(delta, keysDown);
                }
            })
        })
    }

    render(): void {
        for (let i = 0; i < this._blocks.length; i++) {
            for (let j = 0; j < this._blocks[0].length; j++) {
                if (this._blocks[i][j] !== null) {
                    this._blocks[i][j].render();
                }
            }
        }

    }

    tryPosition(posX: number, posY: number, mat: number[][]): boolean {
        const sizeY = mat.length;
        const sizeX = mat[0].length;
        let canPos: boolean = true;
        for (let i = 0; i < sizeY; i++) {
            for (let j = 0; j < sizeX; j++) {
                if (mat[i][j] === 1 && this._board[i + posY][j + posX]) {
                    canPos = false;
                    return canPos;
                }
                if (
                    mat[i][j] === 1
                    &&
                    (i + posY >= this._sizeY || j + posX >= this._sizeX)
                ) {
                    canPos = false;
                    return canPos;
                }
                if (mat[i][j] === 1 && (i + posY < 0 || j + posX < 0)) {
                    canPos = false;
                    return canPos;
                }
            }
        }
        return canPos;
    }

    canAdd(posX: number, posY: number, mat: number[][]): boolean {
        if (!this.tryPosition(posX, posY, mat)) return false;
        let canAdd: boolean = false;
        mat.forEach((row, i) => {
            row.forEach((element, j) => {
                if (element === 1 && this._board[i + posY + 1][j + posX]) {
                    canAdd = true;
                    return canAdd
                }
            })
        })
        return canAdd;
    }

    tryAdd(shape: Shape, posX: number, posY: number, mat: number[][]): IBoolNumber {
        if (this.canAdd) {
            mat.forEach((row, i) => {
                row.forEach((element, j) => {
                    if (element === 1) {
                        this._board[i + posY][j + posX] = true;
                    }
                })
            })
            this.switchShapeWithBlocks(shape);
            const numRemoved = this.removeFullRows();
            return { check: true, num: numRemoved }
        }
        return { check: false, num: 0 };
    }

    removeFullRows(): number {
        let numRemoved = 0;
        for (let i = 0; i < this._sizeY; i++) {
            let rowIsFull = true;
            for (let j = 0; j < this._sizeX; j++) {
                if (!this._board[i][j]) {
                    rowIsFull = false;
                    break;
                }
            }
            if (rowIsFull) {
                numRemoved++;
                for (let j = 0; j < this._sizeX; j++) {
                    this._board[i][j] = false;
                    this._blocks[i][j] = null;
                }
                this.lowerFlyingRows(i);
            }
        }
        this.gameState.score += scoreFormula(numRemoved);
        this.gameState.player.score += scoreFormula(numRemoved);
        Game.gameState.player.linesCleared += numRemoved;
        return numRemoved;
    }

    lowerFlyingRows(removedRow: number): void {
        for (let i = removedRow; i > 0; i--) {
            for (let j = 0; j < this._sizeX; j++) {
                this._board[i][j] = this._board[i - 1][j];
                if (this._blocks[i - 1][j] === null) {
                    this._blocks[i][j] = null;
                } else {
                    this._blocks[i][j] = new Block(
                        this.ctx,
                        this.gameState,
                        this._blocks[i - 1][j].getBlock(),
                        0,
                        true,
                        this,
                        this._blocks[i - 1][j].getBgBounds(),
                        this._blocks[i - 1][j].posX,
                        this._blocks[i - 1][j].posY + 1,
                        this._blocks[i - 1][j].getType(),
                        this._blocks[i - 1][j].posY,
                    )
                }
            }
        }
        for (let i = 0; i < this._sizeX; i++) {
            this._board[0][i] = false;
            this._blocks[0][i] = null;
        }
    }

    getBoard(): Boolean[][] {
        return this._board;
    }

    getSizeX(): number {
        return this._sizeX;
    }

    getSizeY(): number {
        return this._sizeY;
    }

    switchShapeWithBlocks(shape: Shape) {
        for (let i = 0; i < shape.colisionDetectionMatrix.length; i++) {
            for (let j = 0; j < shape.colisionDetectionMatrix[0].length; j++) {
                if (shape.colisionDetectionMatrix[i][j] === 1) {
                    this._blocks[i + shape.posY][j + shape.posX] = new Block(
                        this.ctx,
                        this.gameState,
                        shape.block,
                        0,
                        false,
                        this,
                        shape.bgBound,
                        shape.posX + j,
                        shape.posY + i,
                        shape.block.toString(),
                        shape.posY + i,
                    );
                    this._blocks[i + shape.posY][j + shape.posX].render();
                }
            }
        }
    }

    clear(): void {
        this._board = new Array(this._sizeY + 1).fill([]).map(() => new Array(this._sizeX).fill(false));
        this._blocks = new Array(this._sizeY).fill([]).map(() => new Array(this._sizeX).fill(null));
        for (let i = 0; i < this._sizeY; i++) {
            for (let j = 0; j < this._sizeX; j++) {
                this._board[i][j] = false;
                this._blocks[i][j] = null;
            }
        }
        for (let i = 0; i < this._sizeX; i++) {
            this._board[this._sizeY][i] = true;
        }
    }
}