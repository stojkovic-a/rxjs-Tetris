import { catchError, of, tap } from "rxjs";
import { GamePhase } from "../enums";
import { IKeysDown, IPlayerInfo, IUsersScores } from "../interfaces";
import { fetchPlayerProfile$, drawCenteredText } from "../services";
import { Component } from "./component";
import { ENTER_USERNAME_POS_X_RELATIVE, ENTER_USERNAME_POS_Y_DELTA, ENTER_USERNAME_POS_Y_RELATIVE, MEDIUM_TEXT_FONT } from "../config";

export class EnterUsername extends Component {
    private _username: string;

    onCreate(): void {
        this._username = '';
    }

    onResize(newWidth: number, newHeight: number): void {

    }

    update(delta: number, keysDown: IKeysDown): void {
        if (this.gameState.currentState === GamePhase.ENTER_NAME) {
            keysDown.keys.forEach((key) => {
                if (key.length === 1) {
                    this._username += key;
                } else
                    if (key === 'Backspace') {
                        this.removeLastChar();
                    } else
                        if (key === "Enter") {
                            this.submitUsername();
                        }
            })
        }
    }

    render(): void {
        if (this.gameState.currentState === GamePhase.ENTER_NAME) {
            drawCenteredText(
                this.ctx,
                'Enter username',
                MEDIUM_TEXT_FONT,
                this.ctx.canvas.width * ENTER_USERNAME_POS_X_RELATIVE,
                this.ctx.canvas.height * ENTER_USERNAME_POS_Y_RELATIVE - ENTER_USERNAME_POS_Y_DELTA,
            );
            drawCenteredText(
                this.ctx,
                this._username,
                MEDIUM_TEXT_FONT,
                this.ctx.canvas.width * ENTER_USERNAME_POS_X_RELATIVE,
                this.ctx.canvas.height * ENTER_USERNAME_POS_Y_RELATIVE
            );
        }
    }

    removeLastChar() {
        if (this._username.length > 0) {
            this._username = this._username.substring(0, this._username.length - 1);
        }
    }

    submitUsername() {
        if (this._username.length > 0) {
            this.gameState.player.username = this._username;
            this.gameState.currentState = GamePhase.READY;
            let subscription =
                fetchPlayerProfile$(this.gameState.player.username).pipe(
                    tap((playerInfo: IUsersScores[]) => {
                        if (playerInfo.length === 0) {
                            this.gameState.player = {
                                id: 0,
                                score: 0,
                                linesCleared: 0,
                                elementsDroped: 0,
                                timePlaying: 0,
                                highscore: 0,
                                username: this._username
                            }
                        } else {
                            this.gameState.player = { ...playerInfo[0], score: 0 };
                        }
                    }),
                    catchError((error: any) => {
                        console.error("Profile not found");
                        this.gameState.player = {
                            id: 0,
                            score: 0,
                            linesCleared: 0,
                            elementsDroped: 0,
                            timePlaying: 0,
                            highscore: 0,
                            username: this._username
                        }
                        return of(this.gameState.player);
                    })
                )
                    .subscribe((player: IPlayerInfo) => {
                        console.log(player);
                        subscription.unsubscribe();
                    })
        }
    }
}