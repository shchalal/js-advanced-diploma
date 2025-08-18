import Character from '../Character';

export default class Bowman extends Character {
  constructor(level = 1) {
    super(level, 'bowman');
    this.attack = 25;
    this.defence = 25;
  }
}
