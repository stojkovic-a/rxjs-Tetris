import { Observable, from, fromEvent, map, mergeMap } from "rxjs";
import { fetchSprite$ } from "./apiServices";
export const loadBackgroundImage$ = (): Observable<HTMLImageElement> => {
    return from(fetchSprite$()).pipe(
        mergeMap((sprites) => {
            const backgroundPath = sprites.path + sprites.board;
            const backgroundImage = new Image();
            backgroundImage.src = backgroundPath;
            return fromEvent(backgroundImage, 'load').pipe(
                map((e) => {
                    return e.target as HTMLImageElement
                })
            )
        })

    )
}