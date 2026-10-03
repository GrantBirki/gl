import { describe, expect, it, vi } from 'vitest';
import { getWindowSize, subscribeToWindowSize } from '../../src/utils/window-size.mjs';

function browser() {
  const listeners = new Map();
  const frames = new Map();
  let nextFrame = 0;
  return {
    innerWidth: 800,
    innerHeight: 600,
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: (name, listener) => {
      if (listeners.get(name) === listener) listeners.delete(name);
    },
    requestAnimationFrame: (callback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    resize: () => listeners.get('resize')?.(),
    flush: () => {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback());
    },
    listeners,
    frames,
  };
}

describe('confetti window dimensions', () => {
  it('keeps the previous server-rendering fallback without needing a window', () => {
    expect(getWindowSize()).toEqual({ width: Infinity, height: Infinity });
    const onChange = vi.fn();
    expect(() => subscribeToWindowSize(onChange)()).not.toThrow();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reads the viewport rather than the document dimensions', () => {
    expect(getWindowSize(browser())).toEqual({ width: 800, height: 600 });
  });

  it('coalesces a resize burst into the latest dimensions on one frame', () => {
    const target = browser();
    const onChange = vi.fn();
    const stop = subscribeToWindowSize(onChange, target);
    target.innerWidth = 900;
    target.resize();
    target.innerWidth = 1200;
    target.innerHeight = 700;
    target.resize();
    expect(onChange).not.toHaveBeenCalled();
    expect(target.frames.size).toBe(1);
    target.flush();
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ width: 1200, height: 700 });
    stop();
  });

  it('removes the listener and cancels a pending update on unmount', () => {
    const target = browser();
    const onChange = vi.fn();
    const stop = subscribeToWindowSize(onChange, target);
    target.resize();
    stop();
    expect(target.listeners.size).toBe(0);
    expect(target.frames.size).toBe(0);
    target.resize();
    target.flush();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('can subscribe again after cleanup without retaining the old callback', () => {
    const target = browser();
    const oldChange = vi.fn();
    subscribeToWindowSize(oldChange, target)();
    const onChange = vi.fn();
    const stop = subscribeToWindowSize(onChange, target);
    target.resize();
    target.flush();
    expect(oldChange).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ width: 800, height: 600 });
    stop();
  });
});
