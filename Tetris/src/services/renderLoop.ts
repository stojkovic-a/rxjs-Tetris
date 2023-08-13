import { Observable, buffer, expand, filter, fromEvent, map, merge, of, withLatestFrom } from "rxjs"
import { IFrameData } from "../interfaces/IFrameData"
import { MAXIMUM_DELTA_TIME, MIN_INTERVAL_MS } from "../config";
import { IKeysDown } from "../interfaces/IKeysDown";
import { decreasingIntervalObservable, formula } from "./gameTicker";
import { IGameState } from "../interfaces/IGameState";



export const initializeMainLoop = (): Observable<[number, IKeysDown]> => {
  const frame$ = createMainLoop();
  const ticker$ = decreasingIntervalObservable(MIN_INTERVAL_MS, formula).pipe(
    map((num): [number, IKeysDown] => {
      return [0, {
        keys: ["ArrowDown"],
        ['ArrowDown']: true
      }]

    })
  );

  const bufferedKeysDown$ = getBufferedKeysDown(frame$);
  return merge(ticker$,frame$.pipe(
    withLatestFrom(bufferedKeysDown$))
  )
}

const createMainLoop = () => {
  const calucalteDelta = (prevFrame: IFrameData): Observable<IFrameData> => {
    return new Observable<IFrameData>((observer) => {
      window.requestAnimationFrame((currTimeStamp) => {
        const deltaTimeMs = prevFrame ? currTimeStamp - prevFrame.timeStamp : 0;

        const MS_IN_SECOND = 1000;
        const deltaTime = deltaTimeMs / MS_IN_SECOND;

        observer.next({
          timeStamp: currTimeStamp,
          deltaTime,
        });
      });
    });
  }

  const frame$ = of(undefined).pipe(
    expand((val) => calucalteDelta(val)),
    filter((frame) => frame !== undefined),
    map((frame: IFrameData) => {
      return Math.min(frame.deltaTime, MAXIMUM_DELTA_TIME)
    }),
  );
  return frame$;
}


const getBufferedKeysDown = (frames$: Observable<number>) => {
  const keysDown$ = fromEvent(document, 'keydown').pipe(
    map((event: KeyboardEvent) => {
      return { code: event.code, key: event.key };
    }),
  );

  const bufferedKeysDown$ = keysDown$.pipe(
    buffer(frames$),
    map((keysDown) => {
      return keysDown.reduce(
        (acc: IKeysDown, currKey) => {
          acc.keys.push(currKey.key);
          acc[currKey.code] = true;
          return acc;
        },
        { keys: [] },
      );
    }),
  );

  return bufferedKeysDown$;
};
