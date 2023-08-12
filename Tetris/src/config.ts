import { GamePhase } from "./enums/GamePhase";

export const API_URL='http://localhost:3000'
export const BACKGROUND_ASPECT_RATIO_ALT = 6/11
export const BACKGROUND_ASPECT_RATIO = 12/19

export const BOARD_BLOCKS_WIDTH=10;
export const BOARD_BLOCKS_HEIGHt_ALT=20;
export const BOARD_BLOCKS_HEIGHt=18;

export const BOARD_BORDER_SHIFT_X=1/12;
export const BOARD_BORDER_SHIFT_Y_ALT=1/22;
export const BOARD_BORDER_SHIFT_Y=1/19;



export const SMALL_TEXT_FONT = '1rem "Press Start 2P"';
export const MEDIUM_TEXT_FONT = '2rem "Press Start 2P"';
export const LARGE_TEXT_FONT = '3rem "Press Start 2P"';
export const FONT_COLOR = 'white';
export const FONT_SHADOW_COLOR = 'gray';
export const FONT_SHADOW_SIZE = 3;

export const STARTING_DELTA_TIME=0.8;


export const MIN_INTERVAL_MS=50;
export const INITIAL_TIME_MS=800;
export const NUM_SHAPES=7;


export const INITIAL_GAME_STATE={
    currentState:GamePhase.ENTER_NAME,
    score:0,
    player:{
        id:0,
        username:'',
        score:0,
        linesCleared:0,
        elementsDroped:0,
        timePlaying:0,
        highscore:0
    }
}

export const MAXIMUM_DELTA_TIME = 1 / 30;
export const GAME_SPEED=1;