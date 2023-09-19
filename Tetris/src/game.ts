import { Observable, Subscription, debounceTime, fromEvent } from "rxjs";
import { GamePhase } from "./enums";
import { loadBackgroundImage$, initializeMainLoop, putPlayerProfile, startSpawningShapes, TickerReset } from "./services";
import { Shape, EnterUsername, Highscores, Overlay, Background, Board } from "./components";
import { IGameState, IKeysDown, IBoolWrapper, IUsersScores } from "./interfaces";
import { BOARD_BLOCKS_HEIGHt, BOARD_BLOCKS_WIDTH, GAME_SPEED, INITIAL_GAME_STATE, SHAPE_DROP_SCORE } from "./config";

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
        Game.canSpawn.val = false;

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
            this.shapeSpawner$ = startSpawningShapes(this.ctx, Game.gameState, this.board, this.background.getRect()[0]);
        })
    }

    startRound() {
        if (this.shapeSpawner$) {
            Game.canSpawn.val = true;
            Game.gameState.currentState = GamePhase.PLAYING;
            TickerReset.stop();
            TickerReset.start();
            this.shapeSubscription = this.shapeSpawner$.subscribe(
                (shape) => {
                    if (shape) {
                        if (shape.onCreate() === false) {
                            this.die();
                        }
                        this.shapes.push(shape);
                        Game.gameState.player.score += SHAPE_DROP_SCORE;
                        Game.gameState.score += SHAPE_DROP_SCORE;
                        Game.gameState.player.elementsDroped += 1;
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
            let userScore: IUsersScores = {
                id: Game.gameState.player.id,
                username: Game.gameState.player.username,
                highscore: Game.gameState.player.highscore,
                linesCleared: Game.gameState.player.linesCleared,
                elementsDroped: Game.gameState.player.elementsDroped,
                timePlaying: Game.gameState.player.timePlaying
            };

            putPlayerProfile(userScore).then((player) => {
                Game.gameState.player = { ...player, score: Game.gameState.score };
            });
        }
        this.cleanShapesAndBoard();
    }

    cleanShapesAndBoard(): void {
        this.shapes = [];
        this.board.clear();
    }
}