import Character from '../src/js/Character';
import { Bowman, Swordsman, Magician, Vampire, Undead, Daemon } from '../src/js/characters';

test('base class throws', () => {
  expect(() => new Character(1, 'x')).toThrow();
});

test('level & stats 1-lvl', () => {
  expect(new Bowman(1)).toMatchObject({ level: 1, attack: 25, defence: 25, type: 'bowman' });
  expect(new Swordsman(1)).toMatchObject({ attack: 40, defence: 10 });
  expect(new Magician(1)).toMatchObject({ attack: 10, defence: 40 });
  expect(new Vampire(1)).toMatchObject({ attack: 25, defence: 25 });
  expect(new Undead(1)).toMatchObject({ attack: 40, defence: 10 });
  expect(new Daemon(1)).toMatchObject({ attack: 10, defence: 10 });
});
