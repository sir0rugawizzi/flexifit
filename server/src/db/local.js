// server/src/db/local.js
// Local SQLite adapter – extends DataAdapter.
// Stub implementation for Phase 0; methods will be filled in Phase 1.

import { DataAdapter } from './adapter.js';

export class LocalAdapter extends DataAdapter {
  constructor() {
    super();
    console.log('LocalAdapter: will initialize SQLite');
  }

  async initialize() {
    // Phase 1: create SQLite tables here
    console.log('LocalAdapter: SQLite ready (stub)');
  }

  async close() {
    // Phase 1: close the SQLite connection here
    console.log('LocalAdapter: closed (stub)');
  }
}
