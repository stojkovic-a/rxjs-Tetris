import { Observable, defer, map, of } from "rxjs";
import { IGameState } from "../interfaces/IGameState";
import { Shape } from "../components/shape";

export const shapeSpawner=():Observable<number>=>{
    return defer(()=>of(Math.floor(Math.random()*7)))
    
}