import { Observable, catchError, concatMap, expand, filter, fromEvent, map, of, switchMap, take, tap, timer, toArray } from "rxjs";
import { Game } from "./game";
import { fetchPlayerProfile$, fetchSprite$ } from "./services/apiServices"
import { loadShapeSprites$ } from "./services/imageLoader";
import { IFrameData } from "./interfaces/IFrameData";
import { MAXIMUM_DELTA_TIME } from "./config";
import { IUsersScores } from "./interfaces/IUsersScores";
import { IPlayerInfo } from "./interfaces/IPlayerInfo";
import { IGameState } from "./interfaces/IGameState";
import { startSpawningShapes } from "./services/shapeSpawner";

fromEvent(window, "load").subscribe(() => {
    const canvas = document.createElement("canvas");
    canvas.id = "game-container"
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas)

    const game = new Game(canvas);
    game.init();


});


// let img:HTMLImageElement=new Image();
// img.src='./src/assets/I.png';
// const canvas=document.createElement("canvas");
// canvas.id="game-container";
// canvas.width=window.innerWidth;
// canvas.height=window.innerHeight;
// document.body.appendChild(canvas);

// let ctx=canvas.getContext('2d');
// ctx.drawImage(img,canvas.width,canvas.height);

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


// let sprites: any = [];

// loadShapeSprites$().
//     pipe(

// )
//     .subscribe(
//         (x) => {
//             console.log(x);
//             sprites.push(x);
//         }
//     );

// console.log(sprites);


// const keysDown$ = fromEvent(document, 'keydown').pipe(
//     map((event: KeyboardEvent) => {
//         return { code: event.code, key: event.key };
//     })).subscribe(
//         x => console.log(x)
//     )

    // let test:IGameState={currentState:0,score:0,player:{id:-1,username:"",linesCleared:-1,score:-1,elementsDroped:-1,timePlaying:-1,highscore:-1}}
    // fetchPlayerProfile$("aca").pipe(
    //     tap((playerInfo: IUsersScores[]) => {
            
    //         console.log("shit",playerInfo.length===0);
    //         test.player={...playerInfo[0],score:0};
    //     }),
    //     catchError((error:any)=>{
    //         console.error("Profile not found");
    //             test.player={
    //             id:-1,
    //             score:0,
    //             linesCleared:0,
    //             elementsDroped:0,
    //             timePlaying:0,
    //             highscore:0,
    //             username:'aca'
    //         }
    //         return of(test.player);
    //     })
    // )
    // .subscribe((player:IPlayerInfo)=>{
    //     console.log(player);
    // })


