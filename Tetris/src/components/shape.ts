import { IKeysDown } from "../interfaces/IKeysDown";
import { Component } from "./component";
import { IShapes } from "../interfaces/IShapes";
import { IGameState } from "../interfaces/IGameState";
import { IShapeTypes } from "../interfaces/IShapeTypes";
import { Shapes } from "../enums/Shapes";
import { Board } from "./board";
import { IRectangle } from "../interfaces/IRectangle";
import { BACKGROUND_ASPECT_RATIO, BOARD_BLOCKS_HEIGHt, BOARD_BLOCKS_WIDTH, BOARD_BORDER_SHIFT_X, BOARD_BORDER_SHIFT_Y } from "../config";
import { drawImage } from "../services/renderServices";
import { GamePhase } from "../enums/GamePhase";
export abstract class Shape extends Component {

    protected readonly block: Shapes;
    protected readonly image: HTMLImageElement;
    protected posX: number;
    protected posY: number;
    protected readonly board: Board;
    protected bgBound: IRectangle;
    protected readonly shapeBound: IRectangle;
    public readonly moving: Boolean;
    rotation: number;
    tickTime: number;
    protected colisionDetectionMatrix: number[][]

    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement,
        block: Shapes,
        tickTime: number,
        cdm: number[][],
        moving: boolean,
        board: Board,
        bgBounds: IRectangle
    ) {
        super(ctx, gameState);
        this.image = image;
        this.posX = 0;
        this.posY = 0;
        this.rotation = 0;
        this.block = block;
        this.tickTime = tickTime;
        this.colisionDetectionMatrix = cdm;
        this.moving = moving;
        this.board = board;
        this.bgBound = bgBounds

        this.shapeBound.x = bgBounds.width * BOARD_BORDER_SHIFT_X;
        this.shapeBound.y = bgBounds.height * BOARD_BORDER_SHIFT_Y;
        this.shapeBound.width = this.colisionDetectionMatrix.length * bgBounds.width / BOARD_BLOCKS_WIDTH;
        this.shapeBound.height = this.colisionDetectionMatrix[0].length * bgBounds.height / BOARD_BLOCKS_HEIGHt;
    }

    abstract onCreate(): void

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
        bgBounds: IRectangle
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]],
            moving,
            board,
            bgBounds
        );

    }

    onCreate(): void {
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
        this.shapeBound.x = this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
        this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
        this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BOARD_BLOCKS_WIDTH;
        this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BOARD_BLOCKS_HEIGHt;
    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING) {
            if (keysDown.keys[0] === "ArrowUp") {
                this.rotate();
                return 0;
            } else
                if (keysDown.keys[0] === "ArrowDown") {
                    if (this.board.canAdd(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.bgBound.width, this.bgBound.height);
                        this.render();
                        return 0;
                    } else {
                        const { check, num } = this.board.tryAdd(this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        return num;
                    }
                } else
                    if (keysDown.keys[0] === "ArrowLeft") {
                        if (this.board.canAdd(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.bgBound.width, this.bgBound.height);
                            this.render();
                        }
                    } else
                        if (keysDown.keys[0] === "ArrowRight") {
                            if (this.board.canAdd(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
                                this.posX++;
                                this.onResize(this.bgBound.width, this.bgBound.height);
                                this.render();
                            }
                        }
        }
    }

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width) {
            drawImage(this.ctx, this.image, this.shapeBound);
        }
    }

    rotate(): void {
        let rotationNew = (this.rotation + 1) % 2;

        if (rotationNew === 0) {
            let newCDM = [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
            }
        } else
            if (rotationNew === 1) {
                let newCDM = [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
                } else
                    if (this.posX + 4 > this.board.getSizeX()) {
                        let shiftByX = this.posX + 4 - this.board.getSizeX();
                        if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                            this.rotation = rotationNew;
                            this.colisionDetectionMatrix = newCDM;
                        }

                    }
            }

    }

    hasColided(): boolean {
        return false;
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
        bgBounds: IRectangle
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
            moving,
            board,
            bgBounds
        );
    }

    onCreate(): void {
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
        this.shapeBound.x = this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
        this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
        this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BOARD_BLOCKS_WIDTH;
        this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BOARD_BLOCKS_HEIGHt;
    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING) {
            if (keysDown.keys[0] === "ArrowUp") {
                this.rotate();
                return 0;
            } else
                if (keysDown.keys[0] === "ArrowDown") {
                    if (this.board.canAdd(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.bgBound.width, this.bgBound.height);
                        this.render();
                        return 0;
                    } else {
                        const { check, num } = this.board.tryAdd(this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        return num;
                    }
                } else
                    if (keysDown.keys[0] === "ArrowLeft") {
                        if (this.board.canAdd(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.bgBound.width, this.bgBound.height);
                            this.render();
                        }
                    } else
                        if (keysDown.keys[0] === "ArrowRight") {
                            if (this.board.canAdd(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
                                this.posX++;
                                this.onResize(this.bgBound.width, this.bgBound.height);
                                this.render();
                            }
                        }
        }
    }

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width) {
            drawImage(this.ctx, this.image, this.shapeBound);
        }
    }
    rotate(): void {
        let rotationNew = (this.rotation + 1) % 4;

        if (rotationNew === 0) {
            let newCDM = [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
            } else
                if (this.posX + 3 > this.board.getSizeX()) {
                    let shiftByX = this.posX + 3 - this.board.getSizeX();
                    if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                    }

                }
        } else
            if (rotationNew === 1) {
                let newCDM = [[0, 1, 0], [1, 1, 0], [0, 1, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
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
                    } else
                        if (this.posX + 3 > this.board.getSizeX()) {
                            let shiftByX = this.posX + 3 - this.board.getSizeX();
                            if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                                this.rotation = rotationNew;
                                this.colisionDetectionMatrix = newCDM;
                            }

                        }
                } else
                    if (rotationNew === 3) {
                        let newCDM = [[1, 0, 0], [1, 1, 0], [1, 0, 0]];
                        if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                            this.rotation = rotationNew;
                            this.colisionDetectionMatrix = newCDM;
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
        return false;
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
        bgBounds: IRectangle
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[1, 1], [1, 1]],
            moving,
            board,
            bgBounds
        );
    }

    onCreate(): void {
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
        this.shapeBound.x = this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
        this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
        this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BOARD_BLOCKS_WIDTH;
        this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BOARD_BLOCKS_HEIGHt;
    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING) {
            if (keysDown.keys[0] === "ArrowUp") {
                this.rotate();
                return 0;
            } else
                if (keysDown.keys[0] === "ArrowDown") {
                    if (this.board.canAdd(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.bgBound.width, this.bgBound.height);
                        this.render();
                        return 0;
                    } else {
                        const { check, num } = this.board.tryAdd(this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        return num;
                    }
                } else
                    if (keysDown.keys[0] === "ArrowLeft") {
                        if (this.board.canAdd(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.bgBound.width, this.bgBound.height);
                            this.render();
                        }
                    } else
                        if (keysDown.keys[0] === "ArrowRight") {
                            if (this.board.canAdd(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
                                this.posX++;
                                this.onResize(this.bgBound.width, this.bgBound.height);
                                this.render();
                            }
                        }
        }
    }

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width) {
            drawImage(this.ctx, this.image, this.shapeBound);
        }
    }
    rotate(): void {
        return;
    }
    hasColided(): boolean {
        return false;
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
        bgBounds: IRectangle
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            moving,
            board,
            bgBounds
        );
    }

    onCreate(): void {
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
        this.shapeBound.x = this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
        this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
        this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BOARD_BLOCKS_WIDTH;
        this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BOARD_BLOCKS_HEIGHt;

    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING) {
            if (keysDown.keys[0] === "ArrowUp") {
                this.rotate();
                return 0;
            } else
                if (keysDown.keys[0] === "ArrowDown") {
                    if (this.board.canAdd(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.bgBound.width, this.bgBound.height);
                        this.render();
                        return 0;
                    } else {
                        const { check, num } = this.board.tryAdd(this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        return num;
                    }
                } else
                    if (keysDown.keys[0] === "ArrowLeft") {
                        if (this.board.canAdd(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.bgBound.width, this.bgBound.height);
                            this.render();
                        }
                    } else
                        if (keysDown.keys[0] === "ArrowRight") {
                            if (this.board.canAdd(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
                                this.posX++;
                                this.onResize(this.bgBound.width, this.bgBound.height);
                                this.render();
                            }
                        }
        }
    }

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width) {
            drawImage(this.ctx, this.image, this.shapeBound);
        }
    }
    rotate(): void {
        let rotationNew = (this.rotation + 1) % 2;
        if (rotationNew === 0) {
            let newCDM = [[0, 1, 1], [1, 1, 0], [0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
            } else
                if (this.posX + 3 > this.board.getSizeX()) {
                    let shiftByX = this.posX + 3 - this.board.getSizeX();
                    if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                    }

                }
        } else
            if (rotationNew === 1) {
                let newCDM = [[1, 0, 0], [1, 1, 0], [0, 1, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
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
        return false;
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
        bgBounds: IRectangle
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[1, 1, 0], [0, 1, 1]],
            moving,
            board,
            bgBounds
        );
    }

    onCreate(): void {
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
        this.shapeBound.x = this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
        this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
        this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BOARD_BLOCKS_WIDTH;
        this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BOARD_BLOCKS_HEIGHt;

    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING) {
            if (keysDown.keys[0] === "ArrowUp") {
                this.rotate();
                return 0;
            } else
                if (keysDown.keys[0] === "ArrowDown") {
                    if (this.board.canAdd(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.bgBound.width, this.bgBound.height);
                        this.render();
                        return 0;
                    } else {
                        const { check, num } = this.board.tryAdd(this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        return num;
                    }
                } else
                    if (keysDown.keys[0] === "ArrowLeft") {
                        if (this.board.canAdd(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.bgBound.width, this.bgBound.height);
                            this.render();
                        }
                    } else
                        if (keysDown.keys[0] === "ArrowRight") {
                            if (this.board.canAdd(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
                                this.posX++;
                                this.onResize(this.bgBound.width, this.bgBound.height);
                                this.render();
                            }
                        }
        }
    }

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width) {
            drawImage(this.ctx, this.image, this.shapeBound);
        }
    }
    rotate(): void {
        let rotationNew = (this.rotation + 1) % 2;
        if (rotationNew === 0) {
            let newCDM = [[1, 1,], [0, 1, 1], [0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
            } else
                if (this.posX + 3 > this.board.getSizeX()) {
                    let shiftByX = this.posX + 3 - this.board.getSizeX();
                    if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                    }

                }
        } else
            if (rotationNew === 1) {
                let newCDM = [[0, 1, 0], [1, 1, 0], [1, 0, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
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
        return false;
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
        bgBounds: IRectangle
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
            moving,
            board,
            bgBounds
        );
    }

    onCreate(): void {
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
        this.shapeBound.x = this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
        this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
        this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BOARD_BLOCKS_WIDTH;
        this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BOARD_BLOCKS_HEIGHt;

    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING) {
            if (keysDown.keys[0] === "ArrowUp") {
                this.rotate();
                return 0;
            } else
                if (keysDown.keys[0] === "ArrowDown") {
                    if (this.board.canAdd(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.bgBound.width, this.bgBound.height);
                        this.render();
                        return 0;
                    } else {
                        const { check, num } = this.board.tryAdd(this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        return num;
                    }
                } else
                    if (keysDown.keys[0] === "ArrowLeft") {
                        if (this.board.canAdd(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.bgBound.width, this.bgBound.height);
                            this.render();
                        }
                    } else
                        if (keysDown.keys[0] === "ArrowRight") {
                            if (this.board.canAdd(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
                                this.posX++;
                                this.onResize(this.bgBound.width, this.bgBound.height);
                                this.render();
                            }
                        }
        }
    }

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width) {
            drawImage(this.ctx, this.image, this.shapeBound);
        }
    }
    rotate(): void {
        let rotationNew = (this.rotation + 1) % 4;

        if (rotationNew === 0) {
            let newCDM = [[0, 0, 1], [1, 1, 1], [0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
            } else
                if (this.posX + 3 > this.board.getSizeX()) {
                    let shiftByX = this.posX + 3 - this.board.getSizeX();
                    if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                    }

                }
        } else
            if (rotationNew === 1) {
                let newCDM = [[1, 1, 0], [0, 1, 0], [0, 1, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
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
                    } else
                        if (this.posX + 3 > this.board.getSizeX()) {
                            let shiftByX = this.posX + 3 - this.board.getSizeX();
                            if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                                this.rotation = rotationNew;
                                this.colisionDetectionMatrix = newCDM;
                            }

                        }
                } else
                    if (rotationNew === 3) {
                        let newCDM = [[1, 0, 0], [1, 0, 0], [1, 1, 0]];
                        if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                            this.rotation = rotationNew;
                            this.colisionDetectionMatrix = newCDM;
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
        return false;
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
        bgBounds: IRectangle
    ) {
        super(ctx,
            gameState,
            image,
            block,
            tickTime,
            [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            moving,
            board,
            bgBounds
        );
    }

    onCreate(): void {
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
        this.shapeBound.x = this.bgBound.width * BOARD_BORDER_SHIFT_X + this.posX * BOARD_BORDER_SHIFT_X * this.bgBound.width
        this.shapeBound.y = this.bgBound.height * BOARD_BORDER_SHIFT_Y + this.posY * BOARD_BORDER_SHIFT_Y * this.bgBound.height;
        this.shapeBound.width = this.colisionDetectionMatrix.length * this.bgBound.width / BOARD_BLOCKS_WIDTH;
        this.shapeBound.height = this.colisionDetectionMatrix[0].length * this.bgBound.height / BOARD_BLOCKS_HEIGHt;

    }

    update(delta: number, keysDown: IKeysDown): number {
        if (this.gameState.currentState === GamePhase.PLAYING) {
            if (keysDown.keys[0] === "ArrowUp") {
                this.rotate();
                return 0;
            } else
                if (keysDown.keys[0] === "ArrowDown") {
                    if (this.board.canAdd(this.posX, this.posY + 1, this.colisionDetectionMatrix)) {
                        this.posY++;
                        this.onResize(this.bgBound.width, this.bgBound.height);
                        this.render();
                        return 0;
                    } else {
                        const { check, num } = this.board.tryAdd(this.posX, this.posY, this.colisionDetectionMatrix);
                        if (!check) throw new Error("Impossible position");
                        return num;
                    }
                } else
                    if (keysDown.keys[0] === "ArrowLeft") {
                        if (this.board.canAdd(this.posX - 1, this.posY, this.colisionDetectionMatrix)) {
                            this.posX--;
                            this.onResize(this.bgBound.width, this.bgBound.height);
                            this.render();
                        }
                    } else
                        if (keysDown.keys[0] === "ArrowRight") {
                            if (this.board.canAdd(this.posX + 1, this.posY, this.colisionDetectionMatrix)) {
                                this.posX++;
                                this.onResize(this.bgBound.width, this.bgBound.height);
                                this.render();
                            }
                        }
        }
    }

    render(): void {
        if (this.bgBound.x <= this.ctx.canvas.width) {
            drawImage(this.ctx, this.image, this.shapeBound);
        }
    }
    rotate(): void {
        let rotationNew = (this.rotation + 1) % 4;

        if (rotationNew === 0) {
            let newCDM = [[1, 0, 0], [1, 1, 1], [0, 0, 0]];
            if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                this.rotation = rotationNew;
                this.colisionDetectionMatrix = newCDM;
            } else
                if (this.posX + 3 > this.board.getSizeX()) {
                    let shiftByX = this.posX + 3 - this.board.getSizeX();
                    if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                        this.rotation = rotationNew;
                        this.colisionDetectionMatrix = newCDM;
                    }

                }
        } else
            if (rotationNew === 1) {
                let newCDM = [[0, 1, 0], [0, 1, 0], [1, 1, 0]];
                if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                    this.rotation = rotationNew;
                    this.colisionDetectionMatrix = newCDM;
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
                    } else
                        if (this.posX + 3 > this.board.getSizeX()) {
                            let shiftByX = this.posX + 3 - this.board.getSizeX();
                            if (this.board.tryPosition(this.posX - shiftByX, this.posY, newCDM)) {
                                this.rotation = rotationNew;
                                this.colisionDetectionMatrix = newCDM;
                            }

                        }
                } else
                    if (rotationNew === 3) {
                        let newCDM = [[1, 1, 0], [1, 0, 0], [1, 0, 0]];
                        if (this.board.tryPosition(this.posX, this.posY, newCDM)) {
                            this.rotation = rotationNew;
                            this.colisionDetectionMatrix = newCDM;
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
        return false;
    }

}