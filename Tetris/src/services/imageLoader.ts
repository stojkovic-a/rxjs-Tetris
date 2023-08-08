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
            const shapePaths=sprites.shapes.map(shape=> sprites.path+shape.image);
            let shapeImages:HTMLImageElement[]=[];
            shapePaths.forEach((path,index)=>{
                const img1=new Image();
                img1.src=path
                shapeImages.push(img1);
            })
            return fromEvent(shapeImages,'load').pipe(
                map((e,index)=>{
                    return {type:sprites.shapes[index].image.replace(".png",""),img: e.target as HTMLImageElement}
                })
            )
        })
    )
}