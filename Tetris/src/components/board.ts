import { IBoolNumber } from "../interfaces/IBoolNumber";
import { IGameState } from "../interfaces/IGameState";
import { IKeysDown } from "../interfaces/IKeysDown";
import { Component } from "./component";

export class Board extends Component {
    private _sizeX: number;
    private _sizeY: number;
    private _board: Boolean[][]


    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        x: number,
        y: number
    ) {
        super(ctx, gameState);
        this._sizeX = x;
        this._sizeY = y;
        for (let i = 0; i < this._sizeY; i++) {
            for (let j = 0; j < this._sizeX; j++) {
                this._board[i][j] = false;
            }
        }
        for (let i = 0; i < this._sizeX; i++) {
            this._board[this._sizeY][i] = true;
        }
    }
    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {
    }

    update(delta: number, keysDown: IKeysDown): void {
    }

    render(): void {
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
                if (mat[i][j] === 1 && (i + posY >= this._sizeY || j + posX >= this._sizeX)) {
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
        const sizeY = mat.length;
        const sizeX = mat[0].length;
        let canAdd: boolean = false;
        for (let i = 0; i < sizeY; i++) {
            for (let j = 0; j < sizeX; j++) {
                if (mat[i][j] === 1 && this._board[i + posY + 1][j + posX]) {
                    canAdd = true;
                    return canAdd
                }
            }
        }
        return canAdd;
    }

    tryAdd(posX: number, posY: number, mat: number[][]): IBoolNumber {
        const sizeY = mat.length;
        const sizeX = mat[0].length;
        if (this.canAdd) {
            for (let i = 0; i < sizeY; i++) {
                for (let j = 0; j < sizeX; j++) {
                    if (mat[i][j] === 1) {
                        this._board[i + posY][j + posX] = true;
                    }
                }
            }
            const numRemoved = this.removeFullRows();
            return { check: true, num: numRemoved }
        }
        return { check: false, num: 0 };
    }

    removeFullRows(): number {
        let numRemoved = 0;
        for (let i = 0; i < this._board.length; i++) {
            let rowIsFull = true;
            for (let j = 0; j < this._board[i].length; j++) {
                if (!this._board[i][j]) {
                    rowIsFull = false;
                    break;
                }
            }
            if (rowIsFull) {
                numRemoved++;
                for (let j = 0; j < this._board[i].length; j++) {
                    this._board[i][j] = false;
                }
                this.lowerFlyingRows(i);
            }
        }
        return numRemoved;
    }

    lowerFlyingRows(removedRow: number): void {
        for (let i = removedRow; i > 0; i--) {
            for (let j = 0; j < this._sizeX; j++) {
                this._board[i][j] = this._board[i - 1][j];
            }
        }

        for (let i = 0; i < this._sizeX; i++) {
            this._board[0][i] = false;
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

}