import Character from '../Character';

export default class Swordsman extends Character {
  constructor(level = 1) {
    super(level, 'swordsman');
    this.attack = 40;
    this.defence = 10;
  }
}
