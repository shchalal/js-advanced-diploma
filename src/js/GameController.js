import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import {
  Bowman, Swordsman, Magician, Vampire, Undead, Daemon,
} from './characters';
import generateTeam from './generators';
import { formatStats } from './utils';
import GameState from './GameState';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;

    this.boardSize = 8;
    this.playerTypes = [Bowman, Swordsman, Magician];
    this.enemyTypes = [Vampire, Undead, Daemon];

    this.positions = [];
    this.selected = null;
    this.state = new GameState();

  
    this._lastHoverIndex = null;

    this.onCellEnter = this.onCellEnter.bind(this);
    this.onCellLeave = this.onCellLeave.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
  }

  showError(msg) {
    if (typeof this.gamePlay.showError === 'function') {
      this.gamePlay.showError(msg);
    } else if (typeof this.gamePlay.showMessage === 'function') {
      this.gamePlay.showMessage(msg);
    } else if (typeof window !== 'undefined') {
  
      window.alert(msg);
    }
  }

  clearHighlights() {
    const total = this.boardSize * this.boardSize;
    for (let i = 0; i < total; i += 1) {
      this.gamePlay.deselectCell(i);
    }
    this._lastHoverIndex = null;
  }

  init() {
    this.applyThemeForLevel(this.state.level);

    this.gamePlay.addCellEnterListener(this.onCellEnter);
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
    this.gamePlay.addCellClickListener(this.onCellClick);
    this.gamePlay.addNewGameListener?.(() => this.newGame());

    this.gamePlay.addSaveGameListener?.(() => this.saveGame());
    this.gamePlay.addLoadGameListener?.(() => this.loadGame());

    try {
      const loaded = this.stateService.load();
      this.deserialize(loaded);
      this.applyThemeForLevel(this.state.level);
      this.gamePlay.redrawPositions(this.positions);
    } catch (e) {
      this.newGame(true);
    }
  }


  onCellClick(index) {
    if (this.state.locked) return;

    const pcAt = this.getPCAt(index);
    const { selected } = this;

    if (pcAt && this.isPlayerCharacter(pcAt)) {
      if (selected && selected.position !== index) {
        this.gamePlay.deselectCell(selected.position);
      }
      this.selected = pcAt;
      this.state.setSelected(index);
      this.gamePlay.selectCell(index);
      return;
    }

    
    if (!selected) {
      this.showError('Выберите своего персонажа');
      return;
    }

    const { move, attack } = this.rangeByType(selected.character.type);
    const moveSet = this.reachableBySteps(selected.position, move);
    const attackSet = this.attackRadius(selected.position, attack);

   
    if (!pcAt && moveSet.has(index)) {
      selected.position = index;
      this.afterPlayerAction();
      return;
    }


    if (pcAt && !this.isPlayerCharacter(pcAt) && attackSet.has(index)) {
      this.attack(selected, pcAt).then(() => this.afterPlayerAction());
      return;
    }

    
    this.showError('Недопустимое действие');
  }

  onCellEnter(index) {
    if (this.state.locked) return;

    const pcAt = this.getPCAt(index);
    if (pcAt) {
      this.gamePlay.showCellTooltip(formatStats(pcAt.character), index);
    }

   
    if (
      this._lastHoverIndex !== null
      && this._lastHoverIndex !== this.state.selected
      && this._lastHoverIndex !== index
    ) {
      this.gamePlay.deselectCell(this._lastHoverIndex);
    }
    this._lastHoverIndex = index;

    this.updateCursorAndHighlights(index);
  }

  onCellLeave(index) {
    if (this.state.locked) return;

    this.gamePlay.hideCellTooltip(index);


    if (!this.selected || this.selected.position !== index) {
      this.gamePlay.deselectCell(index);
    }

    if (this._lastHoverIndex === index) {
      this._lastHoverIndex = null;
    }

    this.gamePlay.setCursor('auto');
  }

  updateCursorAndHighlights(index) {
    const { selected } = this;
    const pcAt = this.getPCAt(index);

    if (pcAt && this.isPlayerCharacter(pcAt)) {
      this.gamePlay.setCursor('pointer');
      return;
    }
    if (!selected) {
      this.gamePlay.setCursor('notallowed');
      return;
    }

    const { move, attack } = this.rangeByType(selected.character.type);
    const canMove = !pcAt && this.reachableBySteps(selected.position, move).has(index);
    const canHit = pcAt
      && !this.isPlayerCharacter(pcAt)
      && this.attackRadius(selected.position, attack).has(index);

    if (canMove) {
      this.gamePlay.setCursor('pointer');
      this.gamePlay.selectCell(index, 'green');
    } else if (canHit) {
      this.gamePlay.setCursor('crosshair');
      this.gamePlay.selectCell(index, 'red');
    } else {
      this.gamePlay.setCursor('notallowed');
    }
  }

  afterPlayerAction() {
   
    this.clearHighlights();

    this.state.clearSelection();
    this.selected = null;

    this.gamePlay.redrawPositions(this.positions);
    if (this.checkEndConditions()) return;

    this.state.turn = 'ai';
    this.save();
    this.aiTurn();
  }

  async aiTurn() {
    if (this.state.locked) return;

   
    this.clearHighlights();

    const aiUnits = this.positions.filter((p) => !this.isPlayerCharacter(p));
    const playerUnits = this.positions.filter((p) => this.isPlayerCharacter(p));

   
    for (const unit of aiUnits) {
      const { attack } = this.rangeByType(unit.character.type);
      const zone = this.attackRadius(unit.position, attack);
      const target = playerUnits.find((p) => zone.has(p.position));
      if (target) {
        await this.attack(unit, target);
        this.gamePlay.redrawPositions(this.positions);
        if (this.checkEndConditions()) return;
        this.state.turn = 'player';
        this.save();
        return;
      }
    }

   
    const occupied = new Set(this.positions.map((p) => p.position));
    const pickMove = (u) => {
      const { move } = this.rangeByType(u.character.type);
      const candidates = [...this.reachableBySteps(u.position, move)]
        .filter((i) => !occupied.has(i));
      if (candidates.length === 0) return u.position;
      let best = candidates[0];
      let bestScore = Infinity;
      for (const c of candidates) {
        const score = Math.min(...playerUnits.map((p) => this.chebyshev(c, p.position)));
        if (score < bestScore) { bestScore = score; best = c; }
      }
      return best;
    };

    const mover = aiUnits[0];
    const to = pickMove(mover);
    mover.position = to;

    this.gamePlay.redrawPositions(this.positions);
    if (this.checkEndConditions()) return;

    this.state.turn = 'player';
    this.save();
  }

  async attack(attackerPC, targetPC) {
    const att = attackerPC.character;
    const tgt = targetPC.character;
    const damage = Math.max(att.attack - tgt.defence, Math.floor(att.attack * 0.1));
    tgt.health = Math.max(0, tgt.health - damage);

    await this.gamePlay.showDamage(targetPC.position, damage);

    if (tgt.health === 0) {
      const wasEnemy = !this.isPlayerCharacter(targetPC);
      this.positions = this.positions.filter((p) => p !== targetPC);
      if (wasEnemy) this.state.score += 100;
    }

    this.gamePlay.redrawPositions(this.positions);
  }


  checkEndConditions() {
    const playerAlive = this.positions.some((p) => this.isPlayerCharacter(p));
    const enemyAlive = this.positions.some((p) => !this.isPlayerCharacter(p));

    if (!playerAlive) {
      this.state.locked = true;
      this.state.maxScore = Math.max(this.state.maxScore, this.state.score);
      this.save();
      this.showError('Game Over');
      return true;
    }

    if (!enemyAlive) {
      this.levelUpPlayers();
      if (this.state.level < 4) {
        this.state.level += 1;
        this.applyThemeForLevel(this.state.level);
        this.spawnNewWave();
        this.state.turn = 'player';
        this.save();
        this.gamePlay.redrawPositions(this.positions);
        return true;
      }

      this.state.locked = true;
      this.state.maxScore = Math.max(this.state.maxScore, this.state.score);
      this.save();
      this.showError('Победа! Все уровни пройдены');
      return true;
    }

    return false;
  }

  newGame(preserveMax = false) {
    const keepMax = preserveMax ? this.state.maxScore : 0;
    this.state = new GameState();
    this.state.maxScore = keepMax;
    this.selected = null;
    this._lastHoverIndex = null;

    this.applyThemeForLevel(this.state.level);
    this.spawnInitialTeams();
    this.clearHighlights();
    this.gamePlay.redrawPositions(this.positions);
    this.save();
  }

  spawnInitialTeams() {
    this.positions = [];

    const colsPlayer = [0, 1];
    const colsEnemy = [6, 7];

    const playerTeam = generateTeam(this.playerTypes, 2, 3);
    const enemyTeam = generateTeam(this.enemyTypes, 2, 3);

    const free = new Set([...Array(this.boardSize * this.boardSize)].map((_, i) => i));

    const placeTeam = (team, cols) => {
      team.characters.forEach((ch) => {
        const candidates = [];
        for (let r = 0; r < this.boardSize; r += 1) {
          cols.forEach((c) => {
            const idx = this.rcToIndex(r, c);
            if (free.has(idx)) candidates.push(idx);
          });
        }
        const pos = this.getRandomFreeCell(candidates);
        free.delete(pos);
        this.positions.push(new PositionedCharacter(ch, pos));
      });
    };

    placeTeam(playerTeam, colsPlayer);
    placeTeam(enemyTeam, colsEnemy);
  }

  spawnNewWave() {
    const players = this.positions.filter((p) => this.isPlayerCharacter(p));
    const enemies = this.positions.filter((p) => !this.isPlayerCharacter(p));
    if (enemies.length > 0) return;

    const needed = Math.max(3, players.length + 1);
    const lvl = Math.min(4, this.state.level);
    const enemyTeam = generateTeam(this.enemyTypes, lvl, needed);

    const free = new Set([...Array(this.boardSize * this.boardSize)].map((_, i) => i));
    players.forEach((p) => free.delete(p.position));

    const colsEnemy = [6, 7];
    enemyTeam.characters.forEach((ch) => {
      const candidates = [];
      for (let r = 0; r < this.boardSize; r += 1) {
        colsEnemy.forEach((c) => {
          const idx = this.rcToIndex(r, c);
          if (free.has(idx)) candidates.push(idx);
        });
      }
      if (candidates.length === 0) return;
      const pos = this.getRandomFreeCell(candidates);
      free.delete(pos);
      this.positions.push(new PositionedCharacter(ch, pos));
    });
  }

  levelUpPlayers() {
    this.positions.forEach((p) => {
      if (!this.isPlayerCharacter(p)) return;
      const ch = p.character;
      ch.level = Math.min(4, ch.level + 1);

      const newHealth = Math.min(100, ch.level + 80);
      const ratio = (80 + ch.health) / 100;
      ch.attack = Math.max(ch.attack, Math.floor(ch.attack * ratio));
      ch.defence = Math.max(ch.defence, Math.floor(ch.defence * ratio));
      ch.health = newHealth;
    });
  }

  applyThemeForLevel(level) {
    const order = [themes.prairie, themes.desert, themes.arctic, themes.mountain];
    const theme = order[Math.min(level - 1, order.length - 1)];
    this.state.theme = theme;
    this.gamePlay.drawUi(theme);
  }


  isPlayerCharacter(pc) {
    return ['bowman', 'swordsman', 'magician'].includes(pc.character.type);
  }

  getPCAt(index) {
    return this.positions.find((p) => p.position === index);
  }

  rangeByType(type) {
    switch (type) {
      case 'swordsman':
      case 'undead':
        return { move: 4, attack: 1 };
      case 'bowman':
      case 'vampire':
        return { move: 2, attack: 2 };
      case 'magician':
      case 'daemon':
        return { move: 1, attack: 4 };
      default:
        return { move: 1, attack: 1 };
    }
  }

  indexToRC(index) {
    return { r: Math.floor(index / this.boardSize), c: index % this.boardSize };
  }

  rcToIndex(r, c) {
    return r * this.boardSize + c;
  }

  chebyshev(a, b) {
    const A = this.indexToRC(a);
    const B = this.indexToRC(b);
    return Math.max(Math.abs(A.r - B.r), Math.abs(A.c - B.c));
  }

  reachableBySteps(from, maxSteps) {
    const dirs = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];
    const { r, c } = this.indexToRC(from);
    const cells = new Set();
    dirs.forEach(([dr, dc]) => {
      for (let step = 1; step <= maxSteps; step += 1) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nc < 0 || nr >= this.boardSize || nc >= this.boardSize) break;
        cells.add(this.rcToIndex(nr, nc));
      }
    });
    return cells;
  }

  attackRadius(from, maxRange) {
    const { r, c } = this.indexToRC(from);
    const res = new Set();
    for (let nr = 0; nr < this.boardSize; nr += 1) {
      for (let nc = 0; nc < this.boardSize; nc += 1) {
        if (nr === r && nc === c) continue;
        if (Math.max(Math.abs(nr - r), Math.abs(nc - c)) <= maxRange) {
          res.add(this.rcToIndex(nr, nc));
        }
      }
    }
    return res;
  }

  getRandomFreeCell(candidates) {
    if (!candidates.length) throw new Error('No free cells to place a character');
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  typeToCtor(type) {
    switch (type) {
      case 'bowman': return Bowman;
      case 'swordsman': return Swordsman;
      case 'magician': return Magician;
      case 'vampire': return Vampire;
      case 'undead': return Undead;
      case 'daemon': return Daemon;
      default: throw new Error(`Unknown type: ${type}`);
    }
  }

 
  save() {
    try {
      this.state.positions = this.positions.map((p) => ({
        position: p.position,
        character: {
          type: p.character.type,
          level: p.character.level,
          attack: p.character.attack,
          defence: p.character.defence,
          health: p.character.health,
        },
      }));
      this.stateService.save(this.state);
    } catch (e) {
    
    }
  }

  saveGame() { this.save(); }

  loadGame() {
    try {
      const data = this.stateService.load();
      this.deserialize(data);
      this.applyThemeForLevel(this.state.level);
      this.clearHighlights();
      this.gamePlay.redrawPositions(this.positions);
    } catch (e) {
      this.showError('Не удалось загрузить сохранение');
    }
  }

  deserialize(data) {
    if (data && 'state' in data && 'positions' in data) {
      const merged = { ...data.state, positions: data.positions };
      this.state = GameState.from(merged);
    } else {
      this.state = GameState.from(data);
    }

    this.positions = this.state.positions.map((p) => {
      const Ctor = this.typeToCtor(p.character.type);
      const ch = new Ctor(1);
      ch.level = p.character.level;
      ch.attack = p.character.attack;
      ch.defence = p.character.defence;
      ch.health = p.character.health;
      return new PositionedCharacter(ch, p.position);
    });

    if (Number.isInteger(this.state.selected)) {
      const pc = this.getPCAt(this.state.selected);
      if (pc) {
        this.selected = pc;
        this.gamePlay.selectCell(this.state.selected);
      } else {
        this.state.clearSelection();
        this.selected = null;
      }
    }
  }
}
