/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */

import Character from './Character';

export default class Team {

  constructor(characters = []) {
  
    this.characters = [];
    this.addAll(...characters);
  }

  add(character) {
    if (!(character instanceof Character)) {
      throw new TypeError('Team accepts only Character instances');
    }
    this.characters.push(character);
    return this;
  }

  
  addAll(...characters) {
    characters.forEach((c) => this.add(c));
    return this;
  }


  removeAt(index) {
    if (index < 0 || index >= this.characters.length) return null;
    const [removed] = this.characters.splice(index, 1);
    return removed ?? null;
  }

 
  clear() {
    this.characters.length = 0;
  }


  get size() {
    return this.characters.length;
  }

  /
  *[Symbol.iterator]() {
    yield* this.characters;
  }
}

