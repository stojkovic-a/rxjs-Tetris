import { GamePhase } from "../enums";
import { IPlayerInfo } from "./IPlayerInfo";

export interface IGameState {
    currentState: GamePhase;
    score: number,
    player: IPlayerInfo;
}