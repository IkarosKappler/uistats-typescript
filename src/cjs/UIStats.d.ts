/**
 * This is a tiny UI module for displaying simple stats data.
 *
 * Not working with IEx. Use a 'Proxy' polyfill maybe?
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 *
 * @author   Ikaros Kappler
 * @date     2020-12-20
 * @modified 2026-03-16 Chaning export from `export default UIStats` to `export const UIStats`.
 */
/**
 * Observable keys are simple types: strings, numbers or booleans.
 * Arrays or objects cannot be observed by this tool.
 */
type ObservableType = string | number | boolean;
/**
 * The evaluator modifies the current values to final display values.
 */
type Evaluator = (value: ObservableType) => ObservableType;
/**
 * The main class.
 *
 * Once instantiated it will append a new HTMLDivElement node to the DOM.
 */
export declare class UIStats {
    private keyProps;
    private keyCount;
    private observee;
    private root;
    private toggled;
    private header;
    proxy: typeof Proxy;
    static UIStatsChild: {
        new (uiStats: UIStats, keyName: string, evaluateFn: Evaluator): {
            uiStats: UIStats;
            keyName: string;
            evaluateFn: Evaluator;
            __installAsNewParent(evaluateFn: Evaluator): /*elided*/ any;
            precision: (precision: number) => /*elided*/ any;
            suffix: (suffixText: string) => /*elided*/ any;
            prefix: (prefixText: string) => /*elided*/ any;
        };
    };
    constructor(observee: object);
    private __applyKeyValue;
    private __updateChildElem;
    add(keyName: string): {
        uiStats: UIStats;
        keyName: string;
        evaluateFn: Evaluator;
        __installAsNewParent(evaluateFn: Evaluator): /*elided*/ any;
        precision: (precision: number) => /*elided*/ any;
        suffix: (suffixText: string) => /*elided*/ any;
        prefix: (prefixText: string) => /*elided*/ any;
    };
    __toggleVisibility(): void;
    __applyTextLayout(textNode: HTMLDivElement): void;
    __applyBaseLayout(): void;
}
export {};
