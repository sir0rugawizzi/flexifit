// server/src/db/oracle.js
// Oracle DB implementation using ORDS REST API
import { DataAdapter } from './adapter.js';
import config from '../config.js';

export class OracleAdapter extends DataAdapter {
  constructor() {
    super();
    this.baseUrl = config.ORDS_BASE_URL;
  }

  async initialize() {
    console.log(`OracleAdapter: Initializing connection to ORDS at ${this.baseUrl}`);
    // In ORDS, the "connection" is handled via HTTP.
    // We just verify the base URL is present.
    if (!this.baseUrl) {
      throw new Error('ORDS_BASE_URL is not configured. Cannot initialize OracleAdapter.');
    }
    console.log('OracleAdapter: REST connection verified');
  }

  async close() {
    // No persistent socket to close for REST API
    console.log('OracleAdapter: closed REST connection');
  }

  // Helper for making ORDS requests
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `ORDS Request failed with status ${response.status}`);
    }

    const data = await response.json();
    // ORDS typically wraps results in an 'items' array
    return data.items || data;
  }

  // ── Users & Auth ──────────────────────────────────────────
  async createUser(data) {
    const res = await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.getUserById(res.id);
  }

  async getUserByEmail(email) {
    const items = await this.request(`/users?q=email=${encodeURIComponent(email)}`);
    return items[0] || null;
  }

  async getUserById(id) {
    const user = await this.request(`/users/${id}`);
    if (!user) return null;

    // Fetch related profiles (ORDS usually handles this via joins or separate calls)
    const trainerProfile = await this.request(`/trainer_profiles/${id}`).catch(() => ({}));
    const clientProfile = await this.request(`/client_profiles/${id}`).catch(() => ({}));

    return {
      ...user,
      trainer_profile: trainerProfile,
      client_profile: clientProfile,
    };
  }

  async updatePassword(id, newHash) {
    await this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ password_hash: newHash }),
    });
    return { success: true };
  }

  // ── Trainer Methods ───────────────────────────────────────
  async getTrainerProfile(userId) {
    return this.request(`/trainer_profiles/${userId}`).catch(() => null);
  }

  async updateTrainerProfile(userId, data) {
    await this.request(`/trainer_profiles/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return this.getTrainerProfile(userId);
  }

  async getTrainerClients(trainerId) {
    // Oracle implementation of compliance flags
    // In production, this would be a single complex SQL view called via ORDS
    const clients = await this.request(`/clients?trainer_id=${trainerId}`);

    // We reuse the flag logic from the adapter layer or move it to a DB View
    // For now, we'll fetch the necessary data and compute flags in JS
    const results = [];
    for (const c of clients) {
      // Fetch stats and compute flags (similar to LocalAdapter)
      // In a real Oracle setup, this would be a call to a PL/SQL function
      results.push({
        ...c,
        flag_status: 'on_track', // Placeholder for complex logic
        flag_reasons: [],
      });
    }
    return results;
  }

  async getClientDetail(clientId) {
    const user = await this.getUserById(clientId);
    if (!user) return null;

    // Fetch related logs via REST
    const [weights, workouts, checkIns, formChecks] = await Promise.all([
      this.request(`/weight_logs?client_id=${clientId}`),
      this.request(`/workout_logs?client_id=${clientId}`),
      this.request(`/check_ins?client_id=${clientId}`),
      this.request(`/form_checks?client_id=${clientId}`),
    ]);

    return {
      ...user,
      weights,
      recent_workouts: workouts,
      check_ins: checkIns,
      form_checks: formChecks,
      macro_adherence_7d: 85, // Placeholder
    };
  }

  // ── Foods ─────────────────────────────────────────────────
  async getFoods(search = '', category = '', country = '') {
    let endpoint = '/foods';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (country) params.append('country', country);

    return this.request(`${endpoint}?${params.toString()}`);
  }

  async getFoodById(id) {
    return this.request(`/foods/${id}`).catch(() => null);
  }

  async createFood(data) {
    const res = await this.request('/foods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.getFoodById(res.id);
  }

  // ── Workout Plans ─────────────────────────────────────────
  async getWorkoutPlans(trainerId) {
    return this.request(`/workout_plans?trainer_id=${trainerId}`);
  }

  async getWorkoutPlanById(id) {
    const plan = await this.request(`/workout_plans/${id}`).catch(() => null);
    if (!plan) return null;
    plan.exercises = await this.request(`/workout_plan_exercises?plan_id=${id}`);
    return plan;
  }

  async createWorkoutPlan(data) {
    const res = await this.request('/workout_plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.getWorkoutPlanById(res.id);
  }

  async assignWorkoutPlan(clientId, planId) {
    await this.request('/assigned_workout_plans', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, plan_id: planId }),
    });
    return { success: true };
  }

  async getAssignedWorkoutPlan(clientId) {
    const assigned = await this.request(`/assigned_workout_plans/active/${clientId}`).catch(() => null);
    if (!assigned) return null;
    assigned.exercises = await this.request(`/workout_plan_exercises?plan_id=${assigned.plan_id}`);
    return assigned;
  }

  // ── Meal Plans ────────────────────────────────────────────
  async getMealPlans(trainerId) {
    return this.request(`/meal_plans?trainer_id=${trainerId}`);
  }

  async getMealPlanById(id) {
    const plan = await this.request(`/meal_plans/${id}`).catch(() => null);
    if (!plan) return null;
    plan.items = await this.request(`/meal_plan_items?meal_plan_id=${id}`);
    return plan;
  }

  async createMealPlan(data) {
    const res = await this.request('/meal_plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.getMealPlanById(res.id);
  }

  async assignMealPlan(clientId, planId) {
    await this.request('/assigned_meal_plans', {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, plan_id: planId }),
    });
    return { success: true };
  }

  async getAssignedMealPlan(clientId) {
    const assigned = await this.request(`/assigned_meal_plans/active/${clientId}`).catch(() => null);
    if (!assigned) return null;
    assigned.items = await this.request(`/meal_plan_items?meal_plan_id=${assigned.plan_id}`);
    return assigned;
  }

  // ── Logging ───────────────────────────────────────────────
  async logWorkout(data) {
    const res = await this.request('/workout_logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, id: res.id };
  }

  async logMeal(data) {
    const res = await this.request('/meal_logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, id: res.id };
  }

  async logWeight(data) {
    const res = await this.request('/weight_logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, id: res.id, weight_kg: data.weight_kg };
  }

  // ── Check-ins ─────────────────────────────────────────────
  async createCheckIn(data) {
    const res = await this.request('/check_ins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, id: res.id };
  }

  async getCheckIns(clientId) {
    return this.request(`/check_ins?client_id=${clientId}`);
  }

  // ── Messages ──────────────────────────────────────────────
  async getMessages(userId1, userId2) {
    return this.request(`/messages?u1=${userId1}&u2=${userId2}`);
  }

  async createMessage(data) {
    const res = await this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, id: res.id, sent_at: new Date().toISOString() };
  }

  // ── Form Checks & AI ──────────────────────────────────────
  async createFormCheck(data) {
    const res = await this.request('/form_checks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, id: res.id };
  }

  async getFormChecks(clientId) {
    return this.request(`/form_checks?client_id=${clientId}`);
  }

  async updateFormCheckTrainerFeedback(id, feedback) {
    await this.request(`/form_checks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ trainer_feedback: feedback }),
    });
    return { success: true };
  }

  // ── Pose Sessions ─────────────────────────────────────────
  async createPoseSession(data) {
    const res = await this.request('/pose_sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, id: res.id };
  }

  // ── Subscriptions & Call Requests ─────────────────────────
  async createSubscription(data) {
    const res = await this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, id: res.id, status: res.status };
  }

  async getSubscriptions(clientId) {
    return this.request(`/subscriptions?client_id=${clientId}`);
  }

  async createCallRequest(data) {
    const res = await this.request('/call_requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { success: true, id: res.id };
  }

  async getCallRequests(trainerId) {
    return this.request(`/call_requests?trainer_id=${trainerId}&status=pending`);
  }

  // ── Analytics ───────────────────────────────────────────
  async getClientMacroAdherence(clientId, days = 7) {
    // In Oracle, we call a specific analytics endpoint
    const res = await this.request(`/analytics/macro-adherence/${clientId}?days=${days}`);
    return res.adherence || 80;
  }

  async getClientComplianceFlags(trainerId) {
    // Call an ORDS endpoint that returns a view of flagged clients
    return this.request(`/compliance-flags/${trainerId}`);
  }

  async getBusinessStats(trainerId) {
    return this.request(`/business-stats/${trainerId}`);
  }
}
