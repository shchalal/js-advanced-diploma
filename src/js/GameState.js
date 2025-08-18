// src/js/GameState.js
export default class GameState {
  constructor() {
    this.level = 1;
    this.turn = 'player';
    this.locked = false;
    this.selected = null;
    this.score = 0;
    this.maxScore = 0;
    this.round = 1;
    this.theme = this.levelToTheme(this.level);
    this.positions = [];
  }

  static from(obj) {
    const s = new GameState();
    if (!obj || typeof obj !== 'object') return s;

    const allow = ['level', 'turn', 'locked', 'selected', 'score', 'maxScore', 'round', 'theme', 'positions'];
    for (const k of allow) if (k in obj) s[k] = obj[k];

    if (s.level < 1) s.level = 1;
    if (!['player', 'ai'].includes(s.turn)) s.turn = 'player';
    if (!Array.isArray(s.positions)) s.positions = [];
    if (typeof s.theme !== 'string') s.theme = s.levelToTheme(s.level);

    return s;
  }

  levelToTheme(level) {
    const order = ['prairie', 'desert', 'arctic', 'mountain'];
    return order[Math.min(level - 1, order.length - 1)];
  }

  setSelected(index) { this.selected = index; }

  clearSelection() { this.selected = null; }

  nextLevel() {
    this.level = Math.min(4, this.level + 1);
    this.round = 1;
    this.theme = this.levelToTheme(this.level);
    this.turn = 'player';
  }

  toJSON() {
    const {
      level, turn, locked, selected, score, maxScore, round, theme, positions,
    } = this;
    return {
      level, turn, locked, selected, score, maxScore, round, theme, positions,
    };
  }
}
