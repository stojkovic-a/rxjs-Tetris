import { fromEvent, map, take } from "rxjs";
import { Game } from "./game";
import { fetchSprite$ } from "./services/apiServices"

fromEvent(window,"load").subscribe(()=>{
    const canvas=document.createElement("canvas");
    canvas.id="game-container"
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    document.body.appendChild(canvas)

    const game=new Game(canvas);
    game.init();

    
});

fetchSprite$().pipe(
).subscribe(x=>console.log(x))