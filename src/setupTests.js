import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Polyfill JSDOM agar Toast UI Editor / Viewer dan komponen lain stabil saat diuji.
const noop = () => {}

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: noop,
  removeListener: noop,
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: () => false,
})

HTMLCanvasElement.prototype.getContext = () => ({
  measureText: () => ({ width: 0 }),
  fillRect: noop,
  clearRect: noop,
  getImageData: () => ({ data: [] }),
  putImageData: noop,
  createImageData: () => [],
  setTransform: noop,
  drawImage: noop,
  save: noop,
  restore: noop,
  fillText: noop,
})

Range.prototype.getBoundingClientRect = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 })
Range.prototype.getClientRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] })
document.elementFromPoint = () => null
window.scrollTo = vi.fn()

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
  vi.resetAllMocks()
  vi.unstubAllEnvs()
})
