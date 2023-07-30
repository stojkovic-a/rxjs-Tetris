import { debounceTime, fromEvent } from "rxjs";
import { GamePhase } from "./enums/GamePhase";

export class Game {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly gamePhase: GamePhase;

    constructor(canvas: HTMLCanvasElement) {
        if (!canvas.getContext) {
            throw new Error("Canvas is not supported in this browser");
        }
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
    }

    init() {
        fromEvent(window, 'resize')
            .pipe(debounceTime(100))
            .subscribe(() => {
                this.resize(window.innerWidth, window.innerHeight);
            })
    }

    resize(newWidth:number,newHeight:number){
        this.canvas.width=newWidth;
        this.canvas.height=newHeight;
        this.context.imageSmoothingEnabled=false;

        //todo: element resize
    }
}