import { SlideTuning } from '..';

describe('SlideTuning', () => {

  it('element classlist should contains "slide-tuning"', () => {
    const element = document.createElement('span');
    const slideTuning = new SlideTuning({ value: 0, element });
    expect(element.classList.contains('slide-tuning')).toBe(true);
  });

});
