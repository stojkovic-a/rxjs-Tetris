import { Observable, defer, filter, interval, map, of, tap, toArray } from "rxjs";
import { IGameState } from "../interfaces/IGameState";
import { Shape, ShapeI } from "../components/shape";
import { loadBackgroundImage$, loadShapeSprites$ } from "./imageLoader";

// export const shapeSpawner=():Observable<number>=>{
//     return defer(()=>of(Math.floor(Math.random()*7)))

// }

function getRandomShapeNumber(): number {
    return Math.floor(Math.random() * 7);
}
function returnShapeFromNumber(
    num: number,
    ctx: CanvasRenderingContext2D,
    gameState: IGameState): Shape {

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

    let images:HTMLImageElement[] = [];
    sprites.map(sprite => {
        images[sprite.type] = sprite.img;
    });

    if (num == 0) {
        // return new ShapeI(ctx,gameState,)
    }
}
function startSpawningShapes=(
    ctx: CanvasRenderingContext2D,
    gameState: IGameState,
    canSpawn: boolean
): Observable<Shape> => {
    return interval(1).pipe(
        filter(() => canSpawn),
        tap(() => canSpawn = false),
        map(())
    )
}