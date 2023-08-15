import { Observable, Subject, concatMap, defer, filter, interval, map, of, repeat, skipWhile, switchMap, takeUntil, takeWhile, timer } from "rxjs"
import { INITIAL_TIME_MS } from "../config";
import { IGameState } from "../interfaces/IGameState";
import { GamePhase } from "../enums/GamePhase";
import { Game } from "../game";
import { TickerReset } from "../components/TikerReset";

// const reserTrigger = new Subject<void>();
export function decreasingIntervalObservable(
    minInterval: number,
    formula: (initialTime: number,
        iteration: number) => number)
    : Observable<number> {
    return interval(minInterval).pipe(
        skipWhile(() => Game.gameState.currentState !== GamePhase.PLAYING),
        repeat({ delay: () => of(Game.gameState.currentState === GamePhase.PLAYING) }),
        map((iteration: number) =>
            formula(INITIAL_TIME_MS, iteration)
        ),
        concatMap((interval) => timer(interval)),
        takeUntil(TickerReset._stop),
        repeat({delay:()=>TickerReset._start})
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

// function resetDecreasingObservable(minInterval: number, formula: (initialTime: number, iteration: number) => number): Observable<number> {
//     return reserTrigger.pipe(
//         switchMap(() => decreasingIntervalObservable(minInterval, formula))
//     )
// }

// const resetDecreasingObservableSubscription

export const formula = (initialTime: number, iteration: number): number => {
    // console.log(initialTime / (1 + (iteration - iteration % 5) / 5))
    return initialTime / (1 + (iteration - iteration % 5) / 5)
}
