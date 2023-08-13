import { IKeysDown } from "../interfaces/IKeysDown";
import { Component } from "./component";
import { IShapes } from "../interfaces/IShapes";
import { IGameState } from "../interfaces/IGameState";
import { IShapeTypes } from "../interfaces/IShapeTypes";
import { Shapes } from "../enums/Shapes";
import { Board } from "./board";
import { IRectangle } from "../interfaces/IRectangle";
import { BACKGROUND_ASPECT_RATIO, BACKGROUND_BLOCKS_HEIGHT, BACKGROUND_BLOCKS_WIDTH, BOARD_BLOCKS_HEIGHt, BOARD_BLOCKS_WIDTH, BOARD_BORDER_SHIFT_X, BOARD_BORDER_SHIFT_Y } from "../config";
import { drawImage } from "../services/renderServices";
import { GamePhase } from "../enums/GamePhase";
import { Game } from "../game";
export abstract class Shape extends Component {

    public readonly block: Shapes;
    protected readonly image: HTMLImageElement;
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
        image: HTMLImageElement,
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
        this.image = image;
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
            x: bgBounds.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width,
            y: bgBounds.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height,
            width: this.colisionDetectionMatrix.length * bgBounds.width / BOARD_BLOCKS_WIDTH,
            height: this.colisionDetectionMatrix[0].length * bgBounds.height / BOARD_BLOCKS_HEIGHt
        }
        this.onCreate();
    }

    abstract onCreate(): boolean

    abstract onResize(newWidth: number, newHeight: number): void

    abstract update(delta: number, keysDown: IKeysDown): void

    abstract render(): void
    abstract rotate(): void
    abstract hasColided(): boolean


}

export class ShapeI extends Shape {
    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement,
        block: Shapes,
        tickTime: number,
        moving: boolean,
        board: Board,
        bgBounds: IRectangle,
        posX: number,
        posY: number
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]],
            moving,
            board,
            bgBounds,
            posX,
            posY
        );

    }

    onCreate(): boolean {
        if (this.board) {
            const canSpawn = this.board.tryPosition(this.posX, this.posY, this.colisionDetectionMatrix);
            console.log(canSpawn, 'log from shape.ts checking it shape can be spawned');
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
            this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
            this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
            this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
            this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
        }
    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING && this.moving) {
            console.log(keysDown);
            if (keysDown['ArrowUp']) {
                this.rotate();
                return -1;
            } else
                if (keysDown["ArrowDown"]) {
                    if (this.board.tryPosition(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                        this.render();
                        return -1;
                    } else {
                        const { check, num } = this.board.tryAdd(this, this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        this.moving = false;
                        this.tickTime = Infinity;
                        Game.canSpawn.val = true;
                        return num;
                    }
                } else
                    if (keysDown["ArrowLeft"]) {
                        if (this.board.tryPosition(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                            this.render();
                        }
                    } else
                        if (keysDown["ArrowRight"]) {
                            if (this.board.tryPosition(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
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

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width && this.moving) {
            if (this.shapeBound) {
                this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
                this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
                this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
                this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
            }
            let drawingRect: IRectangle = null;
            if (this.rotation === 0) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height,
                    width: this.shapeBound.width / 4
                }
            } else if (this.rotation === 1) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height / 4,
                    width: this.shapeBound.width
                }
            }
            drawImage(this.ctx, this.image, drawingRect);
        }
    }

    rotate(): void {
        let rotationNew = (this.rotation + 1) % 2;

        if (rotationNew === 0) {
            let newCDM = [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
                this.image.style.transform = 'rotate(-90deg)';
            }
        } else
            if (rotationNew === 1) {
                let newCDM = [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
                    this.image.style.transform = 'rotate(-90deg)';
                } else
                    if (this.posX + 4 > this.board.getSizeX()) {
                        let shiftByX = this.posX + 4 - this.board.getSizeX();
                        if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                            this.rotation = rotationNew;
                            this.colisionDetectionMatrix = newCDM;
                            this.image.style.transform = 'rotate(-90deg)';
                        }

                    }
            }

    }

    hasColided(): boolean {
        return this.moving;
    }

}



