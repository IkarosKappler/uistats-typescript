/**
 * Not working with IEx. Use a 'Proxy' polyfill maybe?
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 * @date 2020-12-20
 */
declare type ObservableType = string | number | boolean;
declare type Evaluator = (value: ObservableType) => ObservableType;
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
            _installAsNewParent(evaluateFn: Evaluator): any;
            precision: (precision: number) => any;
            suffix: (suffixText: string) => any;
            prefix: (prefixText: string) => any;
        };
    };
    constructor(observee: object);
    _applyKeyValue(keyName: string, kProps: any, value: any): void;
    _upateChildElem(keyName: any, newElem: any): void;
    add(keyName: string): {
        uiStats: UIStats;
        keyName: string;
        evaluateFn: Evaluator;
        _installAsNewParent(evaluateFn: Evaluator): any;
        precision: (precision: number) => any;
        suffix: (suffixText: string) => any;
        prefix: (prefixText: string) => any;
    };
    toggleVisibility(): void;
    _applyTextLayout(textNode: HTMLDivElement): void;
    _applyBaseLayout(): void;
}
export default UIStats;
