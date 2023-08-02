import { IGameState } from "../interfaces/IGameState";
import { IKeysDown } from "../interfaces/IKeysDown";

abstract class Component<Props = object>{
    protected readonly ctx :CanvasRenderingContext2D;
    protected readonly gameState: IGameState;
    protected readonly props?: Props;

    constructor(
        ctx: CanvasRenderingContext2D,
        gameState: IGameState,
        props?: Props,
    ) {
        this.ctx=ctx;
        this.gameState=gameState;
        this.props=props;

        this.onCreate();
        this.onResize(ctx.canvas.width,ctx.canvas.height);
    }

    abstract onCreate():void;
    abstract onResize(newWidth:number,newHeight:number):void;
    abstract update(delta:number,keysDown:IKeysDown):void;
    abstract render():void;
}

export {Component}