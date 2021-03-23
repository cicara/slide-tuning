
export enum SlideTuningDirection {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
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

export class SlideTuning extends EventTarget {
  private options: SlideTuningOptions;
  private lastPoint: null | Point = null;
  private previewValue: null | number = null;

  private get element() {
    return this.options.element;
  }

  constructor(options: SlideTuningOptions) {
    super();
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onDocumentKeyDown = this.onDocumentKeyDown.bind(this);
    this.onDocumentContextMenu = this.onDocumentContextMenu.bind(this);
    this.onDocumentPointerMove = this.onDocumentPointerMove.bind(this);

    options.step = options.step ?? { default: 1, withAlt: 0.1, withCtrl: 100, withShift: 10 };
    this.options = Object.assign<Partial<SlideTuningOptions>, SlideTuningOptions>(
      {
        direction: SlideTuningDirection.HORIZONTAL,
        sensitivity: 10,
        fractionDigits: 2,
      },
      options,
    );

    this.init();
  }

  public destroy(): void {
    this.element.classList.remove('slide-tuning', `slide-tuning--${ this.options.direction }`);
  }

  private init() {
    this.element.classList.add('slide-tuning', `slide-tuning--${ this.options.direction }`);
    this.element.addEventListener('pointerdown', this.onPointerDown);
    this.renderer(this.options.value);
  }

  private renderer(value: number = this.previewValue!) {
    if(this.options.renderer) {
      this.options.renderer.call(this, value, this.element, this.options);
    } else {
      this.element.innerHTML = `${ value.toFixed(this.options.fractionDigits) }`;
    }
  }

  private onPointerDown(event: PointerEvent) {
    if(event.buttons !== 1) {
      return;
    }
    this.lastPoint = { x: event.clientX, y: event.clientY };
    this.previewValue = this.options.value;
    this.element.classList.add('slide-tuning--active');
    document.body.classList.add('slide-tuning--active');
    document.addEventListener('pointermove', this.onDocumentPointerMove);
    document.addEventListener('contextmenu', this.onDocumentContextMenu, { once: true });
    document.addEventListener('pointerup', this.onPointerUp, { once: true });
    document.addEventListener('keydown', this.onDocumentKeyDown);
  }

  private onDocumentPointerMove(event: PointerEvent) {
    let distance: number;
    const { clientX: x, clientY: y } = event;
    switch(this.options.direction) {
      case SlideTuningDirection.HORIZONTAL: {
        distance = x - this.lastPoint!.x;
        break;
      }
      case SlideTuningDirection.VERTICAL: {
        distance = y - this.lastPoint!.y;
        break;
      }
      default: {
        throw new Error(`unknown direction: ${ this.options.direction }`);
      }
    }
    const previewValue = this.getPreviewValue(distance, event);
    if(this.previewValue !== previewValue) {
      this.previewValue = previewValue;
      this.lastPoint = { x, y };
      this.renderer();
      this.dispatchEvent(
        new CustomEvent(
          'change',
          {
            detail: {
              value: Number.parseFloat(this.previewValue.toFixed(this.options.fractionDigits))
            }
          }
        )
      );
    }
  }

  private onPointerUp(event: PointerEvent) {
    this.options.value = Number(this.previewValue!.toFixed(this.options.fractionDigits));
    this.reset();
    this.dispatchEvent(
      new CustomEvent(
        'changed',
        {
          detail: {
            value: this.options.value,
          }
        }
      )
    );
  }

  private onDocumentContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.cancel();
  }

  private onDocumentKeyDown(event: KeyboardEvent) {
    if(event.code === 'Escape') {
      event.stopImmediatePropagation();
      this.cancel();
    }
  }

  private getPreviewValue(distance: number, event: MouseEvent): number {
    const { sensitivity, step } = this.options;
    const { default: defaultStep, withAlt, withCtrl, withShift } = step!;
    if(event.altKey && withAlt) {
      return this.previewValue! + ((distance / sensitivity!) | 0) * withAlt;
    } else if(event.ctrlKey && withCtrl) {
      return this.previewValue! + ((distance / sensitivity!) | 0) * withCtrl;
    } else if(event.shiftKey && withShift) {
      return this.previewValue! + ((distance / sensitivity!) | 0) * withShift;
    } else {
      return this.previewValue! + ((distance / sensitivity!) | 0) * defaultStep;
    }
  }

  private cancel() {
    this.reset();
    this.renderer(this.options.value);
    this.dispatchEvent(new CustomEvent('cancel', { detail: { value: this.options.value } }));
  }

  private reset() {
    this.element.classList.remove('slide-tuning--active');
    document.body.classList.remove('slide-tuning--active');
    document.removeEventListener('keydown', this.onDocumentKeyDown);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('contextmenu', this.onDocumentContextMenu);
    document.removeEventListener('pointermove', this.onDocumentPointerMove);
    this.lastPoint = null;
    this.previewValue = null;
  }

}
