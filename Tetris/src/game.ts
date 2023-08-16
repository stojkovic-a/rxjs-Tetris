import { Observable, Subscription, debounceTime, fromEvent } from "rxjs";
import { GamePhase } from "./enums/GamePhase";
import { loadBackgroundImage$, loadShapeSprites$ } from "./services/imageLoader";
import { Shape, ShapeI } from "./components/shape";
import { EnterUsername } from "./components/enterUsername";
import { Highscores } from "./components/highscores";
import { Overlay } from "./components/overlay";
import { Background } from "./components/background";
import { IGameState } from "./interfaces/IGameState";
import { BOARD_BLOCKS_HEIGHt, BOARD_BLOCKS_WIDTH, GAME_SPEED, INITIAL_GAME_STATE, MIN_INTERVAL_MS, SHAPE_DROP_SCORE } from "./config";
import { decreasingIntervalObservable, formula } from "./services/gameTicker";
// import { shapeSpawner } from "./services/shapeSpawner";
import { initializeMainLoop } from "./services/renderLoop";
import { IKeysDown } from "./interfaces/IKeysDown";
import { putPlayerProfile } from "./services/apiServices";
import { Board } from "./components/board";
import { startSpawningShapes } from "./services/shapeSpawner";
import { IBoolWrapper } from "./interfaces/IBoolWrapper";
import { TickerReset } from "./components/TikerReset";
import { IUsersScores } from "./interfaces/IUsersScores";
// import { getKeysDown } from "./services/keybordInputService";
export class Game {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    public static gameState: IGameState = INITIAL_GAME_STATE;

    private background: Background;

    private shapes: Shape[];
    private enterUsername: EnterUsername;
    private highscores: Highscores;
    private overlay: Overlay
    private board: Board;
    public static canSpawn: IBoolWrapper = { val: true };


