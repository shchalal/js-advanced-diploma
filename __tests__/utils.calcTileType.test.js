import { calcTileType } from '../src/js/utils';

test('calcTileType 8x8 corners/edges/center', () => {
  const s = 8;
  expect(calcTileType(0, s)).toBe('top-left');
  expect(calcTileType(7, s)).toBe('top-right');
  expect(calcTileType(56, s)).toBe('bottom-left');
  expect(calcTileType(63, s)).toBe('bottom-right');
  expect(calcTileType(3, s)).toBe('top');
  expect(calcTileType(60, s)).toBe('bottom');
  expect(calcTileType(16, s)).toBe('left');
  expect(calcTileType(23, s)).toBe('right');
  expect(calcTileType(27, s)).toBe('center');
});
