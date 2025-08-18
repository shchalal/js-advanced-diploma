/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;
  const last = boardSize - 1;

  if (row === 0 && col === 0) return 'top-left';
  if (row === 0 && col === last) return 'top-right';
  if (row === last && col === 0) return 'bottom-left';
  if (row === last && col === last) return 'bottom-right';
  if (row === 0) return 'top';
  if (row === last) return 'bottom';
  if (col === 0) return 'left';
  if (col === last) return 'right';
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function formatStats({ level, attack, defence, health }) {
  return `🎖${level} ⚔${attack} 🛡${defence} ❤${health}`;
}

export const BOARD_SIZE = 8;

export function indexToRC(index, size = BOARD_SIZE) {
  return { r: Math.floor(index / size), c: index % size };
}
export function rcToIndex(r, c, size = BOARD_SIZE) { return r * size + c; }
export function chebyshev(a, b, size = BOARD_SIZE) {
  const A = indexToRC(a, size), B = indexToRC(b, size);
  return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
}


const dirs = [
  [-1,0],[1,0],[0,-1],[0,1], 
  [-1,-1],[-1,1],[1,-1],[1,1] 
];

export function reachableBySteps(from, maxSteps, size = BOARD_SIZE) {
  const { r, c } = indexToRC(from, size);
  const cells = new Set();
  for (const [dr, dc] of dirs) {
    for (let step = 1; step <= maxSteps; step++) {
      const nr = r + dr * step, nc = c + dc * step;
      if (nr < 0 || nc < 0 || nr >= size || nc >= size) break;
      cells.add(rcToIndex(nr, nc, size));
    }
  }
  return cells;
}

export function attackRadius(from, maxRange, size = BOARD_SIZE) {
  
  const res = new Set();
  const { r, c } = indexToRC(from, size);
  for (let nr = 0; nr < size; nr++) {
    for (let nc = 0; nc < size; nc++) {
      if (nr === r && nc === c) continue;
      if (Math.max(Math.abs(nr - r), Math.abs(nc - c)) <= maxRange) {
        res.add(rcToIndex(nr, nc, size));
      }
    }
  }
  return res;
}
