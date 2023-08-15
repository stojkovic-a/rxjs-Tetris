import {  Observable, debounceTime, fromEvent, map,  throttleTime } from "rxjs"
import { IKeysDown } from "../interfaces/IKeysDown";

 const getKeysDown = ():Observable<{code:string, key:string}> => {
    const keysDown$ = fromEvent(document, 'keydown').pipe(
        throttleTime(15),
        map((event: KeyboardEvent) => {
            return { code: event.code, key: event.key }
        }),
    );
    return keysDown$;
}