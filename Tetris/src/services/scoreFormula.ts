import { LINE_CLEAR_COEF, LINE_CLEAR_OFFSET } from "../config";

export function scoreFormula(numLines:number):number{

    return LINE_CLEAR_COEF*numLines*numLines/2+numLines*LINE_CLEAR_OFFSET;
}