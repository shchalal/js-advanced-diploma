import { characterGenerator } from '../src/js/generators';
import { Bowman, Swordsman, Magician } from '../src/js/characters';

test('characterGenerator yields infinitely allowed types', () => {
  const gen = characterGenerator([Bowman, Swordsman, Magician], 2);
  const a = gen.next().value; const b = gen.next().value; const c = gen.next().value;
  expect(['bowman', 'swordsman', 'magician']).toContain(a.type);
  expect(['bowman', 'swordsman', 'magician']).toContain(b.type);
  expect(['bowman', 'swordsman', 'magician']).toContain(c.type);
  expect([1,2]).toContain(a.level);
});
