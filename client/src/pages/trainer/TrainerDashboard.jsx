// client/src/pages/trainer/TrainerDashboard.jsx
// Trainer SaaS Dashboard: Clients & Flags, Plan Builders, Food Manager, Business Scaling ROI, Payments

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../api/client';
import { formatUGX, formatNumber } from '../../utils/currency';
import ClientDetailModal from './ClientDetailModal';
import WhatsAppNudgeModal from '../../components/WhatsAppNudgeModal';

export default function TrainerDashboard({ activeTab = 'clients', country = 'UG' }) {
  const [clients, setClients] = useState([]);
  const [summary, setSummary] = useState({});
  const [foods, setFoods] = useState([]);
  const [businessStats, setBusinessStats] = useState(null);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [trainerApplications, setTrainerApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, flagged, on_track
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [nudgeClient, setNudgeClient] = useState(null);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);

  // New Workout Plan State
  const [newPlanName, setNewPlanName] = useState('Kampala Desk-Worker Home Circuit');
  const [newPlanExercises, setNewPlanExercises] = useState([
    { exercise_name: 'Bodyweight Squats', muscle_group: 'Legs', target_sets: 4, target_reps: 15, rest_seconds: 60, is_home_friendly: 1 },
    { exercise_name: 'Push-ups', muscle_group: 'Chest & Core', target_sets: 3, target_reps: 12, rest_seconds: 60, is_home_friendly: 1 },
    { exercise_name: 'Plank Hold', muscle_group: 'Core', target_sets: 3, target_reps: 45, rest_seconds: 45, is_home_friendly: 1 },
  ]);

  // New Meal Plan State
  const [newMealPlanName, setNewMealPlanName] = useState('Kampala Lean Protein & Matooke');
  const [selectedMealItems, setSelectedMealItems] = useState([
    { food_id: 'food_matooke', food_name: 'Steamed Matooke', portion_g: 200, meal_slot: 'lunch' },
    { food_id: 'food_tilapia_boiled', food_name: 'Fresh Tilapia (Boiled)', portion_g: 180, meal_slot: 'lunch' },
    { food_id: 'food_sukuma', food_name: 'Sukuma Wiki', portion_g: 100, meal_slot: 'lunch' },
    { food_id: 'food_gnut_raw', food_name: 'Roasted Groundnuts', portion_g: 35, meal_slot: 'snack' },
  ]);

  // Scaling slider
  const [simulatedClients, setSimulatedClients] = useState(60);

  // Custom Food Form
  const [newFood, setNewFood] = useState({
    name: '',
    local_name: '',
    category: 'carbohydrates',
    calories: 150,
    protein_g: 5,
    carbs_g: 30,
    fat_g: 1,
    typical_serving_g: 150,
    serving_unit: 'g',
    portion_descriptor: '1 medium bowl (~150g)',
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      apiGet('/trainer/clients'),
      apiGet(`/foods?country=${country}`),
      apiGet('/trainer/business-stats'),
      apiGet('/subscriptions/pending'),
      apiGet('/admin/trainer-applications'),
    ])
      .then(([clientsRes, foodsRes, statsRes, paymentsRes, appsRes]) => {
        setClients(clientsRes.clients || []);
        setSummary(clientsRes.summary || {});
        setFoods(foodsRes.foods || []);
        setBusinessStats(statsRes.stats || null);
        setPaymentRequests(paymentsRes.requests || []);
        setTrainerApplications(appsRes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Trainer dashboard fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [country]);

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search);
    if (!matchesSearch) return false;
    if (filter === 'flagged') return c.flag_status !== 'on_track';
    if (filter === 'on_track') return c.flag_status === 'on_track';
    return true;
  });

  // Calculate live macros for meal plan builder
  const mealPlanTotals = selectedMealItems.reduce(
    (acc, item) => {
      const food = foods.find((f) => f.id === item.food_id);
      if (!food) return acc;
      const ratio = item.portion_g / 100;
      acc.calories += Math.round(food.calories * ratio);
      acc.protein += parseFloat((food.protein_g * ratio).toFixed(1));
      acc.carbs += parseFloat((food.carbs_g * ratio).toFixed(1));
      acc.fat += parseFloat((food.fat_g * ratio).toFixed(1));
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleCreateCustomFood = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/foods', { ...newFood, country_code: country });
      alert(`Food "${newFood.name}" added to database!`);
      setIsAddFoodOpen(false);
      loadData();
    } catch (err) {
      alert('Failed to add food: ' + err.message);
    }
  };

  const handleAssignMealPlan = async (clientId) => {
    try {
      const planRes = await apiPost('/plans/meals', {
        name: newMealPlanName,
        items: selectedMealItems,
      });
      await apiPost('/plans/meals/assign', {
        client_id: clientId,
        plan_id: planRes.plan.id,
      });
      alert(`Meal plan assigned successfully!`);
    } catch (err) {
      alert('Error assigning plan: ' + err.message);
    }
  };

  const handleAssignWorkoutPlan = async (clientId) => {
    try {
      const planRes = await apiPost('/plans/workouts', {
        name: newPlanName,
        exercises: newPlanExercises,
      });
      await apiPost('/plans/workouts/assign', {
        client_id: clientId,
        plan_id: planRes.plan.id,
      });
      alert(`Workout plan assigned successfully!`);
    } catch (err) {
      alert('Error assigning workout plan: ' + err.message);
    }
  };

  const handleConfirmPayment = async (requestId) => {
    try {
      await apiPost('/subscriptions/confirm', { requestId });
      alert('Payment confirmed. Client subscription active!');
      loadData();
    } catch (err) {
      alert('Error confirming payment: ' + err.message);
    }
  };

  const handleApproveTrainer = async (appId) => {
    try {
      const res = await apiPost(`/admin/approve-trainer/${appId}`, {});
      alert(res.message || 'Trainer approved successfully!');
      loadData();
    } catch (err) {
      alert('Error approving trainer: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* ── TAB 1: CLIENTS & FLAGS ─────────────────────────────────────── */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          {/* Header & Flag Metric Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Client Compliance Queue</h2>
              <p className="text-xs text-gray-500">
                Automated flags identify clients needing accountability check-ins
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filter === 'all' ? 'bg-dark text-white' : 'bg-surface text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({summary.total || 0})
              </button>
              <button
                onClick={() => setFilter('flagged')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  filter === 'flagged' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <span>⚠️ Flagged Queue</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {(summary.non_compliant || 0) + (summary.needs_attention || 0)}
                </span>
              </button>
              <button
                onClick={() => setFilter('on_track')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filter === 'on_track' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                On Track ({summary.on_track || 0})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients by name or phone…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-surface text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Client Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const isFlagged = client.flag_status !== 'on_track';
              const isNonCompliant = client.flag_status === 'non_compliant';

              return (
                <div
                  key={client.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isNonCompliant
                      ? 'border-red-200 bg-red-50/30'
                      : isFlagged
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
                          {client.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-dark">{client.name}</div>
                          <div className="text-[11px] text-gray-400 capitalize">
                            {client.goal_type?.replace('_', ' ')} • {client.region || 'Kampala'}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isNonCompliant
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : isFlagged
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}
                      >
                        {client.flag_status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Flag Reasons or Compliance Chips */}
                    {client.flag_reasons && client.flag_reasons.length > 0 ? (
                      <div className="mb-3 space-y-1">
                        {client.flag_reasons.map((reason, i) => (
                          <div
                            key={i}
                            className="text-[11px] text-red-700 bg-red-100/70 px-2 py-1 rounded-md flex items-center gap-1.5 font-medium"
                          >
                            <span>⚠️</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mb-3 text-[11px] text-green-700 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1.5 font-medium">
                        <span>✓</span>
                        <span>All metrics on track (workouts, meals, weight)</span>
                      </div>
                    )}

                    {/* Metrics snapshot */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 text-center mb-3">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase">Weight</div>
                        <div className="text-xs font-bold text-dark">{client.current_weight_kg} kg</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase">7d Macro</div>
                        <div className="text-xs font-bold text-primary">{client.macro_adherence_7d}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase">Last Log</div>
                        <div className="text-xs font-bold text-dark">
                          {client.last_workout_at ? client.last_workout_at.slice(5, 10) : 'None'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSelectedClientId(client.id)}
                      className="flex-1 py-2 rounded-xl bg-dark text-white text-xs font-bold hover:bg-gray-800 transition active:scale-[0.98]"
                    >
                      View Dossier
                    </button>

                    {isFlagged && (
                      <button
                        onClick={() => setNudgeClient(client)}
                        className="px-3 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] shadow-sm transition flex items-center gap-1 active:scale-[0.98]"
                        title="Nudge via WhatsApp"
                      >
                        <span>💬</span>
                        <span className="hidden sm:inline">Nudge</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: WORKOUT PLAN BUILDER ───────────────────────────────── */}
      {activeTab === 'workout-builder' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Workout Plan Builder</h2>
              <p className="text-xs text-gray-500">
                Design home/no-equipment routines and assign to remote Kampala clients
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Configuration */}
            <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Routine Name
                </label>
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-gray-600">Exercise Circuit</span>
                  <button
                    onClick={() =>
                      setNewPlanExercises([
                        ...newPlanExercises,
                        { exercise_name: 'Walking Lunges', muscle_group: 'Legs', target_sets: 3, target_reps: 12, rest_seconds: 60, is_home_friendly: 1 },
                      ])
                    }
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + Add Exercise
                  </button>
                </div>

                <div className="space-y-2">
                  {newPlanExercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-surface rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 font-bold text-dark">{ex.exercise_name}</div>
                      <div className="text-gray-500">{ex.muscle_group}</div>
                      <div className="font-mono bg-white px-2 py-1 rounded border border-gray-200">
                        {ex.target_sets} sets × {ex.target_reps} reps
                      </div>
                      <div className="text-gray-400">{ex.rest_seconds}s rest</div>
                      <button
                        onClick={() => setNewPlanExercises(newPlanExercises.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Client Assignment Card */}
            <div className="bg-surface p-6 rounded-2xl border border-gray-100 space-y-4">
              <h3 className="font-bold text-sm text-dark">Assign to Client</h3>
              <p className="text-xs text-gray-500">
                Pushes this workout plan immediately to the client's PWA Today schedule.
              </p>

              <div className="space-y-2">
                {clients.map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-dark">{c.name}</span>
                    <button
                      onClick={() => handleAssignWorkoutPlan(c.id)}
                      className="px-3 py-1 rounded-lg bg-primary text-white font-bold text-[11px] hover:bg-orange-600 transition"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: MEAL PLAN BUILDER (LOCAL FOODS) ─────────────────────── */}
      {activeTab === 'meal-builder' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Local Meal Plan Builder</h2>
              <p className="text-xs text-gray-500">
                Pick Ugandan staples and see live macro totals update in real-time
              </p>
            </div>
          </div>

          {/* Live Macro Bar */}
          <div className="bg-dark text-white p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-primary">
                Live Macro Balance: {newMealPlanName}
              </span>
              <span className="text-xs font-mono text-gray-400">Target Benchmark: ~2,100 kcal</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-white/10 p-3 rounded-xl">
                <div className="text-[10px] text-gray-400 uppercase font-bold">Calories</div>
                <div className="text-xl font-black text-white">{mealPlanTotals.calories} kcal</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <div className="text-[10px] text-blue-300 uppercase font-bold">Protein</div>
                <div className="text-xl font-black text-blue-400">{Math.round(mealPlanTotals.protein)}g</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <div className="text-[10px] text-amber-300 uppercase font-bold">Carbs (Staples)</div>
                <div className="text-xl font-black text-amber-400">{Math.round(mealPlanTotals.carbs)}g</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <div className="text-[10px] text-emerald-300 uppercase font-bold">Fats</div>
                <div className="text-xl font-black text-emerald-400">{Math.round(mealPlanTotals.fat)}g</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Meal Plan Foods List */}
            <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-dark">Selected Foods &amp; Local Portions</h3>
                <span className="text-xs text-gray-500">{selectedMealItems.length} items</span>
              </div>

              <div className="space-y-2">
                {selectedMealItems.map((item, idx) => {
                  const food = foods.find((f) => f.id === item.food_id);
                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-surface rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-dark">{item.food_name || food?.name}</div>
                        <div className="text-[11px] text-gray-500">
                          {food?.local_name} • <span className="text-primary font-medium">{food?.portion_descriptor}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.portion_g}
                          onChange={(e) => {
                            const updated = [...selectedMealItems];
                            updated[idx].portion_g = Number(e.target.value);
                            setSelectedMealItems(updated);
                          }}
                          className="w-20 px-2 py-1 rounded-lg border border-gray-300 text-right font-mono font-bold"
                        />
                        <span className="text-gray-500">g</span>
                        <button
                          onClick={() => setSelectedMealItems(selectedMealItems.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add from database dropdown */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Add local food to plan:
                </label>
                <select
                  onChange={(e) => {
                    const food = foods.find((f) => f.id === e.target.value);
                    if (food) {
                      setSelectedMealItems([
                        ...selectedMealItems,
                        {
                          food_id: food.id,
                          food_name: food.name,
                          portion_g: food.typical_serving_g || 150,
                          meal_slot: 'lunch',
                        },
                      ]);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  defaultValue=""
                >
                  <option value="" disabled>Choose a Ugandan food item to add…</option>
                  {foods.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.local_name || f.category}) — {f.portion_descriptor || `${f.calories} kcal/100g`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assign Meal Plan Card */}
            <div className="bg-surface p-6 rounded-2xl border border-gray-100 space-y-4">
              <h3 className="font-bold text-sm text-dark">Assign to Client</h3>
              <p className="text-xs text-gray-500">
                Sends these balanced meals to the client's Today tab with portion guides.
              </p>

              <div className="space-y-2">
                {clients.map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-dark">{c.name}</div>
                      <div className="text-[10px] text-gray-400">Target: {c.target_calories} kcal</div>
                    </div>
                    <button
                      onClick={() => handleAssignMealPlan(c.id)}
                      className="px-3 py-1 rounded-lg bg-primary text-white font-bold text-[11px] hover:bg-orange-600 transition"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: FOOD DATABASE MANAGER ─────────────────────────────── */}
      {activeTab === 'foods' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Local Food Database</h2>
              <p className="text-xs text-gray-500">
                Nutritional profiles per 100g calibrated for Ugandan &amp; East African staples
              </p>
            </div>

            <button
              onClick={() => setIsAddFoodOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow hover:bg-orange-600 transition"
            >
              + Add Custom Food
            </button>
          </div>

          {/* Foods Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Food Name</th>
                    <th className="p-3.5">Local Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Calories</th>
                    <th className="p-3.5 text-right">Protein</th>
                    <th className="p-3.5 text-right">Carbs</th>
                    <th className="p-3.5 text-right">Fat</th>
                    <th className="p-3.5">Visual Everyday Portion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {foods.map((food) => (
                    <tr key={food.id} className="hover:bg-gray-50">
                      <td className="p-3.5 font-bold text-dark flex items-center gap-1.5">
                        <span>{food.name}</span>
                        {food.is_custom === 1 && (
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-bold">
                            CUSTOM
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-gray-500 italic">{food.local_name || '—'}</td>
                      <td className="p-3.5 capitalize text-gray-600">{food.category?.replace('_', ' ')}</td>
                      <td className="p-3.5 text-right font-mono font-bold">{Math.round(food.calories)}</td>
                      <td className="p-3.5 text-right font-mono text-blue-600">{food.protein_g}g</td>
                      <td className="p-3.5 text-right font-mono text-amber-600">{food.carbs_g}g</td>
                      <td className="p-3.5 text-right font-mono text-emerald-600">{food.fat_g}g</td>
                      <td className="p-3.5 text-primary font-medium text-[11px]">
                        {food.portion_descriptor || `${food.typical_serving_g}g`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mandatory UI assumption disclaimer footer */}
            <div className="p-3.5 bg-surface text-center border-t border-gray-200 text-xs text-gray-500 italic">
              * Approximate reference values from East African food composition tables. To be validated by a certified nutritionist.
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: PAYMENT REQUESTS ─────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Payment Confirmations</h2>
              <p className="text-xs text-gray-500">
                Manual verification of MoMo / Bank transfers for client subscriptions
              </p>
            </div>
          </div>

          {paymentRequests.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-dashed border-gray-300 text-center space-y-3">
              <div className="text-4xl">✅</div>
              <h3 className="font-bold text-dark">No Pending Requests</h3>
              <p className="text-xs text-gray-500">All client payments are currently verified and up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentRequests.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                      {req.client_name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-dark">{req.client_name}</div>
                      <div className="text-[11px] text-gray-500">
                        Amount: <span className="font-bold text-dark">{formatUGX(req.amount)}</span> • {req.payment_method}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">Requested: {new Date(req.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConfirmPayment(req.id)}
                    className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition active:scale-95"
                  >
                    Confirm
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 7: ADMIN PANEL (TRAINER VETTING) ───────────────────────── */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Trainer Vetting Panel</h2>
              <p className="text-xs text-gray-500">
                Review and approve credentials for prospective coaches joining the platform
              </p>
            </div>
          </div>

          {trainerApplications.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-dashed border-gray-300 text-center space-y-3">
              <div className="text-4xl">📑</div>
              <h3 className="font-bold text-dark">No Pending Applications</h3>
              <p className="text-xs text-gray-500">All trainer applications have been processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainerApplications.map((app) => (
                <div key={app.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                        {app.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-dark">{app.name}</div>
                        <div className="text-[11px] text-gray-500">{app.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 uppercase">
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 bg-surface rounded-xl text-xs">
                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Certifications</div>
                      <div className="text-dark">{app.certifications || 'None provided'}</div>
                    </div>
                    <div className="p-3 bg-surface rounded-xl text-xs">
                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Experience</div>
                      <div className="text-dark">{app.experience || 'Not specified'}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-gray-400">
                      Phone: {app.phone || 'N/A'}
                    </div>
                    <button
                      onClick={() => handleApproveTrainer(app.id)}
                      className="px-4 py-2 rounded-xl bg-dark text-white font-bold text-xs hover:bg-gray-800 transition active:scale-95"
                    >
                      Approve & Create Account
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'business' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-dark tracking-tight">Trainer Business Model &amp; Scaling Story</h2>
            <p className="text-xs text-gray-500">
              How moving from in-person gym training to FlexiFit remote coaching triples monthly revenue
            </p>
          </div>

          {/* Current MRR Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-xs font-bold text-gray-500 uppercase">Active FlexiFit Clients</div>
              <div className="text-3xl font-black text-dark mt-1">{clients.length}</div>
              <div className="text-xs text-green-600 font-medium mt-1">Seeded demo accounts</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-xs font-bold text-gray-500 uppercase">Current Monthly Rate</div>
              <div className="text-3xl font-black text-primary mt-1">
                {formatUGX(businessStats?.monthly_rate_ugx || 90000)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Per remote client / month</div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-xs font-bold text-gray-500 uppercase">Current MRR</div>
              <div className="text-3xl font-black text-dark mt-1">
                {formatUGX(clients.length * (businessStats?.monthly_rate_ugx || 90000))}
              </div>
              <div className="text-xs text-gray-400 mt-1">Monthly Recurring Revenue</div>
            </div>
          </div>

          {/* In-Person vs Remote Scaling Comparison */}
          <div className="bg-gradient-to-br from-dark to-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>🚀 The 8 to 60+ Client Scaling Transformation</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Old In-Person Model */}
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                <div className="text-xs uppercase font-mono text-gray-400">Old Model (Physical Gym)</div>
                <div className="text-2xl font-bold text-red-400">8 Clients Cap</div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Trainers are limited by gym floor hours, Kampala traffic jams, and exhausting 1-on-1 sessions.
                </p>
                <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average fee:</span>
                    <span>UGX 300,000 / mo</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-white/10">
                    <span>Monthly Gross:</span>
                    <span>{formatUGX(2400000)}</span>
                  </div>
                </div>
              </div>

              {/* FlexiFit Remote Model */}
              <div className="p-5 bg-primary/10 rounded-2xl border border-primary/30 space-y-3">
                <div className="text-xs uppercase font-mono text-primary font-bold">FlexiFit Model (Asynchronous SaaS)</div>
                <div className="text-2xl font-bold text-primary">60+ Clients Scalable</div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Trainers triage compliance flags in 30 minutes a day, deliver weekly check-ins, and scale effortlessly.
                </p>
                <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Affordable client fee:</span>
                    <span className="text-primary font-bold">UGX 90,000 / mo</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-green-400 pt-1 border-t border-white/10">
                    <span>Projected Monthly Gross:</span>
                    <span>{formatUGX(5400000)} (2.3x higher!)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Scaling Simulator */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-300">Test Scaling Assumption:</span>
                <span className="font-mono text-primary font-bold text-sm">
                  {simulatedClients} Remote Clients = {formatUGX(simulatedClients * 90000)} / month
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={100}
                value={simulatedClients}
                onChange={(e) => setSimulatedClients(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>8 clients (UGX 720k)</span>
                <span>30 clients (UGX 2.7M)</span>
                <span>60 clients (UGX 5.4M)</span>
                <span>100 clients (UGX 9M)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Detail Dossier Modal */}
      <ClientDetailModal
        clientId={selectedClientId}
        isOpen={!!selectedClientId}
        onClose={() => setSelectedClientId(null)}
        onNudgeWhatsApp={(client) => {
          setSelectedClientId(null);
          setNudgeClient(client);
        }}
      />

      {/* WhatsApp Nudge Modal */}
      <WhatsAppNudgeModal
        client={nudgeClient}
        isOpen={!!nudgeClient}
        onClose={() => setNudgeClient(null)}
      />

      {/* Add Custom Food Modal */}
      {isAddFoodOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-dark">Add Custom Local Food</h3>
              <button onClick={() => setIsAddFoodOpen(false)} className="text-gray-400 hover:text-dark">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomFood} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-600 mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  placeholder="e.g. Boiled Yams"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">Local Luganda/Swahili Name</label>
                <input
                  type="text"
                  value={newFood.local_name}
                  onChange={(e) => setNewFood({ ...newFood, local_name: e.target.value })}
                  placeholder="e.g. Amayuni"
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-600 mb-1">Calories (per 100g)</label>
                  <input
                    type="number"
                    required
                    value={newFood.calories}
                    onChange={(e) => setNewFood({ ...newFood, calories: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-600 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newFood.protein_g}
                    onChange={(e) => setNewFood({ ...newFood, protein_g: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-600 mb-1">Visual Everyday Portion</label>
                <input
                  type="text"
                  value={newFood.portion_descriptor}
                  onChange={(e) => setNewFood({ ...newFood, portion_descriptor: e.target.value })}
                  placeholder="e.g. 2 medium slices (~150g)"
                  className="w-full p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow hover:bg-orange-600 transition"
              >
                Save Food to Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
