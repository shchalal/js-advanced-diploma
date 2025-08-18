export default class GameStateService {
  constructor(storage, key = 'state') {
    this.storage = storage;
    this.key = key;
  }

  save(state) {
    
    const json = JSON.stringify(state);
    this.storage.setItem(this.key, json);
  }

  load() {
    const raw = this.storage.getItem(this.key);
    if (!raw) {
      throw new Error('No saved state');
    }
    try {
      return JSON.parse(raw);
    } catch (_) {
      throw new Error('Invalid saved state');
    }
  }

  clear() {
    this.storage.removeItem(this.key);
  }
}

