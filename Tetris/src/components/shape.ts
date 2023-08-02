import { IKeysDown } from "../interfaces/IKeysDown";
import { Component } from "./component";
import { IShapes } from "../interfaces/IShapes";
import { IGameState } from "../interfaces/IGameState";
import { IShapeTypes } from "../interfaces/IShapeTypes";
import { Shapes } from "../enums/Shapes";
import { Board } from "./board";
export abstract class Shape extends Component {

    protected readonly block: Shapes;
    protected readonly image: HTMLImageElement;
    protected readonly posX: number;
    protected readonly posY: number;
    protected readonly board: Board;
    public readonly moving: Boolean;
    rotation: number;
    speed: number;
    protected colisionDetectionMatrix: Number[][]

    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement,
        block: Shapes,
        speed: number,
        cdm: number[][],
        moving: boolean,
        board: Board
    ) {
        super(ctx, gameState);
        this.image = image;
        this.posX = 0;
        this.posY = 0;
        this.rotation = 0;
        this.block = block;
        this.speed = speed;
        this.colisionDetectionMatrix = cdm;
        this.moving = moving;
        this.board = board;
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
        speed: number,
        moving: boolean,
        board: Board
    ) {
        super(ctx,
            gameState,
            image,
            block,
            speed,
            [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]],
            moving,
            board
        );
    }

    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {

    }

    update(delta: number, keysDown: IKeysDown): void {

    }

    render(): void {

    }

    rotate(): void {
        let rotationNew = this.rotation % 2;

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
        speed: number,
        moving: boolean,
        board: Board
    ) {
        super(ctx,
            gameState,
            image,
            block,
            speed,
            [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
            moving,
            board
        );
    }

    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {

    }

    update(delta: number, keysDown: IKeysDown): void {

    }

    render(): void {

    }
    rotate(): void {
        let rotationNew = this.rotation % 4;

        if (rotationNew === 0) {
            let newCDM = [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
        } else
            if (rotationNew === 1) {
                let newCDM = [[0, 1, 0], [1, 1, 0], [0, 1, 0]];
            } else
                if (rotationNew === 2) {
                    let newCDM = [[1, 1, 1], [0, 1, 0], [0, 0, 0]];
                } else
                    if (rotationNew === 3) {
                        let newCDM = [[1, 0, 0], [1, 1, 0], [1, 0, 0]];
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
        speed: number,
        moving: boolean,
        board: Board
    ) {
        super(ctx,
            gameState,
            image,
            block,
            speed,
            [[1, 1], [1, 1]],
            moving,
            board
        );
    }

    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {

    }

    update(delta: number, keysDown: IKeysDown): void {

    }

    render(): void {

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
        speed: number,
        moving: boolean,
        board: Board
    ) {
        super(ctx,
            gameState,
            image,
            block,
            speed,
            [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            moving,
            board
        );
    }

    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {

    }

    update(delta: number, keysDown: IKeysDown): void {

    }

    render(): void {

    }
    rotate(): void {
        let rotationNew = this.rotation % 2;
        if (rotationNew === 0) {
            let newCDM = [[0, 1, 1], [1, 1, 0], [0, 0, 0]];
        } else
            if (rotationNew === 1) {
                let newCDM = [[1, 0, 0], [1, 1, 0], [0, 1, 0]];
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
        speed: number,
        moving: boolean,
        board: Board
    ) {
        super(ctx,
            gameState,
            image,
            block,
            speed,
            [[1, 1, 0], [0, 1, 1]],
            moving,
            board
        );
    }

    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {

    }

    update(delta: number, keysDown: IKeysDown): void {

    }

    render(): void {

    }
    rotate(): void {
        let rotationNew = this.rotation % 2;
        if (rotationNew === 0) {
            let newCDM = [[1, 1,], [0, 1, 1], [0, 0, 0]];
        } else
            if (rotationNew === 1) {
                let newCDM = [[0, 1, 0], [1, 1, 0], [1, 0, 0]];
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
        speed: number,
        moving: boolean,
        board: Board
    ) {
        super(ctx,
            gameState,
            image,
            block,
            speed,
            [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
            moving,
            board
        );
    }

    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {

    }

    update(delta: number, keysDown: IKeysDown): void {

    }

    render(): void {

    }
    rotate(): void {
        let rotationNew = this.rotation % 4;

        if (rotationNew === 0) {
            let newCDM = [[0, 0, 1], [1, 1, 1], [0, 0, 0]];
        } else
            if (rotationNew === 1) {
                let newCDM = [[1, 1, 0], [0, 1, 0], [0, 1, 0]];
            } else
                if (rotationNew === 2) {
                    let newCDM = [[1, 1, 1], [1, 0, 0], [0, 0, 0]];
                } else
                    if (rotationNew === 3) {
                        let newCDM = [[1, 0, 0], [1, 0, 0], [1, 1, 0]];
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
        speed: number,
        moving: boolean,
        board: Board
    ) {
        super(ctx,
            gameState,
            image,
            block,
            speed,
            [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            moving,
            board
        );
    }

    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {

    }

    update(delta: number, keysDown: IKeysDown): void {

    }

    render(): void {

    }
    rotate(): void {
        let rotationNew = this.rotation % 4;

        if (rotationNew === 0) {
            let newCDM = [[1, 0, 0], [1, 1, 1], [0, 0, 0]];
        } else
            if (rotationNew === 1) {
                let newCDM = [[0, 1, 0], [0, 1, 0], [1, 1, 0]];
            } else
                if (rotationNew === 2) {
                    let newCDM = [[1, 1, 1], [0, 0, 1], [0, 0, 0]];
                } else
                    if (rotationNew === 3) {
                        let newCDM = [[1, 1, 0], [1, 0, 0], [1, 0, 0]];
                    }
    }
    hasColided(): boolean {
        return false;
    }

}