import { GamePhase } from "../enums/GamePhase";
import { IPlayerInfo } from "./IPlayerInfo";

export interface IGameState{
    currentState:GamePhase;
    score:number,
    player:IPlayerInfo;
}