    private shapeSpawner$: Observable<Shape>;
    private shapeSubscription: Subscription;
    private mainLoop$: Observable<[number, IKeysDown]>;
    constructor(canvas: HTMLCanvasElement) {
        if (!canvas.getContext) {
            throw new Error("Canvas is not supported in this browser");
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        Game.gameState = INITIAL_GAME_STATE;
        this.background = null;
        this.shapes = [];
        this.enterUsername = new EnterUsername(this.ctx, Game.gameState);
        this.highscores = new Highscores(this.ctx, Game.gameState);
        this.overlay = new Overlay(this.ctx, Game.gameState);
        this.board = new Board(this.ctx, Game.gameState, BOARD_BLOCKS_WIDTH, BOARD_BLOCKS_HEIGHt);
        Game.canSpawn.val = true;
        // this.gameTick$ = decreasingIntervalObservable(MIN_INTERVAL_MS, formula);
        this.mainLoop$ = initializeMainLoop();
        TickerReset.stop();

    }

    init() {
        fromEvent(window, 'resize')
            .pipe(debounceTime(100))
            .subscribe(() => {
                this.resize(window.innerWidth, window.innerHeight);
            })

        this.mainLoop$.subscribe(
            ([deltaTime, keysDown]) => {
                const scaledDeltaTime = deltaTime * GAME_SPEED;
                this.update(scaledDeltaTime, keysDown);
                this.render();
            }
        )


        loadBackgroundImage$().subscribe((img) => {
            this.background = new Background(this.ctx, Game.gameState, img);
            //  this.shapeSpawner$ = startSpawningShapes(this.ctx, this.gameState,Game.canSpawn,this.board,this.background.getRect()[0]);
            this.shapeSpawner$ = startSpawningShapes(this.ctx, Game.gameState, this.board, this.background.getRect()[0]);
            // console.log(this.shapeSpawner$);
        })

        // if (this.background)
        //     this.shapeSpawner$ = startSpawningShapes(this.ctx, this.gameState, Game.canSpawn, this.board, this.background.getRect()[0]);


    }

    startRound() {
        // console.log("log from game.ts startRound() line 88");
        if (this.shapeSpawner$) {
            // console.log("lof from game.ts startRound() if shapeSpawner$",this.shapeSpawner$);
            Game.canSpawn.val = true;
            Game.gameState.currentState = GamePhase.PLAYING;
            TickerReset.stop();
            TickerReset.start();
            // console.log(Game.canSpawn.val);
            this.shapeSubscription = this.shapeSpawner$.subscribe(
                (shape) => {
                    if (shape) {
                        //console.log("log from subscribe", shape);
                        if (shape.onCreate() === false) {
                            this.die();
                        }
                        this.shapes.push(shape);
                        Game.gameState.player.score+=SHAPE_DROP_SCORE;
                        Game.gameState.score+=SHAPE_DROP_SCORE;
                        Game.gameState.player.elementsDroped+=1;
                        // console.log(shape);
                        console.log('SHAPE LENGth', this.shapes.length);
                    }
                }
            )

            Game.gameState.score = 0;
            Game.gameState.player.score = 0;
        } else {
            console.log(":(");
        }
    }


    updateLogic(deltaTime: number, keysDown: IKeysDown) {
        switch (Game.gameState.currentState) {
            case GamePhase.PLAYING:
                break;
            case GamePhase.READY:
                Game.canSpawn.val = false;
                if (keysDown['Space']) {
                    this.cleanShapesAndBoard();
                    this.startRound();
                }
                break;
            case GamePhase.GAME_OVER:
                Game.canSpawn.val = false;
                if (keysDown['Space']) {
                    this.cleanShapesAndBoard();
                    this.startRound();
                }
                break;
            case GamePhase.ENTER_NAME:
                Game.canSpawn.val = false;
                break;
        }
    }
    resize(newWidth: number, newHeight: number) {
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.ctx.imageSmoothingEnabled = false;

        this.background.onResize(newWidth, newHeight);
        this.shapes.forEach((shape) => shape.onResize(newWidth, newHeight));
        this.enterUsername.onResize(newWidth, newHeight);
        this.highscores.onResize(newWidth, newHeight);
        this.overlay.onResize(newWidth, newHeight);
        this.board.onResize(newWidth, newHeight);
    }

    render() {
        const screenWidth = this.ctx.canvas.width;
        const screenHeight = this.ctx.canvas.height;

        this.ctx.clearRect(0, 0, screenWidth, screenHeight);

        if (this.background)
            this.background.render();
        this.shapes.forEach(shape => shape.render());
        this.overlay.render();
        this.highscores.render();
        this.enterUsername.render();
        this.board.render();
    }

    update(deltaTime: number, keysDown: IKeysDown) {
        if (this.background)
            this.background.update(deltaTime, keysDown);

        this.shapes.forEach(shape => shape.update(deltaTime, keysDown));

        this.overlay.update(deltaTime, keysDown);
        this.enterUsername.update(deltaTime, keysDown);
        this.highscores.update(deltaTime, keysDown);
        this.board.update(deltaTime, keysDown);

        this.updateLogic(deltaTime, keysDown);
    }

    die(): void {
        TickerReset.stop();
        this.shapes = [];
        this.shapeSubscription.unsubscribe();
        Game.gameState.currentState = GamePhase.GAME_OVER;

        if (Game.gameState.score > Game.gameState.player.highscore) {
            Game.gameState.player.highscore = Game.gameState.score;
            let userScore:IUsersScores={
                id:Game.gameState.player.id,
                username:Game.gameState.player.username,
                highscore:Game.gameState.player.highscore,
                linesCleared:Game.gameState.player.linesCleared,
                elementsDroped:Game.gameState.player.elementsDroped,
                timePlaying:Game.gameState.player.timePlaying
            };

            putPlayerProfile(userScore).then((player) => {
                Game.gameState.player = { ...player, score:Game.gameState.score };
            });
        }
        this.cleanShapesAndBoard();
    }
    cleanShapesAndBoard():void{
        this.shapes=[];
        this.board.clear();
    }
    //detect death and call die;
}