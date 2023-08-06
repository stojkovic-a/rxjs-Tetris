import { Observable, concatMap, fromEvent, map, take, tap, timer } from "rxjs";
import { Game } from "./game";
import { fetchSprite$ } from "./services/apiServices"

fromEvent(window, "load").subscribe(() => {
    const canvas = document.createElement("canvas");
    canvas.id = "game-container"
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas)

    const game = new Game(canvas);
    game.init();


});

fetchSprite$().pipe(
).subscribe(x => console.log(x))




import { interval } from 'rxjs';

function decreasingIntervalObservable(minInterval: number, formula: (iteration: number) => number): Observable<number> {
    return interval(minInterval).pipe(
        map((iteration:number) => formula(iteration))
    );
}

// Example of a decreasing interval formula: dt = initialInterval / (iteration + 1)
const formula = (iteration: number) => 20000 / (iteration + 1);
const startInterval =50; // Initial interval in milliseconds

const decreasingInterval$ = decreasingIntervalObservable(startInterval, formula);

decreasingInterval$.subscribe(intervalDuration => {
    console.log('Interval Duration:', intervalDuration);
});


const test$ = decreasingInterval$.pipe(
    concatMap(vreme => timer(vreme))
)

test$.subscribe(() => {
    console.log("IDE GAS");
});

