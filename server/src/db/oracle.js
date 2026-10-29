// server/src/db/oracle.js
// Oracle ORDS adapter – extends DataAdapter.
// Stub implementation for Phase 0; methods will be filled later.

import { DataAdapter } from './adapter.js';

export class OracleAdapter extends DataAdapter {
  constructor() {
    super();
    console.log('OracleAdapter: will connect to ORDS');
  }

  async initialize() {
    // TODO: set up ORDS connection / validate endpoint
    console.log('OracleAdapter: ORDS connection ready (stub)');
  }

  async close() {
    // TODO: clean up ORDS resources
    console.log('OracleAdapter: closed (stub)');
  }
}
