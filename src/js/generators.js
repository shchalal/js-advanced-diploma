/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
import Team from './Team';

export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const Type = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const level = Math.floor(Math.random() * maxLevel) + 1;
    yield new Type(level);
  }
}

export default function generateTeam(allowedTypes, maxLevel, characterCount) {
  const gen = characterGenerator(allowedTypes, maxLevel);
  const chars = [];
  for (let i = 0; i < characterCount; i += 1) {
    chars.push(gen.next().value);
  }
  return new Team(chars);
}
