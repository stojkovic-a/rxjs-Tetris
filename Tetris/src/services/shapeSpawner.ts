import { Observable, filter, interval, of, switchMap, tap } from "rxjs";
import { IGameState, IRectangle } from "../interfaces";
import { Shape, Board } from "../components";
import { loadShapeSprites$ } from "./imageLoader";
import { Shapes } from "../enums";
import { INITAIAL_SHAPES, MIN_INTERVAL_MS, NUM_SHAPES, STARTING_POS_X, STARTING_POS_Y } from "../config";
import { Game } from "../game";
import { GlobalImageMap } from "./globalImageMap";


function getRandomShapeNumber(): number {
    return Math.floor(Math.random() * NUM_SHAPES);
}

function returnShapeFromNumber(
    num: number,
    ctx: CanvasRenderingContext2D,
    gameState: IGameState,
    board: Board,
    bgRect: IRectangle
): Observable<Shape> {
    let enumKey = Shapes[num];
    if (GlobalImageMap.imageMap.size === NUM_SHAPES) {
        let shapeToReturn: Shape = new Shape(
            ctx,
            gameState,
            Shapes[enumKey as keyof typeof Shapes],
            0,
            INITAIAL_SHAPES.get(enumKey),
            true,
            board,
            bgRect,
            STARTING_POS_X,
            STARTING_POS_Y
        );
        return of(shapeToReturn);
    } else {
        return loadShapeSprites$().pipe(
            switchMap(sprites => {
                let images: Map<string, HTMLImageElement> = new Map();

                images.set(sprites.type, sprites.img);
                GlobalImageMap.imageMap.set(sprites.type, sprites.img);

                let shapeToReturn: Shape;


                if (sprites.type === enumKey.toString() + "block")
                    shapeToReturn = new Shape(
                        ctx,
                        gameState,
                        Shapes[enumKey as keyof typeof Shapes],
                        0,
                        INITAIAL_SHAPES.get(enumKey),
                        true,
                        board,
                        bgRect,
                        STARTING_POS_X,
                        STARTING_POS_Y
                    );
                return of(shapeToReturn);
            })
        );
    }
}

export function startSpawningShapes(
    ctx: CanvasRenderingContext2D,
    gameState: IGameState,
    board: Board,
    bgRect: IRectangle
): Observable<Shape> {
    return interval(MIN_INTERVAL_MS).pipe(
        filter(() => Game.canSpawn.val),
        tap(() => Game.canSpawn.val = false),
        switchMap(() => returnShapeFromNumber(getRandomShapeNumber(), ctx, gameState, board, bgRect)),
    );
}