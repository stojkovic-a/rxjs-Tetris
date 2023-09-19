import { IKeysDown, IGameState, IRectangle } from "../interfaces";
import { Component } from "./component";
import { Board } from "./board";
import { BACKGROUND_ASPECT_RATIO, BACKGROUND_BLOCKS_HEIGHT, BACKGROUND_BLOCKS_WIDTH, BOARD_BLOCKS_HEIGHt, BOARD_BLOCKS_WIDTH, BOARD_BLOCK_SHIFT_X, BOARD_BLOCK_SHIFT_Y, BOARD_BORDER_SHIFT_X, BOARD_BORDER_SHIFT_Y, FALLING_NUM_OF_FRAMES } from "../config";
import { drawImage } from "../services";
import { GamePhase, Shapes } from "../enums";
import { Game } from "../game";
import { GlobalImageMap } from "../services";
export class Shape extends Component {

    public readonly block: Shapes;
    protected image: HTMLImageElement;
    public posX: number;
    public posY: number;
    protected readonly board: Board;
    public bgBound: IRectangle;
    public readonly shapeBound: IRectangle;
    public moving: boolean;
    rotation: number;
    tickTime: number;
    public colisionDetectionMatrix: number[][]

    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        block: Shapes,
        tickTime: number,
        cdm: number[][],
        moving: boolean,
        board: Board,
        bgBounds: IRectangle,
        posX: number,
        posY: number
    ) {
        super(ctx, gameState);
        this.image = GlobalImageMap.imageMap.get(Shapes[block].toString() + "block");
        this.posX = posX;
        this.posY = posY;
        this.rotation = 0;
        this.block = block;
        this.tickTime = tickTime;
        this.colisionDetectionMatrix = cdm;
        this.moving = moving;
        Game.canSpawn.val = !moving;
        this.board = board;
        this.bgBound = bgBounds

        this.shapeBound = {
            x: bgBounds.width
                * BOARD_BLOCK_SHIFT_X
                + this.posX
                * BOARD_BLOCK_SHIFT_X
                * this.bgBound.width,

            y: bgBounds.height
                * BOARD_BLOCK_SHIFT_Y
                + this.posY
                * BOARD_BLOCK_SHIFT_Y
                * this.bgBound.height,

            width:
                this.colisionDetectionMatrix.length * bgBounds.width
                / BOARD_BLOCKS_WIDTH,
            height:
                this.colisionDetectionMatrix[0].length * bgBounds.height
                / BOARD_BLOCKS_HEIGHt
        }
        this.onCreate();
    }

    onCreate(): boolean {
        if (this.board) {
            const canSpawn = this.board.tryPosition(
                this.posX,
                this.posY,
                this.colisionDetectionMatrix
            );
            return canSpawn
        }
    }

    onResize(newWidth: number, newHeight: number): void {
        const bgdWidth = newHeight * BACKGROUND_ASPECT_RATIO;
        const bgHeight = newHeight;
        this.bgBound =
        {
            x: (newWidth - bgdWidth) / 2,
            y: 0,
            width: bgdWidth,
            height: bgHeight
        }
        if (this.shapeBound) {
            this.shapeBound.x =
                this.bgBound.x
                + this.bgBound.width
                * BOARD_BLOCK_SHIFT_X
                + this.posX
                * BOARD_BLOCK_SHIFT_X
                * this.bgBound.width;

            this.shapeBound.y =
                this.posY
                * BOARD_BLOCK_SHIFT_Y
                * this.bgBound.height;

            this.shapeBound.width =
                this.colisionDetectionMatrix.length
                * this.bgBound.width
                / BACKGROUND_BLOCKS_WIDTH;

            this.shapeBound.height =
                this.colisionDetectionMatrix[0].length
                * this.bgBound.height
                / BACKGROUND_BLOCKS_HEIGHT;
        }
    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING && this.moving) {
            if (keysDown["ArrowUp"]) {
                this.rotate();
                return -1;
            } else
                if (keysDown["ArrowDown"]) {
                    if (this.board.tryPosition(
                        this.posX,
                        this.posY + 1,
                        this.colisionDetectionMatrix
                    )) {
                        this.posY++;
                        this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                        this.render();
                        return -1;
                    } else {
                        const { check, num } = this.board.tryAdd(
                            this,
                            this.posX,
                            this.posY,
                            this.colisionDetectionMatrix
                        );
                        if (!check) throw new Error("Impossible position");
                        this.moving = false;
                        this.tickTime = Infinity;
                        Game.canSpawn.val = true;
                        return num;
                    }
                } else
                    if (keysDown["ArrowLeft"]) {
                        if (this.board.tryPosition(
                            this.posX - 1,
                            this.posY,
                            this.colisionDetectionMatrix
                        )) {
                            this.posX--;
                            this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                            this.render();
                        }
                    } else
                        if (keysDown["ArrowRight"]) {
                            if (this.board.tryPosition(
                                this.posX + 1,
                                this.posY,
                                this.colisionDetectionMatrix
                            )) {
                                this.posX++;
                                this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                                this.render();
                            }
                        } else
                            if (keysDown['Space']) {
                                let num = 0
                                do {
                                    num = this.update(0, { keys: ["ArrowDown"], ["ArrowDown"]: true });
                                } while (num === -1);
                                this.moving = false;
                                this.tickTime = Infinity;
                                Game.canSpawn.val = true;
                                return num;
                            }
            return -1;
        }
    }

    calculateWidthCoef(): number {
        let minColumn: number = this.colisionDetectionMatrix[0].length;
        let maxColumn: number = -1;
        for (let i = 0; i < this.colisionDetectionMatrix[0].length; i++) {
            let rowHasBlock: boolean = false;
            for (let j = 0; j < this.colisionDetectionMatrix.length; j++) {
                if (this.colisionDetectionMatrix[j][i] === 1) {
                    rowHasBlock = true;
                    break;
                }
            }
            if (rowHasBlock) {
                if (i < minColumn)
                    minColumn = i;
                if (i > maxColumn)
                    maxColumn = i;
            }
        }
        if (minColumn > maxColumn)
            throw new Error("Impossible shape");

        return (maxColumn - minColumn + 1) / this.colisionDetectionMatrix[0].length;
    }

    calculateHeightCoef(): number {
        let minRow: number = this.colisionDetectionMatrix.length + 1;
        let maxRow: number = -1;
        for (let i = 0; i < this.colisionDetectionMatrix.length; i++) {
            let columnHasBlock: boolean = false;
            for (let j = 0; j < this.colisionDetectionMatrix[i].length; j++) {
                if (this.colisionDetectionMatrix[i][j] === 1) {
                    columnHasBlock = true;
                    break;
                }
            }
            if (columnHasBlock) {
                if (i < minRow)
                    minRow = i;
                if (i > maxRow)
                    maxRow = i;
            }
        }
        if (minRow > maxRow)
            throw new Error("Impossible shape");

        return (maxRow - minRow + 1) / this.colisionDetectionMatrix.length;
    }

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width && this.moving) {
            if (this.shapeBound) {
                this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BLOCK_SHIFT_X + this.posX * BOARD_BLOCK_SHIFT_X * this.bgBound.width
                this.shapeBound.y = this.posY * BOARD_BLOCK_SHIFT_Y * this.bgBound.height;
                this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
                this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
            }
            let drawingRect: IRectangle = null;
            const heightCoef: number = this.calculateHeightCoef();
            const widthCoef: number = this.calculateWidthCoef();
            this.colisionDetectionMatrix.forEach((row, rowInd) => {
                row.forEach((element, colInd) => {
                    if (element === 1) {
                        drawingRect = {
                            x: this.shapeBound.x + colInd * this.shapeBound.width / this.colisionDetectionMatrix.length,
                            y: this.shapeBound.y + rowInd * this.shapeBound.height / this.colisionDetectionMatrix[rowInd].length,
                            height: this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT,
                            width: this.bgBound.width / BACKGROUND_BLOCKS_WIDTH
                        }
                        drawImage(this.ctx, this.image, drawingRect);
                    }
                })
            })
        }
    }

    rotateMatrixCounterClockwise(matrix: number[][]): number[][] {
        const numRows = matrix.length;
        const numCols = matrix[0].length;

        const rotatedMatrix: number[][] = new Array(numCols).fill(null).map(() => []);

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                rotatedMatrix[numCols - col - 1].push(matrix[row][col]);
            }
        }

        return rotatedMatrix;
    }

    shiftColMatrixUp(matrix: number[][]): number[][] {
        const numRows = matrix.length;
        const numCols = matrix[0].length;

        const newMatrix: number[][] = new Array(numRows).fill(0).map(() => new Array(numCols).fill(0));
        matrix.forEach((row, rowInd) => row.forEach((element, colInd) => newMatrix[rowInd][colInd] = element));

        let firstRowHas1: boolean = false;
        do {
            for (let i = 0; i < newMatrix[0].length; i++) {
                if (newMatrix[0][i] === 1) {
                    firstRowHas1 = true;
                    break;
                }
            }
            if (!firstRowHas1) {
                for (let i = 0; i < newMatrix.length - 1; i++) {
                    for (let j = 0; j < newMatrix[i].length; j++) {
                        newMatrix[i][j] = newMatrix[i + 1][j];
                    }
                }
                for (let j = 0; j < newMatrix[0].length; j++) {
                    newMatrix[newMatrix.length - 1][j] = 0;
                }
            }

        } while (!firstRowHas1)
        return newMatrix;
    }

    shiftColMatLeft(matrix: number[][]): number[][] {
        const numRows = matrix.length;
        const numCols = matrix[0].length;

        const newMatrix: number[][] = new Array(numRows).fill(0).map(() => new Array(numCols).fill(0));
        matrix.forEach((row, rowInd) => row.forEach((element, colInd) => newMatrix[rowInd][colInd] = element));

        let firstColumnHas1: boolean = false;
        do {
            for (let i = 0; i < newMatrix.length; i++) {
                if (newMatrix[i][0] === 1) {
                    firstColumnHas1 = true;
                    break;
                }
            }
            if (!firstColumnHas1) {
                for (let i = 0; i < newMatrix[0].length - 1; i++) {
                    for (let j = 0; j < newMatrix.length; j++) {
                        newMatrix[j][i] = newMatrix[j][i + 1];
                    }
                }
                for (let j = 0; j < newMatrix.length; j++) {
                    newMatrix[j][newMatrix[0].length - 1] = 0;
                }
            }

        } while (!firstColumnHas1)
        return newMatrix;
    }

    rightestMatrixPoint(matrix: number[][]): number {
        let rightestIndex = 0;
        matrix.forEach(row => {
            row.forEach((value, index) => {
                if (value === 1 && index > rightestIndex) {
                    rightestIndex = index;
                }
            })
        });
        return rightestIndex;
    }

    lowestMatrixPoint(matrix: number[][]): number {
        let lowsetIndex = 0;
        matrix.forEach((row, index) => {
            row.forEach((value) => {
                console.log(value);
                if (value === 1 && index > lowsetIndex) {
                    lowsetIndex = index;
                }
            })
        });
        return lowsetIndex;
    }



    rotate(): void {
        let rotationNew = (this.rotation + 1) % 4;
        let newCDM = this.rotateMatrixCounterClockwise(this.colisionDetectionMatrix);
        newCDM = this.shiftColMatLeft(newCDM);
        newCDM = this.shiftColMatrixUp(newCDM);
        let shiftLeftBy = this.posX + this.rightestMatrixPoint(newCDM) + 1 - this.board.getSizeX();
        shiftLeftBy = Math.max(0, shiftLeftBy);
        if (this.board.tryPosition(this.posX - shiftLeftBy, this.posY, newCDM)) {
            this.rotation = rotationNew;
            this.colisionDetectionMatrix = newCDM;
            this.posX -= shiftLeftBy;
        }
        this.render();
    }

    hasColided(): boolean {
        return this.moving;
    }


}


