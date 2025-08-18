import GameStateService from '../src/js/GameStateService';

beforeEach(() => localStorage.clear());

test('load success', () => {
  localStorage.setItem('state', JSON.stringify({ level: 2 }));
  const svc = new GameStateService(localStorage);
  expect(svc.load()).toMatchObject({ level: 2 });
});

test('load failure -> throws', () => {
  const svc = new GameStateService(localStorage);
  expect(() => svc.load()).toThrow();
});
