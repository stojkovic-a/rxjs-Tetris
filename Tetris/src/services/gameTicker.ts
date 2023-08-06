import { Observable, interval, map } from "rxjs"


function decreasingTimeObservable(
    startInterval:number,
    formula:(iteration:number)=>number
    ):Observable<number>{
        let iteration=0;
        return interval(startInterval).pipe(
            map(()=>{
                iteration++;
                return formula(iteration);
            })
        );
    }