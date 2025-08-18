
import GameController from '../src/js/GameController';
import PositionedCharacter from '../src/js/PositionedCharacter';
import { Bowman, Vampire } from '../src/js/characters';


function createGamePlayStub() {
  return {
    setCursor: jest.fn(),
    selectCell: jest.fn(),
    deselectCell: jest.fn(),
    hideCellTooltip: jest.fn(),
    showCellTooltip: jest.fn(),
    addCellEnterListener: jest.fn(),
    addCellLeaveListener: jest.fn(),
    addCellClickListener: jest.fn(),
    drawUi: jest.fn(),
    redrawPositions: jest.fn(),
  };
}

function createGC() {
  const gamePlay = createGamePlayStub();
  const stateService = { save: jest.fn(), load: jest.fn(() => { throw new Error('no state'); }) };
  const gc = new GameController(gamePlay, stateService);
  return { gc, gamePlay };
}

describe('updateCursorAndHighlights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('hover own unit -> pointer, no highlight', () => {
    const { gc, gamePlay } = createGC();

    const player = new PositionedCharacter(new Bowman(1), 27);
    gc.positions = [player];
    gc.selected = player; 

    gc.updateCursorAndHighlights(27);

    expect(gamePlay.setCursor).toHaveBeenCalledWith('pointer');
    expect(gamePlay.selectCell).not.toHaveBeenCalledWith(27, 'green');
    expect(gamePlay.selectCell).not.toHaveBeenCalledWith(27, 'red');
  });

  test('hover empty cell within move range -> pointer + green highlight', () => {
    const { gc, gamePlay } = createGC();

    
    const player = new PositionedCharacter(new Bowman(1), 27);
    gc.positions = [player];
    gc.selected = player;

    const emptyMovable = 29; 
    gc.updateCursorAndHighlights(emptyMovable);

    expect(gamePlay.setCursor).toHaveBeenCalledWith('pointer');
    expect(gamePlay.selectCell).toHaveBeenCalledWith(emptyMovable, 'green');
  });

  test('hover enemy in attack radius -> crosshair + red highlight', () => {
    const { gc, gamePlay } = createGC();

 
    const player = new PositionedCharacter(new Bowman(1), 27);
    const enemy = new PositionedCharacter(new Vampire(1), 29);
    gc.positions = [player, enemy];
    gc.selected = player;

    gc.updateCursorAndHighlights(29);

    expect(gamePlay.setCursor).toHaveBeenCalledWith('crosshair');
    expect(gamePlay.selectCell).toHaveBeenCalledWith(29, 'red');
  });

  test('hover invalid cell (neither move nor attack) -> notallowed', () => {
    const { gc, gamePlay } = createGC();


    const player = new PositionedCharacter(new Bowman(1), 27);
    gc.positions = [player];
    gc.selected = player;

    const invalid = 63; 
    gc.updateCursorAndHighlights(invalid);

    expect(gamePlay.setCursor).toHaveBeenCalledWith('notallowed');
    expect(gamePlay.selectCell).not.toHaveBeenCalled();
  });

  test('no selected unit and hover empty -> notallowed', () => {
    const { gc, gamePlay } = createGC();

 
    const player = new PositionedCharacter(new Bowman(1), 27);
    gc.positions = [player];
    gc.selected = null;

    const empty = 10;
    gc.updateCursorAndHighlights(empty);

    expect(gamePlay.setCursor).toHaveBeenCalledWith('notallowed');
    expect(gamePlay.selectCell).not.toHaveBeenCalled();
  });
});
