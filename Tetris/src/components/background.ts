import { BACKGROUND_ASPECT_RATIO } from "../config";
import { IGameState } from "../interfaces/IGameState";
import { IKeysDown } from "../interfaces/IKeysDown";
import { IRectangle } from "../interfaces/IRectangle";
import { drawImage } from "../services/renderServices";
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
        const bgdWidth = newHeight * BACKGROUND_ASPECT_RATIO;
        const bgHeight = newHeight;

        this._rect = [
            {
                x: (newWidth - bgdWidth) / 2,
                y: 0,
                width: bgdWidth,
                height: bgHeight
            },

        ];
    }

    update(delta: number, keysDown: IKeysDown): void {

    }

    render(): void {
        this._rect.forEach((rect) => {
            if (rect.x <= this.ctx.canvas.width) {
                drawImage(this.ctx, this._image, rect);
            }
        });
    }

    getRect():IRectangle[]{
        return this._rect;
    }
}