export class Block extends Shape {
    public type: string;
    currentFallingFrame: number;
    animationPositionY: number;
    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        block: Shapes,
        tickTime: number,
        moving: boolean,
        board: Board,
        bgBounds: IRectangle,
        posX: number,
        posY: number,
        type: string,
        animationPositionY: number
    ) {
        super(ctx,
            gameState,
            block,
            tickTime,
            [[1]],
            moving,
            board,
            bgBounds,
            posX,
            posY
        );
        this.type = type;
        this.currentFallingFrame = 0;
        this.animationPositionY = animationPositionY;
    }

    getImage(): HTMLImageElement {
        return this.image;
    }
    getBlock(): Shapes {
        return this.block
    }
    getBgBounds(): IRectangle {
        return this.bgBound;
    }
    getType(): string {
        return this.type;
    }
    onCreate(): boolean {
        if (this.board) {
            const canSpawn = this.board.tryPosition(this.posX, this.posY, this.colisionDetectionMatrix);
            return canSpawn
        }
    }

    onResize(newWidth: number, newHeight: number): void {
        const bgdWidth = newHeight * BACKGROUND_ASPECT_RATIO;
        const bgHeight = newHeight;
        this.bgBound =
        {
            x: (newWidth - bgdWidth) / 2,
            y: 0,
            width: bgdWidth,
            height: bgHeight
        }
        if (this.shapeBound) {
            this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BLOCK_SHIFT_X + this.posX * BOARD_BLOCK_SHIFT_X * this.bgBound.width
            this.shapeBound.y = this.posY * BOARD_BLOCK_SHIFT_Y * this.bgBound.height;
            this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
            this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
        }

    }

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width) {
            if (this.shapeBound) {
                this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BLOCK_SHIFT_X + this.posX * BOARD_BLOCK_SHIFT_X * this.bgBound.width
                this.shapeBound.y = this.animationPositionY * BOARD_BLOCK_SHIFT_Y * this.bgBound.height;
                this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
                this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
                drawImage(this.ctx, this.image, this.shapeBound);
            }
        }
    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.moving) {
            if (this.currentFallingFrame < FALLING_NUM_OF_FRAMES) {
                this.animationPositionY = this.animationPositionY + (this.posY - this.animationPositionY) / (FALLING_NUM_OF_FRAMES - this.currentFallingFrame);
                this.currentFallingFrame++;
                this.render();
            } else {
                this.animationPositionY = Math.round(this.animationPositionY);
                this.moving = false;
            }
        }
        return 0;
    }

    rotate(): void {
    }

    hasColided(): boolean {
        return !this.moving;
    }

}