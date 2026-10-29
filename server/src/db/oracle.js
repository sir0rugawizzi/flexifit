// server/src/db/oracle.js
// Oracle ORDS REST adapter – connects to apex.oracle.com ORDS REST endpoints

import { DataAdapter } from './adapter.js';
import { LocalAdapter } from './local.js';
import config from '../config.js';

export class OracleAdapter extends DataAdapter {
  constructor(baseUrl) {
    super();
    this.baseUrl = baseUrl || config.ORDS_BASE_URL;
    // Hybrid fallback adapter to ensure no operations break if ORDS is partially configured
    this.fallbackAdapter = new LocalAdapter();
  }

  async initialize() {
    console.log(`OracleAdapter: configuring connection to ORDS at ${this.baseUrl}`);
    await this.fallbackAdapter.initialize();

    if (!this.baseUrl) {
      console.warn('OracleAdapter: ORDS_BASE_URL is not set. Using local adapter fallback.');
      return;
    }

    try {
      // Validate connectivity by fetching foods feed from ORDS
      const res = await fetch(`${this.baseUrl}/foods`, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        console.log('OracleAdapter: successfully connected and verified ORDS endpoint!');
      } else {
        console.warn(`OracleAdapter: ORDS returned status ${res.status}. Fallback enabled.`);
      }
    } catch (err) {
      console.warn('OracleAdapter: cannot reach ORDS host, fallback enabled:', err.message);
    }
  }

  async close() {
    await this.fallbackAdapter.close();
    console.log('OracleAdapter: closed ORDS adapter');
  }

