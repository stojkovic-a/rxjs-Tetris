import { Observable, defer, filter, interval, map, of, switchMap, take, tap, toArray } from "rxjs";
import { IGameState } from "../interfaces/IGameState";
import { Shape,/* ShapeI, ShapeJ, ShapeL, ShapeO, ShapeS, ShapeT, ShapeZ*/ } from "../components/shape";
import { loadBackgroundImage$, loadShapeSprites$ } from "./imageLoader";
import { Shapes } from "../enums/Shapes";
import { Board } from "../components/board";
import { IRectangle } from "../interfaces/IRectangle";
import { INITAIAL_SHAPES, MIN_INTERVAL_MS, NUM_SHAPES } from "../config";
import { IBoolWrapper } from "../interfaces/IBoolWrapper";
import { Game } from "../game";
import { GlobalImageMap } from "../components/globalImageMap";

// export const shapeSpawner=():Observable<number>=>{
//     return defer(()=>of(Math.floor(Math.random()*7)))

// }

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
    return loadShapeSprites$().pipe(
        switchMap(sprites => {
            console.log(sprites,"AAAAAAAAAAAAAA");
            let images: Map<string, HTMLImageElement> = new Map();

            images.set(sprites.type, sprites.img);
            GlobalImageMap.imageMap.set(sprites.type, sprites.img);

            let shapeToReturn: Shape;
            
            let enumKey = Shapes[num];
            if (sprites.type === enumKey.toString() + "block")
                shapeToReturn = new Shape(ctx, gameState, images.get(enumKey.toString() + "block"), Shapes[enumKey as keyof typeof Shapes], 0, INITAIAL_SHAPES.get(enumKey), true, board, bgRect, 3, 0);

            return of(shapeToReturn);
        })
    );
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