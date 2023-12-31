import { GamePhase } from "./enums";

export const API_URL = 'http://localhost:3000'

export const BACKGROUND_ASPECT_RATIO_ALT = 6 / 11
export const BACKGROUND_ASPECT_RATIO = 12 / 19

export const BOARD_BLOCKS_WIDTH = 10;
export const BOARD_BLOCKS_HEIGHt_ALT = 20;
export const BOARD_BLOCKS_HEIGHt = 18;

export const BACKGROUND_BLOCKS_HEIGHT = 19;
export const BACKGROUND_BLOCKS_WIDTH = 12;

export const BOARD_BORDER_SHIFT_X = 1 / 12;
export const BOARD_BORDER_SHIFT_Y_ALT = 1 / 22;
export const BOARD_BORDER_SHIFT_Y = 0;

export const BOARD_BLOCK_SHIFT_X = 1 / 12;
export const BOARD_BLOCK_SHIFT_Y = 1 / 19;

export const SMALL_TEXT_FONT = '1rem "Press Start 2P"';
export const MEDIUM_TEXT_FONT = '2rem "Press Start 2P"';
export const LARGE_TEXT_FONT = '3rem "Press Start 2P"';
export const FONT_COLOR = 'red';
export const FONT_SHADOW_COLOR = 'blue';
export const FONT_SHADOW_SIZE = 3;

export const STARTING_DELTA_TIME = 0.8;


export const MIN_INTERVAL_MS = 50;
export const INITIAL_TIME_MS = 5000;

export const NUM_SHAPES = 7;
export const INITAIAL_SHAPES = new Map([
    ["I", [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ["T", [[0, 1, 0], [1, 1, 1], [0, 0, 0]]],
    ["O", [[1, 1], [1, 1]]],
    ["S", [[0, 1, 1], [1, 1, 0], [0, 0, 0]]],
    ["Z", [[1, 1, 0], [0, 1, 1], [0, 0, 0]]],
    ["L", [[0, 0, 1], [1, 1, 1], [0, 0, 0]]],
    ["J", [[1, 0, 0], [1, 1, 1], [0, 0, 0]]],
    // ["F", [[1, 1, 0, 1, 1, 0, 0], [1, 0, 0, 1, 0, 1, 0], [1, 1, 0, 1, 0, 0, 1], [1, 0, 0, 1, 0, 1, 0], [1, 0, 0, 1, 1, 0, 0]]]
    // ["F", [[1, 1, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0]]]
]);





export const INITIAL_GAME_STATE = {
    currentState: GamePhase.ENTER_NAME,
    score: 0,
    player: {
        id: 0,
        username: '',
        score: 0,
        linesCleared: 0,
        elementsDroped: 0,
        timePlaying: 0,
        highscore: 0
    }
}

export const MAXIMUM_DELTA_TIME = 1 / 30;
export const GAME_SPEED = 1;

export const SHAPE_DROP_SCORE = 40;
export const LINE_CLEAR_COEF = 100;
export const LINE_CLEAR_OFFSET = 50;

export const STARTING_POS_X = 3;
export const STARTING_POS_Y = 0;


export const FALLING_NUM_OF_FRAMES = 20

export const HIGHSCORE_POS_X = 0
export const HIGHSCORE_POS_Y = 100
export const HIGHSCORE_POS_X_RELATIVE = 0.35
export const HIGHSCORE_POS_Y_RELATIVE = 0.5
export const SCORE_ROW_SPACE_Y = 50

export const ENTER_USERNAME_POS_X_RELATIVE = 0.5
export const ENTER_USERNAME_POS_Y_RELATIVE = 0.5
export const ENTER_USERNAME_POS_Y_DELTA = 60
