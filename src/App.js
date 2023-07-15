import './App.css';
import {useReducer} from "react";
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";

export const ACTIONS = {
    ADD_DIGIT: "add-digit",
    CHOOSE_OPERATION: "choose-operation",
    CLEAR: "clear",
    DELETE_DIGIT: "delete-digit",
    EVALUATE: "evaluate",
}

function reducer(state, {type, payload}) {
    switch (type) {
        case ACTIONS.ADD_DIGIT:
            // every time we add digit to the end, we check the state of overwrite
            // if we just finish the calculation, we must overwrite numbers
            // instead of just simply add digit to the end of the result of the previous calculation
            if (state.overwrite) {
                return {
                    ...state,
                    currentOperand: payload.digit,
                    overwrite: false,
                }
            }
            // 0 should not at the front
            if (payload.digit === "0" && state.currentOperand === "0") {
                return state
            }
            // will not accept multiple decimal point
            if (payload.digit === "." && state.currentOperand.includes(".")) {
                return state
            }
            // normal update, add digit to the output current operand
            return {
                ...state,
                currentOperand: `${state.currentOperand || ""}${payload.digit}`,
            }
        // choose operations, +-*÷, this will also appear in the output part
        case ACTIONS.CHOOSE_OPERATION:
            // if no digit in the output part
            if (state.currentOperand == null && state.previousOperand == null) {
                return state
            }
            // if current operand is null, take previous
            if (state.currentOperand == null) {
                return {
                    ...state,
                    operation: payload.operation,
                }
            }
            // if previous operand is null, but current operand is not null, just show current in the output
            if (state.previousOperand == null) {
                return {
                    ...state,
                    operation: payload.operation,
                    previousOperand: state.currentOperand,
                    currentOperand: null,
                }
            }
            // default
            return {
                ...state,
                previousOperand: evaluate(state),
                operation: payload.operation,
                currentOperand: null,
            }
        // just remove all
        case ACTIONS.CLEAR:
            return {}
        // delete digit
        case ACTIONS.DELETE_DIGIT:
            if (state.overwrite) {
                return {
                    ...state,
                    overwrite: false,
                    currentOperand: null,
                }
            }
            // nothing to remove, do nothing, return current state
            if (state.currentOperand == null) return state
            // whenever delete the last digit, reset currentOperand to null
            if (state.currentOperand.length === 1) {
                return {...state, currentOperand: null}
            }
            // default
            return {
                ...state,
                currentOperand: state.currentOperand.slice(0, -1),
            }
        // calculate
        case ACTIONS.EVALUATE:
            // if something lost, return current state, do nothing
            if (
                state.operation == null ||
                state.currentOperand == null ||
                state.previousOperand == null
            ) {
                return state
            }
            // overwrite -> true, so we can replace the result with new calculations
            // but do remember to change it back to false when we add digit,
            // we do not want to keep changing digit
            return {
                ...state,
                overwrite: true,
                previousOperand: null,
                operation: null,
                currentOperand: evaluate(state),
            }
    }
}

function evaluate({currentOperand, previousOperand, operation}) {
    const prev = parseFloat(previousOperand)
    const current = parseFloat(currentOperand)
    // no previous or no current, do not need to calculate
    if (isNaN(prev) || isNaN(current)) return ""
    let computation = ""
    switch (operation) {
        case "+":
            computation = prev + current
            break
        case "-":
            computation = prev - current
            break
        case "*":
            computation = prev * current
            break
        case "÷":
            computation = prev / current
            break
    }

    return computation.toString()
}

// format
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
    maximumFractionDigits: 0,
})

function formatOperand(operand) {
    // make sure we have an operand
    if (operand == null) return
    // split by decimal
    const [integer, decimal] = operand.split(".")
    // if nothing after decimal
    if (decimal == null) return INTEGER_FORMATTER.format(integer)
    return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {
    // functions used to calculate
    const [{currentOperand, previousOperand, operation}, dispatch] = useReducer(
        reducer,
        {}
    )
    // dispatch({type: ACTIONS.ADD_DIGIT, payload: {digit : 1} });

    // calculator
    return (
        <div className="App">
            <div className={"calculator-grid"}>
                <div className={"output"}>
                    <div className={"previous-operand"}>
                        {previousOperand} {operation}
                    </div>

                    <div className={"current-operand"}>
                        {formatOperand(currentOperand)}
                    </div>
                </div>

                <button className="span-two"
                        onClick={() => dispatch({type: ACTIONS.CLEAR})}>
                    AC
                </button>
                <button onClick={() => dispatch({type: ACTIONS.DELETE_DIGIT})}>
                    DEL
                </button>
                {/*<button>÷</button>*/}
                {/*<button>1</button>*/}
                {/*<button>2</button>*/}
                {/*<button>3</button>*/}
                {/*<button>*</button>*/}
                {/*<button>4</button>*/}
                {/*<button>5</button>*/}
                {/*<button>6</button>*/}
                {/*<button>+</button>*/}
                {/*<button>7</button>*/}
                {/*<button>8</button>*/}
                {/*<button>9</button>*/}
                {/*<button>-</button>*/}
                {/*<button>.</button>*/}
                {/*<button>0</button>*/}
                {/*<button className={"span-two"}>=</button>*/}


                <OperationButton operation="÷" dispatch={dispatch}/>
                <DigitButton digit="1" dispatch={dispatch}/>
                <DigitButton digit="2" dispatch={dispatch}/>
                <DigitButton digit="3" dispatch={dispatch}/>
                <OperationButton operation="*" dispatch={dispatch}/>
                <DigitButton digit="4" dispatch={dispatch}/>
                <DigitButton digit="5" dispatch={dispatch}/>
                <DigitButton digit="6" dispatch={dispatch}/>
                <OperationButton operation="+" dispatch={dispatch}/>
                <DigitButton digit="7" dispatch={dispatch}/>
                <DigitButton digit="8" dispatch={dispatch}/>
                <DigitButton digit="9" dispatch={dispatch}/>
                <OperationButton operation="-" dispatch={dispatch}/>
                <DigitButton digit="." dispatch={dispatch}/>
                <DigitButton digit="0" dispatch={dispatch}/>

                <button
                    className="span-two"
                    onClick={() => dispatch({type: ACTIONS.EVALUATE})}
                >
                    =
                </button>


            </div>
        </div>
    );
}

export default App;
