import { toArray } from "rxjs";
import { GamePhase } from "../enums/GamePhase";
import { IKeysDown } from "../interfaces/IKeysDown";
import { IPlayerInfo } from "../interfaces/IPlayerInfo";
import { IUsersScores } from "../interfaces/IUsersScores";
import { fetchHighScore$ } from "../services/apiServices";
import { Component } from "./component";
import { drawText } from "../services/renderServices";
import { MEDIUM_TEXT_FONT } from "../config";

export class Highscores extends Component {
    private _shown: boolean;
    private _highscores: IUsersScores[];

    onCreate(): void {
        this._shown = false;
    }

    onResize(newWidth: number, newHeight: number): void {
    }

    update(delta: number, keysDown: IKeysDown): void {
        if (this.gameState.currentState === GamePhase.READY) {
            // console.log('sup from highcores update');
            if (keysDown['KeyH']) {
                console.log("key registered from highscores update line 26");
                this._shown = !this._shown;
                if (this._shown) {
                    fetchHighScore$()
                        .pipe(
                        //toArray()
                    )
                        .subscribe((scores) => {
                            this._highscores = scores;
                        });
                }
            }
        }else{
            this._shown=false;
        }
    }
    render(): void {
        if (this._shown && this._highscores) {
            drawText(
                this.ctx,
                'Highscores:',
                MEDIUM_TEXT_FONT,
                this.ctx.canvas.width * 0.6,
                100
            );

            this._highscores.forEach((player, index) => {
                drawText(
                    this.ctx,
                    `${index + 1}. ${player.username.padEnd(5)}- ${player.highscore
                        .toString().padStart(2)}`,
                    MEDIUM_TEXT_FONT,
                    this.ctx.canvas.width * 0.6,
                    50 ** index + 150,
                );
            });
        }
    }

}