  async fetchOrds(endpoint, options = {}) {
    if (!this.baseUrl) return null;
    try {
      const url = `${this.baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers || {}),
        },
      });
      if (!res.ok) throw new Error(`ORDS HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`ORDS request failed for ${endpoint}:`, err.message);
      return null;
    }
  }

  // ── Users ─────────────────────────────────────────────────
  async createUser(data) {
    return this.fallbackAdapter.createUser(data);
  }

  async getUserByEmail(email) {
    return this.fallbackAdapter.getUserByEmail(email);
  }

  async getUserById(id) {
    return this.fallbackAdapter.getUserById(id);
  }

  async updateUser(id, data) {
    return this.fallbackAdapter.updateUser(id, data);
  }

  // ── Trainer ───────────────────────────────────────────────
  async getTrainerProfile(userId) {
    return this.fallbackAdapter.getTrainerProfile(userId);
  }

  async updateTrainerProfile(userId, data) {
    return this.fallbackAdapter.updateTrainerProfile(userId, data);
  }

  async getTrainerClients(trainerId) {
    // Try custom ORDS SQL handler first: GET /trainer/:trainer_id/clients
    const ordsData = await this.fetchOrds(`trainer/${trainerId}/clients`);
    if (ordsData && ordsData.items) {
      return ordsData.items.map((row) => ({
        id: row.client_id,
        name: row.client_name,
        flag_status: row.flag_status,
        macro_adherence_7d: row.macro_adherence_7d,
        last_workout_at: row.last_workout_at,
        last_weight_at: row.last_weight_at,
        last_checkin_at: row.last_checkin_at,
        flag_reasons: [
          row.flag_no_workout_3d ? 'No workout logged in last 3 days' : null,
          row.flag_low_macro_7d ? `7-day macro adherence < 70%` : null,
          row.flag_no_weight_7d ? 'No weight logged in last 7 days' : null,
          row.flag_missed_checkin_7d ? 'Weekly check-in overdue' : null,
        ].filter(Boolean),
      }));
    }
    return this.fallbackAdapter.getTrainerClients(trainerId);
  }

  async getClientDetail(clientId) {
    return this.fallbackAdapter.getClientDetail(clientId);
  }

  // ── Foods ─────────────────────────────────────────────────
  async getFoods(search, category, country) {
    // Try ORDS foods feed
    const ordsData = await this.fetchOrds('foods');
    if (ordsData && ordsData.items && ordsData.items.length > 0) {
      let items = ordsData.items;
      if (search) {
        const s = search.toLowerCase();
        items = items.filter(
          (f) =>
            f.name?.toLowerCase().includes(s) ||
            f.local_name?.toLowerCase().includes(s) ||
            f.portion_descriptor?.toLowerCase().includes(s)
        );
      }
      if (category) {
        items = items.filter((f) => f.category === category);
      }
      return items;
    }
    return this.fallbackAdapter.getFoods(search, category, country);
  }

  async getFoodById(id) {
    return this.fallbackAdapter.getFoodById(id);
  }

  async createFood(data) {
    return this.fallbackAdapter.createFood(data);
  }

  // ── Plans, Logs, Analytics Delegations ────────────────────
  async getWorkoutPlans(trainerId) { return this.fallbackAdapter.getWorkoutPlans(trainerId); }
  async getWorkoutPlanById(id) { return this.fallbackAdapter.getWorkoutPlanById(id); }
  async createWorkoutPlan(data) { return this.fallbackAdapter.createWorkoutPlan(data); }
  async assignWorkoutPlan(clientId, planId) { return this.fallbackAdapter.assignWorkoutPlan(clientId, planId); }
  async getAssignedWorkoutPlan(clientId) { return this.fallbackAdapter.getAssignedWorkoutPlan(clientId); }

  async getMealPlans(trainerId) { return this.fallbackAdapter.getMealPlans(trainerId); }
  async getMealPlanById(id) { return this.fallbackAdapter.getMealPlanById(id); }
  async createMealPlan(data) { return this.fallbackAdapter.createMealPlan(data); }
  async assignMealPlan(clientId, planId) { return this.fallbackAdapter.assignMealPlan(clientId, planId); }
  async getAssignedMealPlan(clientId) { return this.fallbackAdapter.getAssignedMealPlan(clientId); }

  async logWorkout(data) { return this.fallbackAdapter.logWorkout(data); }
  async logMeal(data) { return this.fallbackAdapter.logMeal(data); }
  async logWeight(data) { return this.fallbackAdapter.logWeight(data); }
  async getWorkoutLogs(clientId, days) { return this.fallbackAdapter.getWorkoutLogs(clientId, days); }
  async getMealLogs(clientId, days) { return this.fallbackAdapter.getMealLogs(clientId, days); }
  async getWeightLogs(clientId, days) { return this.fallbackAdapter.getWeightLogs(clientId, days); }

  async createCheckIn(data) { return this.fallbackAdapter.createCheckIn(data); }
  async getCheckIns(clientId) { return this.fallbackAdapter.getCheckIns(clientId); }

  async getMessages(userId1, userId2) { return this.fallbackAdapter.getMessages(userId1, userId2); }
  async createMessage(data) { return this.fallbackAdapter.createMessage(data); }

  async createFormCheck(data) { return this.fallbackAdapter.createFormCheck(data); }
  async getFormChecks(clientId) { return this.fallbackAdapter.getFormChecks(clientId); }
  async updateFormCheckTrainerFeedback(id, feedback) { return this.fallbackAdapter.updateFormCheckTrainerFeedback(id, feedback); }

  async createPoseSession(data) { return this.fallbackAdapter.createPoseSession(data); }

  async createSubscription(data) { return this.fallbackAdapter.createSubscription(data); }
  async getSubscriptions(clientId) { return this.fallbackAdapter.getSubscriptions(clientId); }

  async createCallRequest(data) { return this.fallbackAdapter.createCallRequest(data); }
  async getCallRequests(trainerId) { return this.fallbackAdapter.getCallRequests(trainerId); }

  async getClientComplianceFlags(trainerId) { return this.getTrainerClients(trainerId); }
  async getClientMacroAdherence(clientId, days) { return this.fallbackAdapter.getClientMacroAdherence(clientId, days); }
  async getBusinessStats(trainerId) { return this.fallbackAdapter.getBusinessStats(trainerId); }
}
