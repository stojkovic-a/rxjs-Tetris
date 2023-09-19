import { GamePhase } from "../enums";
import { IKeysDown, IUsersScores } from "../interfaces";
import { fetchHighScore$, drawText } from "../services";
import { Component } from "./component";
import { HIGHSCORE_POS_X, HIGHSCORE_POS_X_RELATIVE, HIGHSCORE_POS_Y, HIGHSCORE_POS_Y_RELATIVE, MEDIUM_TEXT_FONT, SCORE_ROW_SPACE_Y } from "../config";
import { Game } from "../game";

export class Highscores extends Component {
    private _shown: boolean;
    private _highscores: IUsersScores[];

    onCreate(): void {
        this._shown = false;
    }

    onResize(newWidth: number, newHeight: number): void {
    }

    update(delta: number, keysDown: IKeysDown): void {
        if (Game.gameState.currentState === GamePhase.READY || Game.gameState.currentState === GamePhase.GAME_OVER) {
            if (keysDown['KeyH']) {
                this._shown = !this._shown;
                if (this._shown) {
                    let subscription = fetchHighScore$()
                        .pipe(
                    )
                        .subscribe((scores) => {
                            this._highscores = scores;
                            console.log(scores);
                            console.log(this._highscores);
                            subscription.unsubscribe();
                        });
                }
            }
        } else {
            this._shown = false;
        }
    }
    render(): void {
        if (this._shown && this._highscores) {
            drawText(
                this.ctx,
                'Highscores:',
                MEDIUM_TEXT_FONT,
                this.ctx.canvas.width * HIGHSCORE_POS_X_RELATIVE,
                this.ctx.canvas.height * HIGHSCORE_POS_Y_RELATIVE,

            );

            this._highscores.forEach((player, index) => {
                drawText(
                    this.ctx,
                    `${index + 1}. ${player.username.padEnd(5)}- ${player.highscore
                        .toString().padStart(2)}`,
                    MEDIUM_TEXT_FONT,
                    this.ctx.canvas.width * HIGHSCORE_POS_X_RELATIVE,
                    this.ctx.canvas.height * HIGHSCORE_POS_Y_RELATIVE + SCORE_ROW_SPACE_Y * (index + 1),
                );
            });
        }
    }

}