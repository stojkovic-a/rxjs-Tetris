import { GamePhase } from "./enums/GamePhase";

export class Game{
    private readonly canvas:HTMLCanvasElement;
    private readonly context:CanvasRenderingContext2D;
    private readonly gamePhase:GamePhase;

    constructor(canvas:HTMLCanvasElement){
        if(!canvas.getContext){
            throw new Error("Canvas is not supported in this browser");
        }
        this.canvas=canvas;
        this.context=canvas.getContext('2d');
        this.context.imageSmoothingEnabled=false;
    }
}