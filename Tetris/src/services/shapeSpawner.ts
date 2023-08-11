import { Observable, defer, filter, interval, map, of, tap, toArray } from "rxjs";
import { IGameState } from "../interfaces/IGameState";
import { Shape, ShapeI, ShapeJ, ShapeL, ShapeO, ShapeS, ShapeT, ShapeZ } from "../components/shape";
import { loadBackgroundImage$, loadShapeSprites$ } from "./imageLoader";
import { Shapes } from "../enums/Shapes";
import { Board } from "../components/board";
import { IRectangle } from "../interfaces/IRectangle";
import { MIN_INTERVAL_MS } from "../config";
import { IBoolWrapper } from "../interfaces/IBoolWrapper";

// export const shapeSpawner=():Observable<number>=>{
//     return defer(()=>of(Math.floor(Math.random()*7)))

// }

function getRandomShapeNumber(): number {
    return Math.floor(Math.random() * 7);
}
function returnShapeFromNumber(
    num: number,
    ctx: CanvasRenderingContext2D,
    gameState: IGameState,
    board: Board,
    bgRect: IRectangle
): Shape {

    let sprites: { type: string, img: HTMLImageElement }[] = [];

    loadShapeSprites$().
        pipe(

    )
        .subscribe(
            (x) => {
                console.log(x);
                sprites.push(x);
            }
        );

    let images: Map<string, HTMLImageElement> = new Map();
    sprites.map(sprite => {
        images.set(sprite.type, sprite.img);
    });

    if (num === 0) {
        return new ShapeI(ctx, gameState, images.get('I'), Shapes.I, 0, true, board, bgRect, 4, 0);
    } else if (num === 1) {
        return new ShapeT(ctx, gameState, images.get("T"), Shapes.T, 0, true, board, bgRect, 4, 0);
    } else if (num === 2) {
        return new ShapeO(ctx, gameState, images.get("O"), Shapes.O, 0, true, board, bgRect, 4, 0);
    } else if (num === 3) {
        return new ShapeS(ctx, gameState, images.get("S"), Shapes.S, 0, true, board, bgRect, 4, 0)
    } else if (num === 4) {
        return new ShapeZ(ctx, gameState, images.get("Z"), Shapes.Z, 0, true, board, bgRect, 4, 0);
    } else if (num === 5) {
        return new ShapeL(ctx, gameState, images.get("L"), Shapes.L, 0, true, board, bgRect, 4, 0);
    } else if (num === 6) {
        return new ShapeJ(ctx, gameState, images.get("J"), Shapes.J, 0, true, board, bgRect, 4, 0);
    } else {
        return null;
    }
}

export function startSpawningShapes(
    ctx: CanvasRenderingContext2D,
    gameState: IGameState,
    canSpawn: IBoolWrapper,
    board: Board,
    bgRect: IRectangle
): Observable<Shape> {
    return interval(MIN_INTERVAL_MS).pipe(
        filter(() => canSpawn.val),
        tap(() => canSpawn.val = false),
        map(()=>returnShapeFromNumber(getRandomShapeNumber(),ctx,gameState,board,bgRect))
    )
}