import { Observable, concatMap, fromEvent, map, switchMap, take, tap, timer, toArray } from "rxjs";
import { Game } from "./game";
import { fetchSprite$ } from "./services/apiServices"
import { shapeSpawner } from "./services/shapeSpawner";
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

console.log('ccccccccccc')
shapeSpawner().pipe(
    switchMap(num => loadShapeSprites$().pipe(
      toArray(), // Collect all emitted values into an array
      map(shapeImagesArray => {console.log(shapeImagesArray);return[shapeImagesArray, num]}) // Combine with the num value
    )),
    map(([shapeImagesArray, num]) => {
      if (num === 0) {
        console.log('aaaaa')
      }
      // Handle other cases or return value
    })
  ).subscribe(shape => {
    console.log("wot")
  });

console.log('ddddd')
