import { Subject } from "rxjs";

export class TickerReset {

    public static readonly _stop = new Subject<void>();
    public static readonly _start = new Subject<void>();


    static start(): void {
        TickerReset._start.next();
    }
    static stop(): void {
        TickerReset._stop.next();
    }
}