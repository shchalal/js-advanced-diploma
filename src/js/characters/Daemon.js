
import Character from '../Character';

export default class Daemon extends Character {
  constructor(level = 1) {
    super(level, 'daemon');
    this.attack = 10;
    this.defence = 10;
  }
}
