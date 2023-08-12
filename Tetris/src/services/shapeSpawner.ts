import { Observable, defer, filter, interval, map, of, switchMap, tap, toArray } from "rxjs";
import { IGameState } from "../interfaces/IGameState";
import { Shape, ShapeI, ShapeJ, ShapeL, ShapeO, ShapeS, ShapeT, ShapeZ } from "../components/shape";
import { loadBackgroundImage$, loadShapeSprites$ } from "./imageLoader";
import { Shapes } from "../enums/Shapes";
import { Board } from "../components/board";
import { IRectangle } from "../interfaces/IRectangle";
import { MIN_INTERVAL_MS } from "../config";
import { IBoolWrapper } from "../interfaces/IBoolWrapper";
import { Game } from "../game";

// export const shapeSpawner=():Observable<number>=>{
//     return defer(()=>of(Math.floor(Math.random()*7)))

// }

function getRandomShapeNumber(): number {
    return Math.floor(Math.random() * 7);
}
// function returnShapeFromNumber(
//     num: number,
//     ctx: CanvasRenderingContext2D,
//     gameState: IGameState,
//     board: Board,
//     bgRect: IRectangle
// ): Shape {
//     console.log(num);
//     let sprites: { type: string, img: HTMLImageElement }[] = [];
//     let images: Map<string, HTMLImageElement> = new Map();
//     let shapeToReturn: Shape = null;
//     loadShapeSprites$().
//         pipe(

//     )
//         .subscribe(
//             (x) => {
//                 sprites.push(x);
//                 images.set(x.type, x.img);
//                 console.log("current iamges state", images);

//                 if (num === 0 && x.type === "I") {

//                     shapeToReturn = new ShapeI(ctx, gameState, images.get('I'), Shapes.I, 0, true, board, bgRect, 4, 0);
//                     console.log(shapeToReturn)
//                 } else if (num === 1 && x.type === "T") {
//                     shapeToReturn = new ShapeT(ctx, gameState, images.get("T"), Shapes.T, 0, true, board, bgRect, 4, 0);
//                     console.log(shapeToReturn)
//                 } else if (num === 2 && x.type === "O") {
//                     shapeToReturn = new ShapeO(ctx, gameState, images.get("O"), Shapes.O, 0, true, board, bgRect, 4, 0);
//                     console.log(shapeToReturn)
//                 } else if (num === 3 && x.type === "S") {
//                     shapeToReturn = new ShapeS(ctx, gameState, images.get("S"), Shapes.S, 0, true, board, bgRect, 4, 0);
//                     console.log(shapeToReturn)
//                 } else if (num === 4 && x.type === "Z") {
//                     shapeToReturn = new ShapeZ(ctx, gameState, images.get("Z"), Shapes.Z, 0, true, board, bgRect, 4, 0);
//                     console.log(shapeToReturn)
//                 } else if (num === 5 && x.type === "L") {
//                     shapeToReturn = new ShapeL(ctx, gameState, images.get("L"), Shapes.L, 0, true, board, bgRect, 4, 0);
//                     console.log(shapeToReturn)
//                 } else if (num === 6 && x.type === "J") {
//                     shapeToReturn = new ShapeJ(ctx, gameState, images.get("J"), Shapes.J, 0, true, board, bgRect, 4, 0);
//                     console.log(shapeToReturn)
//                 } else {
//                     shapeToReturn = null;
//                     console.log(shapeToReturn)
//                 }
//             }
//         );

//     // console.log(sprites);
//     // console.log(sprites);

//     // sprites.map(sprite => {
//     //     images.set(sprite.type, sprite.img);
//     //     console.log("seted meted")
//     // });
//     // if (num === 0) {

//     //     return new ShapeI(ctx, gameState, images.get('I'), Shapes.I, 0, true, board, bgRect, 4, 0);
//     // } else if (num === 1) {
//     //     return new ShapeT(ctx, gameState, images.get("T"), Shapes.T, 0, true, board, bgRect, 4, 0);
//     // } else if (num === 2) {
//     //     return new ShapeO(ctx, gameState, images.get("O"), Shapes.O, 0, true, board, bgRect, 4, 0);
//     // } else if (num === 3) {
//     //     return new ShapeS(ctx, gameState, images.get("S"), Shapes.S, 0, true, board, bgRect, 4, 0)
//     // } else if (num === 4) {
//     //     return new ShapeZ(ctx, gameState, images.get("Z"), Shapes.Z, 0, true, board, bgRect, 4, 0);
//     // } else if (num === 5) {
//     //     return new ShapeL(ctx, gameState, images.get("L"), Shapes.L, 0, true, board, bgRect, 4, 0);
//     // } else if (num === 6) {
//     //     return new ShapeJ(ctx, gameState, images.get("J"), Shapes.J, 0, true, board, bgRect, 4, 0);
//     // } else {
//     //     return null;
//     // }

//     return shapeToReturn;
// }

// export function startSpawningShapes(
//     ctx: CanvasRenderingContext2D,
//     gameState: IGameState,
//     board: Board,
//     bgRect: IRectangle
// ): Observable<Shape> {
//     return interval(MIN_INTERVAL_MS).pipe(
//         filter(() => Game.canSpawn.val),
//         tap(() => Game.canSpawn.val = false),
//         map(() => returnShapeFromNumber(getRandomShapeNumber(), ctx, gameState, board, bgRect))
//     )
// }





function returnShapeFromNumber(
    num: number,
    ctx: CanvasRenderingContext2D,
    gameState: IGameState,
    board: Board,
    bgRect: IRectangle
): Observable<Shape> {
    return loadShapeSprites$().pipe(
        switchMap(sprites => {
            let images: Map<string, HTMLImageElement> = new Map();

            images.set(sprites.type, sprites.img); // Set the image based on sprites.type
            console.log("current images state", images);

            let shapeToReturn: Shape;

            if (num === 0 && sprites.type === "I") {
                shapeToReturn = new ShapeI(ctx, gameState, images.get('I'), Shapes.I, 0, true, board, bgRect, 4, 0);
            } else if (num === 1 && sprites.type === "T") {
                shapeToReturn = new ShapeT(ctx, gameState, images.get("T"), Shapes.T, 0, true, board, bgRect, 4, 0);
            } else if (num === 2 && sprites.type === "O") {
                shapeToReturn = new ShapeO(ctx, gameState, images.get("O"), Shapes.O, 0, true, board, bgRect, 4, 0);
                console.log(shapeToReturn)
            } else if (num === 3 && sprites.type === "S") {
                shapeToReturn = new ShapeS(ctx, gameState, images.get("S"), Shapes.S, 0, true, board, bgRect, 4, 0);
                console.log(shapeToReturn)
            } else if (num === 4 && sprites.type === "Z") {
                shapeToReturn = new ShapeZ(ctx, gameState, images.get("Z"), Shapes.Z, 0, true, board, bgRect, 4, 0);
                console.log(shapeToReturn)
            } else if (num === 5 && sprites.type === "L") {
                shapeToReturn = new ShapeL(ctx, gameState, images.get("L"), Shapes.L, 0, true, board, bgRect, 4, 0);
                console.log(shapeToReturn)
            } else if (num === 6 && sprites.type === "J") {
                shapeToReturn = new ShapeJ(ctx, gameState, images.get("J"), Shapes.J, 0, true, board, bgRect, 4, 0);
                console.log(shapeToReturn)
            } else {
                shapeToReturn = null;
                console.log(shapeToReturn)
            }


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
        switchMap(() => returnShapeFromNumber(getRandomShapeNumber(), ctx, gameState, board, bgRect))
    );
}