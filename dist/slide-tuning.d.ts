export declare enum SlideTuningDirection {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal"
}
export interface Point {
    x: number;
    y: number;
}
export interface StepOptions {
    default: number;
    withAlt?: number;
    withCtrl?: number;
    withShift?: number;
}
export interface SlideTuningOptions<V = any> {
    value: V;
    step?: StepOptions;
    sensitivity?: number;
    fractionDigits?: number;
    renderer?: (value: V, element: HTMLElement, options: SlideTuningOptions<V>) => void;
    element: HTMLElement;
    direction?: SlideTuningDirection;
}
export declare class SlideTuning extends EventTarget {
    private options;
    private lastPoint;
    private previewValue;
    private get element();
    constructor(options: SlideTuningOptions);
    destroy(): void;
    private init;
    private renderer;
    private onPointerDown;
    private onDocumentPointerMove;
    private onPointerUp;
    private onDocumentContextMenu;
    private onDocumentKeyDown;
    private getPreviewValue;
    private cancel;
    private reset;
}