export class ShapeT extends Shape {
    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement,
        block: Shapes,
        tickTime: number,
        moving: boolean,
        board: Board,
        bgBounds: IRectangle,
        posX: number,
        posY: number
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
            moving,
            board,
            bgBounds,
            posX,
            posY
        );
    }


    onCreate(): boolean {
        if (this.board) {
            const canSpawn = this.board.tryPosition(this.posX, this.posY, this.colisionDetectionMatrix);
            console.log(canSpawn, 'log from shape.ts checking it shape can be spawned');
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
            this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
            this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
            this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH
            this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
        }
    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING && this.moving) {
            console.log(keysDown);
            if (keysDown["ArrowUp"]) {
                this.rotate();
                return -1;
            } else
                if (keysDown["ArrowDown"]) {
                    if (this.board.tryPosition(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                        this.render();
                        return -1;
                    } else {
                        const { check, num } = this.board.tryAdd(this, this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        this.moving = false;
                        this.tickTime = Infinity;
                        Game.canSpawn.val = true;
                        return num;
                    }
                } else
                    if (keysDown["ArrowLeft"]) {
                        if (this.board.tryPosition(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                            this.render();
                        }
                    } else
                        if (keysDown["ArrowRight"]) {
                            if (this.board.tryPosition(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
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

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width && this.moving) {
            if (this.shapeBound) {
                this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
                this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
                this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
                this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
            }
            let drawingRect: IRectangle = null;
            if (this.rotation === 0) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height * 2 / 3,
                    width: this.shapeBound.width
                }
            } else if (this.rotation === 1) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height,
                    width: this.shapeBound.width * 2 / 3
                }
            } else if (this.rotation === 2) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height * 2 / 3,
                    width: this.shapeBound.width
                }
            }
            else if (this.rotation === 3) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height,
                    width: this.shapeBound.width * 2 / 3
                }
            }
            drawImage(this.ctx, this.image, drawingRect);
        }
    }
    rotate(): void {
        let rotationNew = (this.rotation + 1) % 4;

        if (rotationNew === 0) {
            let newCDM = [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
                this.image.style.transform = 'rotate(-90deg)';
            } else
                if (this.posX + 3 > this.board.getSizeX()) {
                    let shiftByX = this.posX + 3 - this.board.getSizeX();
                    if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                        this.image.style.transform = 'rotate(-90deg)';
                    }

                }
        } else
            if (rotationNew === 1) {
                let newCDM = [[0, 1, 0], [1, 1, 0], [0, 1, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
                    this.image.style.transform = 'rotate(-90deg)';
                } //else
                //     if (this.posX + 3 > this.board.getSizeX()) {
                //         let shiftByX = this.posX + 3 - this.board.getSizeX();
                //         if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                //             this.rotation = rotationNew;
                //             this.colisionDetectionMatrix = newCDM;
                //         }

                //     }
            } else
                if (rotationNew === 2) {
                    let newCDM = [[1, 1, 1], [0, 1, 0], [0, 0, 0]];
                    if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                        this.image.style.transform = 'rotate(-90deg)';
                    } else
                        if (this.posX + 3 > this.board.getSizeX()) {
                            let shiftByX = this.posX + 3 - this.board.getSizeX();
                            if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                                this.rotation = rotationNew;
                                this.colisionDetectionMatrix = newCDM;
                                this.image.style.transform = 'rotate(-90deg)';
                            }

                        }
                } else
                    if (rotationNew === 3) {
                        let newCDM = [[1, 0, 0], [1, 1, 0], [1, 0, 0]];
                        if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                            this.rotation = rotationNew;
                            this.colisionDetectionMatrix = newCDM;
                            this.image.style.transform = 'rotate(-90deg)';
                        } //else
                        //     if (this.posX + 3 > this.board.getSizeX()) {
                        //         let shiftByX = this.posX + 3 - this.board.getSizeX();
                        //         if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        //             this.rotation = rotationNew;
                        //             this.colisionDetectionMatrix = newCDM;
                        //         }

                        //     }
                    }

    }
    hasColided(): boolean {
        return this.moving;
    }

}

