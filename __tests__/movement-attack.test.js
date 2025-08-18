
import GameController from '../src/js/GameController';


function createGC() {
  const gamePlayStub = {};
  const stateServiceStub = { save() {}, load() { throw new Error('no state'); } };
  const gc = new GameController(gamePlayStub, stateServiceStub);

  expect(gc.boardSize).toBe(8);
  return gc;
}

describe('movement & attack utils on 8x8 board', () => {
  test('reachableBySteps from top-left (index 0), move=2', () => {
    const gc = createGC();
    
    const set = gc.reachableBySteps(0, 2);
    const expected = new Set([1, 2, 8, 16, 9, 18]);
    expect(set).toEqual(expected);
  });

  test('reachableBySteps from center (index 27), move=1', () => {
    const gc = createGC();

    const set = gc.reachableBySteps(27, 1);
    const expected = new Set([

      19, 35, 26, 28,
 ли
      18, 20, 34, 36,
    ]);
    expect(set).toEqual(expected);
    expect(set.size).toBe(8);
  });

  test('attackRadius from top-left (index 0), range=1', () => {
    const gc = createGC();
    const set = gc.attackRadius(0, 1);
  
    const expected = new Set([1, 8, 9]);
    expect(set).toEqual(expected);
    expect(set.size).toBe(3);
  
    expect(set.has(2)).toBe(false);
    expect(set.has(16)).toBe(false);
  });

  test('attackRadius from center (index 27), range=2', () => {
    const gc = createGC();
    const set = gc.attackRadius(27, 2);


    expect(set.size).toBe(24);

    
    const rcToIndex = (r, c) => r * 8 + c;
    const samplesInside = [
      rcToIndex(1, 1), 
      rcToIndex(1, 5),
      rcToIndex(5, 1), 
      rcToIndex(5, 5), 
    ];
    for (const idx of samplesInside) {
      expect(set.has(idx)).toBe(true);
    }

    
    const outside = rcToIndex(0, 3); 
    expect(set.has(outside)).toBe(false);
  });
});
