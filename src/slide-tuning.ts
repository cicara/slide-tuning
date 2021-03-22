
export enum SlideTuningDirection {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

export interface Point {
  x: number;
  y: number;
}

export interface SlideTuningOptions<V = any> {
  value: V;
  renderer?: (value: V, element: HTMLElement, options: SlideTuningOptions<V>) => void;
  increase?: (previewValue: V, relative: number, options: SlideTuningOptions<V>) => V;
  element: HTMLElement;
  direction?: SlideTuningDirection;
}

export class SlideTuning<V = number> {
  private start: null | Point = null;
  private options: SlideTuningOptions<V>;
  private previewValue: null | V = null;

  private get element() {
    return this.options.element;
  }

  constructor(options: SlideTuningOptions) {
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onDocumentContextMenu = this.onDocumentContextMenu.bind(this);
    this.onDocumentPointerMove = this.onDocumentPointerMove.bind(this);
    this.options = Object.assign<Partial<SlideTuningOptions>, SlideTuningOptions>(
      {
        renderer: (value, element, options) => {
          element.innerHTML = `${ value.toFixed(2) }`;
        },
        increase: (previewValue, relative, options) => {
          return options.value + (relative / 10 | 0);
        },
        direction: SlideTuningDirection.HORIZONTAL,
      },
      options,
    );
    this.init();
  }

  public destroy() {
    this.element.classList.remove('slide-tuning', `slide-tuning--${ this.options.direction }`);
  }

  private init() {
    this.element.classList.add('slide-tuning', `slide-tuning--${ this.options.direction }`);
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  private onPointerUp(event: PointerEvent) {
    this.element.classList.remove('slide-tuning--active');
    document.removeEventListener('pointermove', this.onDocumentPointerMove);
    document.removeEventListener('contextmenu', this.onDocumentContextMenu);
    this.options.value = this.previewValue!;
    this.previewValue = null;
  }

  private onPointerDown(event: PointerEvent) {
    this.start = { x: event.clientX, y: event.clientY };
    this.previewValue = this.options.value;
    this.element.classList.add('slide-tuning--active');
    document.addEventListener('pointermove', this.onDocumentPointerMove);
    document.addEventListener('contextmenu', this.onDocumentContextMenu, { once: true });
    document.addEventListener('pointerup', this.onPointerUp, { once: true });
  }

  private onDocumentPointerMove(event: PointerEvent) {
    const { clientX: x, clientY: y } = event;
    switch(this.options.direction) {
      case SlideTuningDirection.HORIZONTAL: {
        this.previewValue = this.options.increase!.call(this, this.previewValue!, x - this.start!.x, this.options);
        this.options.renderer!.call(this, this.previewValue, this.element, this.options);
        break;
      }
      case SlideTuningDirection.VERTICAL: {
        console.log(y);
        break;
      }
      default: {

      }
    }
  }

  private onDocumentContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.element.classList.remove('slide-tuning--active');
    document.removeEventListener('pointermove', this.onDocumentPointerMove);
    document.removeEventListener('contextmenu', this.onDocumentContextMenu);
    document.removeEventListener('pointerup', this.onPointerUp);
    this.cancel();
  }

  private cancel() {
    this.options.renderer!.call(this, this.options.value, this.element, this.options);
    this.previewValue = null;
  }

}
