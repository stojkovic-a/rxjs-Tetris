import { Observable, catchError, concatMap, fromEvent, map, switchMap, take, tap, timer, toArray } from "rxjs";
import { Game } from "./game";
import { fetchSprite$ } from "./services/apiServices"
import { loadShapeSprites$ } from "./services/imageLoader";

fromEvent(window, "load").subscribe(() => {
    const canvas = document.createElement("canvas");
    canvas.id = "game-container"
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas)

    const game = new Game(canvas);
    game.init();


});


// console.log("aaa")
// shapeSpawner().pipe(
//     switchMap(num => loadShapeSprites$().pipe(
//         toArray(),
//         map(shapeImagesArray => [shapeImagesArray, num])
//     )),
// ).subscribe((a)=>
//     console.log("ccc")
// )

// console.log("bbb")

// console.log('ccccccccccc')
// shapeSpawner().pipe(
//     switchMap(num => loadShapeSprites$().pipe(
//       toArray(), // Collect all emitted values into an array
//       map(shapeImagesArray => {return[shapeImagesArray, num]}),
//       catchError(error => {
//         console.error('Error:', error);
//         return null; // Return an empty observable to handle the error
//       })
//       )),
//     map(([shapeImagesArray, num]) => {
//       if (num === 0) {
//         console.log('aaaaa')
//       }
//       // Handle other cases or return value
//     })
//   ).subscribe(shape => {
//     console.log("wot")
//   });

// console.log('ddddd')


let sprites:any = [];

loadShapeSprites$().
pipe(

)
.subscribe(
    (x)=>{
        console.log(x);
        sprites.push(x);
    }
);

console.log(sprites);