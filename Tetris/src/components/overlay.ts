import { LARGE_TEXT_FONT, MEDIUM_TEXT_FONT, SMALL_TEXT_FONT } from "../config";
import { GamePhase } from "../enums";
import { Game } from "../game";
import { IKeysDown } from "../interfaces";
import { drawCenteredText, drawText } from "../services";
import { Component } from "./component";

export class Overlay extends Component {
    onCreate(): void {

    }

    onResize(newWidth: number, newHeight: number): void {

    }

    update(delta: number, keysDown: IKeysDown): void {

    }

    render(): void {
        switch (this.gameState.currentState) {
            case GamePhase.READY:
                this.renderDarkenScreen();
                this.renderHighscore();
                this.renderControls();
                this.renderInfo();
                break;
            case GamePhase.PLAYING:
                this.renderCurrentScore();
                break;
            case GamePhase.GAME_OVER:
                this.renderDarkenScreen();
                this.renderGameOver();
                this.renderHighscore();
                this.renderControls();
                this.renderInfo();
                break;
            case GamePhase.ENTER_NAME:
                this.renderDarkenScreen();
                break;
        }
    }

    renderControls() {
        drawText(
            this.ctx,
            '[H]-Highscores',
            SMALL_TEXT_FONT,
            10,
            this.ctx.canvas.height - 30,
        );
        drawText(
            this.ctx,
            '[Space]-Start',
            SMALL_TEXT_FONT,
            10,
            this.ctx.canvas.height - 55,
        );
    }

    renderCurrentScore(): void {
        const scoreText = Game.gameState.score.toString();
        drawText(
            this.ctx,
            scoreText,
            LARGE_TEXT_FONT,
            70,
            70
        );
    }

    renderEnterToStart(): void {
        drawCenteredText(
            this.ctx,
            'Press Enter To Start',
            MEDIUM_TEXT_FONT,
            this.ctx.canvas.width / 2,
            this.ctx.canvas.height / 2
        );
    }

    renderHighscore(): void {
        const text = `Highscore: ${this.gameState.player.highscore}`;
        drawCenteredText(
            this.ctx,
            this.gameState.player.username,
            MEDIUM_TEXT_FONT,
            this.ctx.canvas.width / 2,
            this.ctx.canvas.height / 2 - 100
        );
        drawCenteredText(
            this.ctx,
            text,
            MEDIUM_TEXT_FONT,
            this.ctx.canvas.width / 2,
            this.ctx.canvas.height / 2 - 50
        );
    }

    renderInfo() {
        const infoText = `Lines cleared: ${this.gameState.player.linesCleared}`;
        drawCenteredText(
            this.ctx,
            infoText,
            SMALL_TEXT_FONT,
            this.ctx.canvas.width / 2,
            this.ctx.canvas.height - 10
        )
    }

    renderGameOver() {
        const scoreText = `Score: ${this.gameState.score}`;
        drawCenteredText(
            this.ctx,
            'GAME OVER',
            LARGE_TEXT_FONT,
            this.ctx.canvas.width / 2,
            100,
        );
        drawCenteredText(
            this.ctx,
            scoreText,
            MEDIUM_TEXT_FONT,
            this.ctx.canvas.width / 2,
            150,
        );
    }

    renderDarkenScreen() {
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(
            0,
            0,
            this.ctx.canvas.width,
            this.ctx.canvas.height,
        );
        this.ctx.globalAlpha = 1;
    }

}