import { Observable, concatMap, interval, map, of, repeat, skipWhile, takeUntil, timer } from "rxjs"
import { INITIAL_TIME_MS } from "../config";
import { GamePhase } from "../enums";
import { Game } from "../game";
import { TickerReset } from "./tickerReset";

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
        repeat({ delay: () => TickerReset._start })
    );
}

export const formula = (initialTime: number, iteration: number): number => {
    return initialTime / (1 + (iteration - iteration % 5) / 5)
}
