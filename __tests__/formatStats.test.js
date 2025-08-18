import { formatStats } from '../src/js/utils';

test('formatStats works', () => {
  const s = formatStats({
    level: 1, attack: 10, defence: 40, health: 50,
  });
  expect(s).toBe('🎖1 ⚔10 🛡40 ❤50');
});
