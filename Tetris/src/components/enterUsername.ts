import { Observable, catchError, from, of, tap } from "rxjs";
import { GamePhase } from "../enums/GamePhase";
import { IKeysDown } from "../interfaces/IKeysDown";
import { fetchPlayerProfile$ } from "../services/apiServices";
import { Component } from "./component";
import { IPlayerInfo } from "../interfaces/IPlayerInfo";
import { IUsersScores } from "../interfaces/IUsersScores";
import { drawCenteredText } from "../services/renderServices";
import { MEDIUM_TEXT_FONT } from "../config";

export class EnterUsername extends Component {
    private _username: string;

    onCreate(): void {

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
        if(this.gameState.currentState===GamePhase.ENTER_NAME){
            drawCenteredText(
                this.ctx,
                'Enter username',
                MEDIUM_TEXT_FONT,
                this.ctx.canvas.width/2,
                this.ctx.canvas.height/2-60,
            );
            drawCenteredText(
                this.ctx,
                this._username,
                MEDIUM_TEXT_FONT,
                this.ctx.canvas.width/2,
                this.ctx.canvas.height
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
            fetchPlayerProfile$(this.gameState.player.username).pipe(
                tap((playerInfo: IUsersScores) => {
                    this.gameState.player={...playerInfo,score:0};
                }),
                catchError((error:any)=>{
                    console.error("Profile not found");
                    this.gameState.player={
                        id:-1,
                        score:0,
                        linesCleared:0,
                        elementsDroped:0,
                        timePlaying:0,
                        highscore:0,
                        username:this._username
                    }
                    return of(this.gameState.player);
                })
            )
            .subscribe((player:IPlayerInfo)=>{
                console.log(player);
            })
        }
    }
}