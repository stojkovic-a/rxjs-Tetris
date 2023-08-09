import { Observable, debounceTime, fromEvent } from "rxjs";
import { GamePhase } from "./enums/GamePhase";
import { loadBackgroundImage$, loadShapeSprites$ } from "./services/imageLoader";
import { Shape, ShapeI } from "./components/shape";
import { EnterUsername } from "./components/enterUsername";
import { Highscores } from "./components/highscores";
import { Overlay } from "./components/overlay";
import { Background } from "./components/background";
import { IGameState } from "./interfaces/IGameState";
import { BOARD_BLOCKS_HEIGHt, BOARD_BLOCKS_WIDTH, GAME_SPEED, INITIAL_GAME_STATE, MIN_INTERVAL_MS } from "./config";
import { decreasingIntervalObservable, formula } from "./services/gameTicker";
// import { shapeSpawner } from "./services/shapeSpawner";
import { initializeMainLoop } from "./services/renderLoop";
import { IKeysDown } from "./interfaces/IKeysDown";
import { putPlayerProfile } from "./services/apiServices";
import { Board } from "./components/board";
// import { getKeysDown } from "./services/keybordInputService";
export class Game {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly gameState: IGameState;

    private background: Background;

    private shapes: Shape[];
    private enterUsername: EnterUsername;
    private highscores: Highscores;
    private overlay: Overlay
    private board:Board;


    private shapeSpawner$: Observable<number>;
    private mainLoop$:Observable<[number,IKeysDown]>;
    constructor(canvas: HTMLCanvasElement) {
        if (!canvas.getContext) {
            throw new Error("Canvas is not supported in this browser");
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.gameState = INITIAL_GAME_STATE;
        this.background = null;
        this.shapes = [];
        this.enterUsername = new EnterUsername(this.ctx, this.gameState);
        this.highscores = new Highscores(this.ctx, this.gameState);
        this.overlay = new Overlay(this.ctx, this.gameState);
        this.board=new Board(this.ctx,this.gameState,BOARD_BLOCKS_HEIGHt,BOARD_BLOCKS_WIDTH);

        // this.gameTick$ = decreasingIntervalObservable(MIN_INTERVAL_MS, formula);
        // this.shapeSpawner$ = shapeSpawner();
        this.mainLoop$=initializeMainLoop();

    }

    init() {
        fromEvent(window, 'resize')
            .pipe(debounceTime(100))
            .subscribe(() => {
                this.resize(window.innerWidth, window.innerHeight);
            })

        this.mainLoop$.subscribe(
            ([deltaTime,keysDown])=>{
                const scaledDeltaTime=deltaTime*GAME_SPEED;
                this.update(scaledDeltaTime,keysDown);
                this.render();
            }
        )


        loadBackgroundImage$().subscribe((img) => {
            this.background = new Background(this.ctx, this.gameState, img);
        })

        // this.keyboardInput$ = getKeysDown();
    }

    startRound() {

    }


    updateLogic(deltaTime:number,keysDown:IKeysDown){
        switch(this.gameState.currentState){
            case GamePhase.PLAYING:
                break;
            case GamePhase.READY:
                break;
            case GamePhase.GAME_OVER:
                if(keysDown['Space']){
                    this.startRound();
                }
                break;
        }
    }
    resize(newWidth: number, newHeight: number) {
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.ctx.imageSmoothingEnabled = false;

        this.background.onResize(newWidth,newHeight);
        this.shapes.forEach((shape)=>shape.onResize(newWidth,newHeight));
        this.enterUsername.onResize(newWidth,newHeight);
        this.highscores.onResize(newWidth,newHeight);
        this.overlay.onResize(newWidth,newHeight);
        this.board.onResize(newWidth,newHeight);
    }

    render(){
        const screenWidth=this.ctx.canvas.width;
        const screenHeight=this.ctx.canvas.height;

        this.ctx.clearRect(0,0,screenWidth,screenHeight);

        this.background.render();
        this.shapes.forEach(shape=>shape.render());
        this.overlay.render();
        this.highscores.render();
        this.enterUsername.render();
        this.board.render();
    }

    update(deltaTime:number,keysDown:IKeysDown){
        this.background.update(deltaTime,keysDown);

        this.shapes.forEach(shape=>shape.update(deltaTime,keysDown));

        this.overlay.update(deltaTime,keysDown);
        this.enterUsername.update(deltaTime,keysDown);
        this.highscores.update(deltaTime,keysDown);
        this.board.update(deltaTime,keysDown);

        this.updateLogic(deltaTime,keysDown);
    }

    die():void{
        this.shapes=[];

        this.gameState.currentState=GamePhase.GAME_OVER;

        if(this.gameState.score>this.gameState.player.highscore){
            this.gameState.player.highscore=this.gameState.score;
            putPlayerProfile(this.gameState.player).then((player)=>{
                this.gameState.player={...player,score:0};
            });
        }
    }

    //detect death and call die;
}