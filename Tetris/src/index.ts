import {fromEvent} from "rxjs";
import { Game } from "./game";

fromEvent(window, "load").subscribe(() => {
    const canvas = document.createElement("canvas");
    canvas.id = "game-container"
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas)

    const game = new Game(canvas);
    game.init();


});

