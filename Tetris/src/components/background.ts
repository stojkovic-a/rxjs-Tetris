import { IGameState } from "../interfaces/IGameState";
import { IKeysDown } from "../interfaces/IKeysDown";
import { IRectangle } from "../interfaces/IRectangle";
import { Component } from "./component";

export class Background extends Component {
    private _image: HTMLImageElement;

    private _rect: IRectangle[];

    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        image: HTMLImageElement
    ) {
        super(ctx, gameState);
        this._image = image;
    }
    
    onCreate(): void {
    }

    onResize(newWidth: number, newHeight: number): void {

    }

    update(delta: number, keysDown: IKeysDown): void {

    }

    render(): void {

    }
}