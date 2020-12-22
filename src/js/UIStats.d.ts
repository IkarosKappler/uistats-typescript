/**
 * This is a tiny UI module for displaying simple stats data.
 *
 * Not working with IEx. Use a 'Proxy' polyfill maybe?
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 *
 * @author Ikaros Kappler
 * @date   2020-12-20
 */
/**
 * Observable keys are simple types: strings, numbers or booleans.
 * Arrays or objects cannot be observed by this tool.
 */
declare type ObservableType = string | number | boolean;
/**
 * The evaluator modifies the current values to final display values.
 */
declare type Evaluator = (value: ObservableType) => ObservableType;
/**
 * The main class.
 *
 * Once instantiated it will append a new HTMLDivElement node to the DOM.
 */
declare class UIStats {
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
            __installAsNewParent(evaluateFn: Evaluator): any;
            precision: (precision: number) => any;
            suffix: (suffixText: string) => any;
            prefix: (prefixText: string) => any;
        };
    };
    constructor(observee: object);
    __applyKeyValue(keyName: string, kProps: any, value: any): void;
    __updateChildElem(keyName: any, newElem: any): void;
    add(keyName: string): {
        uiStats: UIStats;
        keyName: string;
        evaluateFn: Evaluator;
        __installAsNewParent(evaluateFn: Evaluator): any;
        precision: (precision: number) => any;
        suffix: (suffixText: string) => any;
        prefix: (prefixText: string) => any;
    };
    __toggleVisibility(): void;
    __applyTextLayout(textNode: HTMLDivElement): void;
    __applyBaseLayout(): void;
}
export default UIStats;