export class ShapeO extends Shape {
    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement,
        block: Shapes,
        tickTime: number,
        moving: boolean,
        board: Board,
        bgBounds: IRectangle,
        posX: number,
        posY: number
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[1, 1], [1, 1]],
            moving,
            board,
            bgBounds,
            posX,
            posY
        );
    }


    onCreate(): boolean {
        if (this.board) {
            const canSpawn = this.board.tryPosition(this.posX, this.posY, this.colisionDetectionMatrix);
            console.log(canSpawn, 'log from shape.ts checking it shape can be spawned');
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
            this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
            this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
            this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
            this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
        }
    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING && this.moving) {
            console.log(keysDown);
            if (keysDown["ArrowUp"]) {
                this.rotate();
                return -1;
            } else
                if (keysDown["ArrowDown"]) {
                    if (this.board.tryPosition(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                        this.render();
                        return -1;
                    } else {
                        const { check, num } = this.board.tryAdd(this, this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        this.moving = false;
                        this.tickTime = Infinity;
                        Game.canSpawn.val = true;
                        return num;
                    }
                } else
                    if (keysDown["ArrowLeft"]) {
                        if (this.board.tryPosition(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                            this.render();
                        }
                    } else
                        if (keysDown["ArrowRight"]) {
                            if (this.board.tryPosition(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
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

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width && this.moving) {
            if (this.shapeBound) {
                this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
                this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
                this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
                this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
            }
            drawImage(this.ctx, this.image, this.shapeBound);
        }
    }
    rotate(): void {
        return;
    }
    hasColided(): boolean {
        return this.moving;
    }

}



export class ShapeS extends Shape {
    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement,
        block: Shapes,
        tickTime: number,
        moving: boolean,
        board: Board,
        bgBounds: IRectangle,
        posX: number,
        posY: number
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            moving,
            board,
            bgBounds,
            posX,
            posY
        );
    }


    onCreate(): boolean {
        if (this.board) {
            const canSpawn = this.board.tryPosition(this.posX, this.posY, this.colisionDetectionMatrix);
            console.log(canSpawn, 'log from shape.ts checking it shape can be spawned');
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
            this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
            this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
            this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
            this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
        }
    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING && this.moving) {
            console.log(keysDown);
            if (keysDown["ArrowUp"]) {
                this.rotate();
                return -1;
            } else
                if (keysDown["ArrowDown"]) {
                    if (this.board.tryPosition(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                        this.render();
                        return -1;
                    } else {
                        const { check, num } = this.board.tryAdd(this, this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        this.moving = false;
                        this.tickTime = Infinity;
                        Game.canSpawn.val = true;
                        return num;
                    }
                } else
                    if (keysDown["ArrowLeft"]) {
                        if (this.board.tryPosition(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                            this.render();
                        }
                    } else
                        if (keysDown["ArrowRight"]) {
                            if (this.board.tryPosition(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
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

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width && this.moving) {
            if (this.shapeBound) {
                this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
                this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
                this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
                this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
            }
            let drawingRect: IRectangle = null;
            if (this.rotation === 0) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height * 2 / 3,
                    width: this.shapeBound.width
                }
            } else if (this.rotation === 1) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height,
                    width: this.shapeBound.width * 2 / 3
                }
            }
            drawImage(this.ctx, this.image, drawingRect);
        }
    }
    rotate(): void {
        let rotationNew = (this.rotation + 1) % 2;
        if (rotationNew === 0) {
            let newCDM = [[0, 1, 1], [1, 1, 0], [0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
                this.image.style.transform = 'rotate(-90deg)';
            } else
                if (this.posX + 3 > this.board.getSizeX()) {
                    let shiftByX = this.posX + 3 - this.board.getSizeX();
                    if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                        this.image.style.transform = 'rotate(-90deg)';
                    }

                }
        } else
            if (rotationNew === 1) {
                let newCDM = [[1, 0, 0], [1, 1, 0], [0, 1, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
                    this.image.style.transform = 'rotate(-90deg)';
                }// else
                //     if (this.posX + 3 > this.board.getSizeX()) {
                //         let shiftByX = this.posX + 3 - this.board.getSizeX();
                //         if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                //             this.rotation = rotationNew;
                //             this.colisionDetectionMatrix = newCDM;
                //         }

                //     }
            }
    }
    hasColided(): boolean {
        return this.moving;
    }

}




export class ShapeZ extends Shape {
    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement,
        block: Shapes,
        tickTime: number,
        moving: boolean,
        board: Board,
        bgBounds: IRectangle,
        posX: number,
        posY: number
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
            moving,
            board,
            bgBounds,
            posX,
            posY
        );
    }


    onCreate(): boolean {
        if (this.board) {
            const canSpawn = this.board.tryPosition(this.posX, this.posY, this.colisionDetectionMatrix);
            console.log(canSpawn, 'log from shape.ts checking it shape can be spawned');
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
            this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
            this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
            this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
            this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
        }

    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING && this.moving) {
            console.log(keysDown);
            if (keysDown["ArrowUp"]) {
                this.rotate();
                return -1;
            } else
                if (keysDown["ArrowDown"]) {
                    if (this.board.tryPosition(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                        this.render();
                        return -1;
                    } else {
                        const { check, num } = this.board.tryAdd(this, this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        this.moving = false;
                        this.tickTime = Infinity;
                        Game.canSpawn.val = true;
                        return num;
                    }
                } else
                    if (keysDown["ArrowLeft"]) {
                        if (this.board.tryPosition(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                            this.render();
                        }
                    } else
                        if (keysDown["ArrowRight"]) {
                            if (this.board.tryPosition(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
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

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width && this.moving) {
            if (this.shapeBound) {
                this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
                this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
                this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
                this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
            }
            let drawingRect: IRectangle = null;
            if (this.rotation === 0) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height * 2 / 3,
                    width: this.shapeBound.width
                }
            } else if (this.rotation === 1) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height,
                    width: this.shapeBound.width * 2 / 3
                }
            }
            drawImage(this.ctx, this.image, drawingRect);
        }
    }
    rotate(): void {
        let rotationNew = (this.rotation + 1) % 2;
        if (rotationNew === 0) {
            let newCDM = [[1, 1,], [0, 1, 1], [0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
                this.image.style.transform = 'rotate(-90deg)';
            } else
                if (this.posX + 3 > this.board.getSizeX()) {
                    let shiftByX = this.posX + 3 - this.board.getSizeX();
                    if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                        this.image.style.transform = 'rotate(-90deg)';
                    }

                }
        } else
            if (rotationNew === 1) {
                let newCDM = [[0, 1, 0], [1, 1, 0], [1, 0, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
                    this.image.style.transform = 'rotate(-90deg)';
                }// else
                //     if (this.posX + 3 > this.board.getSizeX()) {
                //         let shiftByX = this.posX + 3 - this.board.getSizeX();
                //         if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                //             this.rotation = rotationNew;
                //             this.colisionDetectionMatrix = newCDM;
                //         }

                //     }
            }
    }
    hasColided(): boolean {
        return this.moving;
    }

}


export class ShapeL extends Shape {
    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement,
        block: Shapes,
        tickTime: number,
        moving: boolean,
        board: Board,
        bgBounds: IRectangle,
        posX: number,
        posY: number
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
            moving,
            board,
            bgBounds,
            posX,
            posY
        );
    }


    onCreate(): boolean {
        if (this.board) {
            const canSpawn = this.board.tryPosition(this.posX, this.posY, this.colisionDetectionMatrix);
            console.log(canSpawn, 'log from shape.ts checking it shape can be spawned');
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
            this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
            this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
            this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
            this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
        }

    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING && this.moving) {
            console.log(keysDown);
            if (keysDown["ArrowUp"]) {
                this.rotate();
                return -1;
            } else
                if (keysDown["ArrowDown"]) {
                    if (this.board.tryPosition(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                        this.render();
                        return -1;
                    } else {
                        const { check, num } = this.board.tryAdd(this, this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        this.moving = false;
                        this.tickTime = Infinity;
                        Game.canSpawn.val = true;
                        return num;
                    }
                } else
                    if (keysDown["ArrowLeft"]) {
                        if (this.board.tryPosition(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                            this.render();
                        }
                    } else
                        if (keysDown["ArrowRight"]) {
                            if (this.board.tryPosition(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
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

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width && this.moving) {
            if (this.shapeBound) {
                this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
                this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
                this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
                this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
            }
            let drawingRect: IRectangle = null;
            if (this.rotation === 0) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height * 2 / 3,
                    width: this.shapeBound.width
                }
            } else if (this.rotation === 1) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height,
                    width: this.shapeBound.width * 2 / 3
                }
            } else if (this.rotation === 2) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height * 2 / 3,
                    width: this.shapeBound.width
                }
            }
            else if (this.rotation === 3) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height,
                    width: this.shapeBound.width * 2 / 3
                }
            }
            drawImage(this.ctx, this.image, drawingRect);
        }
    }
    rotate(): void {
        let rotationNew = (this.rotation + 1) % 4;

        if (rotationNew === 0) {
            let newCDM = [[0, 0, 1], [1, 1, 1], [0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
                this.image.style.transform = 'rotate(-90deg)';
            } else
                if (this.posX + 3 > this.board.getSizeX()) {
                    let shiftByX = this.posX + 3 - this.board.getSizeX();
                    if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                        this.image.style.transform = 'rotate(-90deg)';
                    }

                }
        } else
            if (rotationNew === 1) {
                let newCDM = [[1, 1, 0], [0, 1, 0], [0, 1, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
                    this.image.style.transform = 'rotate(-90deg)';
                }// else
                //     if (this.posX + 3 > this.board.getSizeX()) {
                //         let shiftByX = this.posX + 3 - this.board.getSizeX();
                //         if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                //             this.rotation = rotationNew;
                //             this.colisionDetectionMatrix = newCDM;
                //         }

                //     }
            } else
                if (rotationNew === 2) {
                    let newCDM = [[1, 1, 1], [1, 0, 0], [0, 0, 0]];
                    if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                        this.image.style.transform = 'rotate(-90deg)';
                    } else
                        if (this.posX + 3 > this.board.getSizeX()) {
                            let shiftByX = this.posX + 3 - this.board.getSizeX();
                            if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                                this.rotation = rotationNew;
                                this.colisionDetectionMatrix = newCDM;
                                this.image.style.transform = 'rotate(-90deg)';
                            }

                        }
                } else
                    if (rotationNew === 3) {
                        let newCDM = [[1, 0, 0], [1, 0, 0], [1, 1, 0]];
                        if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                            this.rotation = rotationNew;
                            this.colisionDetectionMatrix = newCDM;
                            this.image.style.transform = 'rotate(-90deg)';
                        }// else
                        //     if (this.posX + 3 > this.board.getSizeX()) {
                        //         let shiftByX = this.posX + 3 - this.board.getSizeX();
                        //         if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        //             this.rotation = rotationNew;
                        //             this.colisionDetectionMatrix = newCDM;
                        //         }

                        //     }
                    }
    }
    hasColided(): boolean {
        return this.moving;
    }

}


