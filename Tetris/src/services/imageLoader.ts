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


export const loadShapeSprites$ = (): Observable<{type:string,img:HTMLImageElement}> => {
    return from(fetchSprite$()).pipe(
        mergeMap((sprites) => {
            const shapePaths=sprites.shapes.map(shape=> {return{type:shape.type, image:sprites.path+shape.image}});
            let shapeImages:HTMLImageElement[]=[];
            shapePaths.forEach((path,index)=>{
                const img1=new Image();
                img1.src=path.image
                shapeImages.push(img1);
            })
            return fromEvent(shapeImages,'load').pipe(
                map((e,index)=>{
                    return {type:sprites.shapes[index].type.toString(),img: e.target as HTMLImageElement}
                })
            )
        })
    )
}