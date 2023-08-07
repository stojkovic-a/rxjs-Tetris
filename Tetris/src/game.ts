import { Observable, debounceTime, fromEvent, map, mergeMap, switchMap, toArray, zip } from "rxjs";
import { GamePhase } from "./enums/GamePhase";
import { loadBackgroundImage$, loadShapeSprites$ } from "./services/imageLoader";
import { Shape, ShapeI } from "./components/shape";
import { EnterUsername } from "./components/enterUsername";
import { Highscores } from "./components/highscores";
import { Overlay } from "./components/overlay";
import { Background } from "./components/background";
import { IGameState } from "./interfaces/IGameState";
import { INITIAL_GAME_STATE, MIN_INTERVAL_MS } from "./config";
import { decreasingIntervalObservable, formula } from "./services/gameTicker";
import { shapeSpawner } from "./services/shapeSpawner";
import { getKeysDown } from "./services/keybordInputService";
export class Game {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly gameState: IGameState;

    private background: Background;

    private shapes: Shape[];
    private enterUsername: EnterUsername;
    private highscores: Highscores;
    private overlay: Overlay

    private gameTick$: Observable<number>;
    private keyboardInput$: Observable<{ key: string, code: string }>;
    private shapeSpawner$: Observable<number>;
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

        this.gameTick$ = decreasingIntervalObservable(MIN_INTERVAL_MS, formula);
        this.shapeSpawner$ = shapeSpawner();

    }

    init() {
        fromEvent(window, 'resize')
            .pipe(debounceTime(100))
            .subscribe(() => {
                this.resize(window.innerWidth, window.innerHeight);
            })

        loadBackgroundImage$().subscribe((img) => {
            this.background = new Background(this.ctx, this.gameState, img);
        })

        this.keyboardInput$ = getKeysDown();
    }

    startRound() {
        this.shapeSpawner$.pipe(
            switchMap(num => loadShapeSprites$().pipe(
                toArray(),
                map(shapeImagesArray => [shapeImagesArray, num])
            )),
            map(combination=>{
                console.log(combination)
            })
        )
    }
    resize(newWidth: number, newHeight: number) {
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.ctx.imageSmoothingEnabled = false;

        //todo: element resize
    }
}