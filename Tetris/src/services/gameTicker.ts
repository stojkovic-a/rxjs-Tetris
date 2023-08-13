import { Observable, concatMap, defer, filter, interval, map, takeWhile, timer } from "rxjs"
import { INITIAL_TIME_MS } from "../config";
import { IGameState } from "../interfaces/IGameState";
import { GamePhase } from "../enums/GamePhase";
import { Game } from "../game";



export function decreasingIntervalObservable(
    minInterval: number,
    formula: (initialTime: number,
        iteration: number) => number)
    : Observable<number> {
    return interval(minInterval).pipe(
        map((iteration: number) =>
            formula(INITIAL_TIME_MS, iteration)
        ),
        concatMap((interval) => timer(interval))
    );
}
// export function decreasingIntervalObservable(
//     minInterval: number,
//     formula: (initialTime: number, iteration: number) => number
//   ): Observable<number> {
//     return defer(() => {
//       return interval(minInterval).pipe(
//         map((iteration: number) => formula(INITIAL_TIME_MS, iteration)),
//         concatMap((interval) => timer(interval))
//       );
//     });
//   }



export const formula = (initialTime: number, iteration: number): number => {
    console.log(initialTime / (1 + (iteration - iteration % 5) / 5))
    return initialTime / (1 + (iteration - iteration % 5) / 5)
}