export class ShapeJ extends Shape {
    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement,
        block: Shapes,
        tickTime: number,
        moving: boolean,
        board: Board,
        bgBounds: IRectangle,
        posX: number,
        posY: number
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            moving,
            board,
            bgBounds,
            posX,
            posY
        );
    }


    onCreate(): boolean {
        if (this.board) {
            const canSpawn = this.board.tryPosition(this.posX, this.posY, this.colisionDetectionMatrix);
            console.log(canSpawn, 'log from shape.ts checking it shape can be spawned');
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
            this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
            this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
            this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
            this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
        }

    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING && this.moving) {
            console.log(keysDown);
            if (keysDown["ArrowUp"]) {
                this.rotate();
                return -1;
            } else
                if (keysDown["ArrowDown"]) {
                    if (this.board.tryPosition(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                        this.render();
                        return -1;
                    } else {
                        const { check, num } = this.board.tryAdd(this, this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        this.moving = false;
                        this.tickTime = Infinity;
                        Game.canSpawn.val = true;
                        return num;
                    }
                } else
                    if (keysDown["ArrowLeft"]) {
                        if (this.board.tryPosition(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.ctx.canvas.width, this.ctx.canvas.height);
                            this.render();
                        }
                    } else
                        if (keysDown["ArrowRight"]) {
                            if (this.board.tryPosition(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
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

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width && this.moving) {
            if (this.shapeBound) {
                this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
                this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
                this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
                this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
            }
            let drawingRect: IRectangle = null;
            if (this.rotation === 0) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height * 2 / 3,
                    width: this.shapeBound.width
                }
            } else if (this.rotation === 1) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height,
                    width: this.shapeBound.width * 2 / 3
                }
            } else if (this.rotation === 2) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height * 2 / 3,
                    width: this.shapeBound.width
                }
            }
            else if (this.rotation === 3) {
                drawingRect = {
                    x: this.shapeBound.x,
                    y: this.shapeBound.y,
                    height: this.shapeBound.height,
                    width: this.shapeBound.width * 2 / 3
                }
            }
            drawImage(this.ctx, this.image, drawingRect);
        }
    }
    rotate(): void {
        let rotationNew = (this.rotation + 1) % 4;

        if (rotationNew === 0) {
            let newCDM = [[1, 0, 0], [1, 1, 1], [0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
                this.image.style.transform = 'rotate(-90deg)';
            } else
                if (this.posX + 3 > this.board.getSizeX()) {
                    let shiftByX = this.posX + 3 - this.board.getSizeX();
                    if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                        this.image.style.transform = 'rotate(-90deg)';
                    }

                }
        } else
            if (rotationNew === 1) {
                let newCDM = [[0, 1, 0], [0, 1, 0], [1, 1, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
                    this.image.style.transform = 'rotate(-90deg)';
                }// else
                //     if (this.posX + 3 > this.board.getSizeX()) {
                //         let shiftByX = this.posX + 3 - this.board.getSizeX();
                //         if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                //             this.rotation = rotationNew;
                //             this.colisionDetectionMatrix = newCDM;
                //         }

                //     }
            } else
                if (rotationNew === 2) {
                    let newCDM = [[1, 1, 1], [0, 0, 1], [0, 0, 0]];
                    if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                        this.image.style.transform = 'rotate(-90deg)';
                    } else
                        if (this.posX + 3 > this.board.getSizeX()) {
                            let shiftByX = this.posX + 3 - this.board.getSizeX();
                            if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                                this.rotation = rotationNew;
                                this.colisionDetectionMatrix = newCDM;
                                this.image.style.transform = 'rotate(-90deg)';
                            }

                        }
                } else
                    if (rotationNew === 3) {
                        let newCDM = [[1, 1, 0], [1, 0, 0], [1, 0, 0]];
                        if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                            this.rotation = rotationNew;
                            this.colisionDetectionMatrix = newCDM;
                            this.image.style.transform = 'rotate(-90deg)';
                        }// else
                        //     if (this.posX + 3 > this.board.getSizeX()) {
                        //         let shiftByX = this.posX + 3 - this.board.getSizeX();
                        //         if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        //             this.rotation = rotationNew;
                        //             this.colisionDetectionMatrix = newCDM;
                        //         }

                        //     }
                    }
    }
    hasColided(): boolean {
        return this.moving;
    }

}

export class Block extends Shape {
    public type: string;
    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement,
        block: Shapes,
        tickTime: number,
        moving: boolean,
        board: Board,
        bgBounds: IRectangle,
        posX: number,
        posY: number,
        type: string
    ) {
        super(ctx,
            gameState,
            image,
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
    }


    onCreate(): boolean {
        if (this.board) {
            const canSpawn = this.board.tryPosition(this.posX, this.posY, this.colisionDetectionMatrix);
            console.log(canSpawn, 'log from shape.ts checking it shape can be spawned');
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
            this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
            this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
            this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
            this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
        }

    }

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width) {
            if (this.shapeBound) {
                this.shapeBound.x = this.bgBound.x + this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
                this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
                this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BACKGROUND_BLOCKS_WIDTH;
                this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BACKGROUND_BLOCKS_HEIGHT;
                drawImage(this.ctx, this.image, this.shapeBound);
            }
        }
    }

    update(delta: number, keysDown: IKeysDown): void {
    }

    rotate(): void {
    }

    hasColided(): boolean {
        return true;
    }
}