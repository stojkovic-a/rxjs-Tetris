import { sample } from "rxjs";
import { IBoolNumber } from "../interfaces/IBoolNumber";
import { IGameState } from "../interfaces/IGameState";
import { IKeysDown } from "../interfaces/IKeysDown";
import { loadShapeSprites$ } from "../services/imageLoader";
import { Component } from "./component";
import { Block, Shape } from "./shape";
import { Game } from "../game";
import { GlobalImageMap } from "./globalImageMap";
import { Shapes } from "../enums/Shapes";

export class Board extends Component {
    private _sizeX: number;
    private _sizeY: number;
    private _board: Boolean[][];
    private _blocks: Block[][];
    // private sprites: { type: string, img: HTMLImageElement }[] = [];
    private images: Map<string, HTMLImageElement> = new Map();
    private canSpawn: Game;


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

        const sprites: { type: string, img: HTMLImageElement }[] = [];

        // loadShapeSprites$().
        //     pipe(

        // )
        //     .subscribe(
        //         (x) => {
        //             console.log(x);
        //             sprites.push(x);
        //         }
        //     );


        // sprites.map(sprite => {
        //     this.images.set(sprite.type, sprite.img);
        // });

    }

    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {
        if (this._blocks !== undefined)
            for (let i = 0; i < this._blocks.length; i++) {
                for (let j = 0; j < this._blocks[0].length; j++) {
                    if (this._blocks[i][j] !== null) {
                        this._blocks[i][j].onResize(newWidth, newHeight);
                    }
                }
            }
    }

    update(delta: number, keysDown: IKeysDown): void {
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

    tryAdd(shape: Shape, posX: number, posY: number, mat: number[][]): IBoolNumber {
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
        this.gameState.score += 100 * numRemoved;
        this.gameState.player.score += 100 * numRemoved;
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
                        this._blocks[i - 1][j].getImage(),
                        this._blocks[i - 1][j].getBlock(),
                        0,
                        false,
                        this,
                        this._blocks[i - 1][j].getBgBounds(),
                        this._blocks[i - 1][j].posX,
                        this._blocks[i - 1][j].posY + 1,
                        this._blocks[i - 1][j].getType()
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
                    // console.log("ggggggggggggggggggggggggg",shape)
                    // console.log("ppppppppppppppppppp",Shapes[shape.block]);
                    // console.log('asasdasadasadsads',GlobalImageMap.imageMap.get(shape.block.toString()+'block'));
                    // console.log(GlobalImageMap.imageMap);
                    this._blocks[i + shape.posY][j + shape.posX] = new Block(
                        this.ctx,
                        this.gameState,
                        // this.images.get(shape.block.toString() + 'block'),
                        GlobalImageMap.imageMap.get(Shapes[shape.block] + 'block'),
                        shape.block,
                        0,
                        false,
                        this,
                        shape.bgBound,
                        shape.posX + j,
                        shape.posY + i,
                        shape.block.toString());
                    this._blocks[i + shape.posY][j + shape.posX].render();
                    console.log(this._blocks[i + shape.posY][j + shape.posX].type);
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