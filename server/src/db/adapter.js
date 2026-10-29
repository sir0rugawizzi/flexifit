// server/src/db/adapter.js
// Abstract data-adapter interface. Every method throws "Not implemented"
// until overridden by a concrete adapter (LocalAdapter or OracleAdapter).

import config from '../config.js';

/**
 * Base class that defines the contract for all data adapters.
 * Concrete adapters must extend this and override every method they support.
 */
export class DataAdapter {
  // ── Lifecycle ───────────────────────────────────────────
  async initialize() { throw new Error('Not implemented'); }
  async close()      { throw new Error('Not implemented'); }

  // ── Users ───────────────────────────────────────────────
  async createUser(data)      { throw new Error('Not implemented'); }
  async getUserByEmail(email) { throw new Error('Not implemented'); }
  async getUserById(id)       { throw new Error('Not implemented'); }
  async updateUser(id, data)  { throw new Error('Not implemented'); }

  // ── Trainer ─────────────────────────────────────────────
  async getTrainerProfile(userId)         { throw new Error('Not implemented'); }
  async updateTrainerProfile(userId, data){ throw new Error('Not implemented'); }
  async getTrainerClients(trainerId)      { throw new Error('Not implemented'); }
  async getClientDetail(clientId)         { throw new Error('Not implemented'); }

  // ── Foods ───────────────────────────────────────────────
  async getFoods(search, category) { throw new Error('Not implemented'); }
  async getFoodById(id)            { throw new Error('Not implemented'); }
  async createFood(data)           { throw new Error('Not implemented'); }

  // ── Workout Plans ───────────────────────────────────────
  async getWorkoutPlans(trainerId)          { throw new Error('Not implemented'); }
  async getWorkoutPlanById(id)              { throw new Error('Not implemented'); }
  async createWorkoutPlan(data)             { throw new Error('Not implemented'); }
  async assignWorkoutPlan(clientId, planId) { throw new Error('Not implemented'); }
  async getAssignedWorkoutPlan(clientId)    { throw new Error('Not implemented'); }

  // ── Meal Plans ──────────────────────────────────────────
  async getMealPlans(trainerId)          { throw new Error('Not implemented'); }
  async getMealPlanById(id)              { throw new Error('Not implemented'); }
  async createMealPlan(data)             { throw new Error('Not implemented'); }
  async assignMealPlan(clientId, planId) { throw new Error('Not implemented'); }
  async getAssignedMealPlan(clientId)    { throw new Error('Not implemented'); }

  // ── Logs ────────────────────────────────────────────────
  async logWorkout(data)              { throw new Error('Not implemented'); }
  async logMeal(data)                 { throw new Error('Not implemented'); }
  async logWeight(data)               { throw new Error('Not implemented'); }
  async getWorkoutLogs(clientId, days) { throw new Error('Not implemented'); }
  async getMealLogs(clientId, days)    { throw new Error('Not implemented'); }
  async getWeightLogs(clientId, days)  { throw new Error('Not implemented'); }

  // ── Check-ins ───────────────────────────────────────────
  async createCheckIn(data)    { throw new Error('Not implemented'); }
  async getCheckIns(clientId)  { throw new Error('Not implemented'); }

  // ── Messages ────────────────────────────────────────────
  async getMessages(userId1, userId2) { throw new Error('Not implemented'); }
  async createMessage(data)           { throw new Error('Not implemented'); }

  // ── Form checks ─────────────────────────────────────────
  async createFormCheck(data)                       { throw new Error('Not implemented'); }
  async getFormChecks(clientId)                      { throw new Error('Not implemented'); }
  async updateFormCheckTrainerFeedback(id, feedback) { throw new Error('Not implemented'); }

  // ── Pose sessions ──────────────────────────────────────
  async createPoseSession(data) { throw new Error('Not implemented'); }

  // ── Subscriptions ──────────────────────────────────────
  async createSubscription(data)    { throw new Error('Not implemented'); }
  async getSubscriptions(clientId)  { throw new Error('Not implemented'); }

  // ── Call requests ──────────────────────────────────────
  async createCallRequest(data)      { throw new Error('Not implemented'); }
  async getCallRequests(trainerId)   { throw new Error('Not implemented'); }

  // ── Analytics ──────────────────────────────────────────
  async getClientComplianceFlags(trainerId)    { throw new Error('Not implemented'); }
  async getClientMacroAdherence(clientId, days) { throw new Error('Not implemented'); }
  async getBusinessStats(trainerId)             { throw new Error('Not implemented'); }
}

/**
 * Factory: returns the correct adapter based on config.USE_LOCAL_DB.
 */
export async function createAdapter() {
  if (config.USE_LOCAL_DB) {
    const { LocalAdapter } = await import('./local.js');
    return new LocalAdapter();
  }

  const { OracleAdapter } = await import('./oracle.js');
  return new OracleAdapter();
}
