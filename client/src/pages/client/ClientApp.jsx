// client/src/pages/client/ClientApp.jsx
// Client Mobile PWA App: Today View, Meal & Workout Logging, Charts, Check-in, Chat, and Call Button

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../api/client';
import { formatUGX } from '../../utils/currency';
import MacroRing from '../../components/MacroRing';
import MomoModal from '../../components/MomoModal';
import LivePoseTracker from './LivePoseTracker';
import FormCheckUpload from './FormCheckUpload';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ClientApp({ activeTab = 'today', country = 'UG' }) {
  const [todayData, setTodayData] = useState(null);
  const [foods, setFoods] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Popups
  const [isMomoOpen, setIsMomoOpen] = useState(false);
  const [isLogWeightOpen, setIsLogWeightOpen] = useState(false);
  const [newWeight, setNewWeight] = useState(74.0);

  // Meal Logging State
  const [selectedFoodId, setSelectedFoodId] = useState('food_matooke');
  const [portionGrams, setPortionGrams] = useState(200);
  const [mealSlot, setMealSlot] = useState('lunch');

  // Check-in State
  const [checkInEnergy, setCheckInEnergy] = useState(4);
  const [checkInSleep, setCheckInSleep] = useState(7.5);
  const [checkInAdherence, setCheckInAdherence] = useState(4);
  const [checkInNotes, setCheckInNotes] = useState('');

  const loadClientData = () => {
    setLoading(true);
    Promise.all([
      apiGet('/client/today'),
      apiGet(`/foods?country=${country}`),
      apiGet('/client/progress'),
    ])
      .then(([todayRes, foodsRes, progRes]) => {
        setTodayData(todayRes);
        setFoods(foodsRes.foods || []);
        setProgressData(progRes);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Client data error:', err);
        setLoading(false);
      });
  };

  const loadMessages = () => {
    if (!todayData?.trainer?.id) return;
    apiGet(`/messages/${todayData.trainer.id}`)
      .then((res) => setMessages(res.messages || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadClientData();
  }, [country]);

  useEffect(() => {
    if (activeTab === 'messages' && todayData?.trainer?.id) {
      loadMessages();
    }
  }, [activeTab, todayData?.trainer?.id]);

  const handleLogMeal = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/client/logs/meal', {
        food_id: selectedFoodId,
        portion_g: Number(portionGrams),
        meal_slot: mealSlot,
      });
      alert('Meal logged successfully!');
      loadClientData();
    } catch (err) {
      alert('Failed to log meal: ' + err.message);
    }
  };

  const handleLogWorkout = async () => {
    try {
      await apiPost('/client/logs/workout', {
        workout_plan_id: todayData?.workoutPlan?.id,
        notes: 'Completed full scheduled home workout',
        rating: 5,
        sets: [
          { exercise_name: 'Bodyweight Squats', reps_completed: 15, weight_kg: 0 },
          { exercise_name: 'Push-ups', reps_completed: 12, weight_kg: 0 },
        ],
      });
      alert('Workout logged as completed! Streak extended!');
      loadClientData();
    } catch (err) {
      alert('Failed to log workout: ' + err.message);
    }
  };

  const handleLogWeightSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/client/logs/weight', { weight_kg: Number(newWeight) });
      setIsLogWeightOpen(false);
      alert('Weight recorded!');
      loadClientData();
    } catch (err) {
      alert('Failed to log weight: ' + err.message);
    }
  };

  const handleSubmitCheckIn = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/client/check-in', {
        energy_level: checkInEnergy,
        sleep_hours: checkInSleep,
        adherence_rating: checkInAdherence,
        notes: checkInNotes,
      });
      alert('Weekly check-in submitted to Coach Brian!');
      setCheckInNotes('');
      loadClientData();
    } catch (err) {
      alert('Failed to submit check-in: ' + err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await apiPost('/messages', {
        receiver_id: todayData?.trainer?.id,
        content: newMessage,
      });
      setNewMessage('');
      loadMessages();
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  const handleRequestCall = async () => {
    try {
      await apiPost('/client/call-request', {
        preferred_time: 'Next 30 mins',
        notes: 'Quick question about knee positioning during squats',
      });
      alert('Call request sent! Coach Brian Mukasa has been notified.');
    } catch (err) {
      alert('Failed to send call request: ' + err.message);
    }
  };

  // Find currently selected food to preview portion descriptor
  const activeSelectedFood = foods.find((f) => f.id === selectedFoodId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* ── TAB: TODAY ─────────────────────────────────────────────────── */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Greeting Banner */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-bold text-gray-400 font-mono">
                {new Date().toLocaleDateString('en-UG', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Today's Schedule</h2>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-primary border border-orange-200">
              <span className="text-base">🔥</span>
              <span className="text-xs font-black">{todayData?.streak || 5}-Day Streak</span>
            </div>
          </div>

          {/* Macro Progress Ring */}
          <MacroRing
            consumed={todayData?.consumed}
            targets={todayData?.targets}
          />

          {/* Today's Workout Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                  Today's Workout
                </span>
                <h3 className="text-base font-extrabold text-dark">
                  {todayData?.workoutPlan?.name || 'Kampala Executive Home Fitness'}
                </h3>
              </div>

              {todayData?.todayWorkoutCompleted ? (
                <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  ✓ Completed
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  Pending
                </span>
              )}
            </div>

            {/* Exercise preview list */}
            <div className="space-y-2">
              {(todayData?.workoutPlan?.exercises || [
                { exercise_name: 'Bodyweight Squats', target_sets: 4, target_reps: 15 },
                { exercise_name: 'Push-ups', target_sets: 3, target_reps: 12 },
                { exercise_name: 'Plank Hold', target_sets: 3, target_reps: 45 },
              ]).map((ex, i) => (
                <div key={i} className="p-3 bg-surface rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-200 font-bold text-[10px] flex items-center justify-center text-gray-700">
                      {i + 1}
                    </span>
                    <span className="font-bold text-dark">{ex.exercise_name}</span>
                  </div>
                  <span className="font-mono text-gray-500 font-semibold">
                    {ex.target_sets} sets × {ex.target_reps} {ex.exercise_name.includes('Plank') ? 'sec' : 'reps'}
                  </span>
                </div>
              ))}
            </div>

            {/* Workout Actions */}
            <div className="flex gap-2 pt-1">
              {!todayData?.todayWorkoutCompleted ? (
                <button
                  onClick={handleLogWorkout}
                  className="flex-1 py-3 rounded-2xl bg-primary hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-[0.98] transition tap-target"
                >
                  ✓ Mark Workout Completed
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 py-3 rounded-2xl bg-green-600 text-white font-bold text-xs opacity-90 cursor-default"
                >
                  Workout Completed for Today!
                </button>
              )}
            </div>
          </div>

          {/* "Call My Trainer" Action Card */}
          <div className="bg-gradient-to-r from-dark to-gray-900 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-lg">
                👔
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-mono">Assigned Trainer</div>
                <div className="text-sm font-bold">{todayData?.trainer?.name || 'Coach Brian Mukasa'}</div>
                <div className="text-[11px] text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Available on WhatsApp &amp; Meet
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleRequestCall}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition"
              >
                Request Call
              </button>
              <a
                href={todayData?.trainer?.call_link || 'https://meet.google.com/new'}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
              >
                <span>Call Coach</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: LOG MEAL ──────────────────────────────────────────────── */}
      {activeTab === 'log-meal' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-dark tracking-tight">Log Local Food Intake</h2>
            <p className="text-xs text-gray-500">
              Calibrated for Ugandan meals with everyday visual portion descriptors
            </p>
          </div>

          <form onSubmit={handleLogMeal} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            {/* Meal Slot */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Meal Slot</label>
              <div className="grid grid-cols-4 gap-2">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setMealSlot(slot)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                      mealSlot === slot ? 'bg-primary text-white shadow-sm' : 'bg-surface text-gray-600'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Selector */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Choose Local Food Item
              </label>
              <select
                value={selectedFoodId}
                onChange={(e) => {
                  setSelectedFoodId(e.target.value);
                  const f = foods.find((item) => item.id === e.target.value);
                  if (f?.typical_serving_g) setPortionGrams(f.typical_serving_g);
                }}
                className="w-full p-3 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {foods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name} {food.local_name ? `(${food.local_name})` : ''} — {food.calories} kcal/100g
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Portion Reference Callout */}
            {activeSelectedFood && (
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs text-gray-800 space-y-1">
                <div className="text-[10px] uppercase font-bold text-primary font-mono">
                  Everyday Portion Guide ({country === 'UG' ? 'Uganda' : country}):
                </div>
                <div className="font-bold text-sm text-dark">
                  👉 {activeSelectedFood.portion_descriptor || `${activeSelectedFood.typical_serving_g}g serving`}
                </div>
                <div className="text-[11px] text-gray-500">
                  Nutrition per 100g: {Math.round(activeSelectedFood.calories)} kcal • {activeSelectedFood.protein_g}g protein • {activeSelectedFood.carbs_g}g carbs • {activeSelectedFood.fat_g}g fat
                </div>
              </div>
            )}

            {/* Gram Portion Input */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Portion Size (Grams)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={1500}
                  step={10}
                  value={portionGrams}
                  onChange={(e) => setPortionGrams(e.target.value)}
                  className="flex-1 p-3 rounded-xl border border-gray-300 text-sm font-bold font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <span className="text-xs font-bold text-gray-500">grams</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-primary hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-[0.98] transition tap-target"
            >
              Log Meal Intake
            </button>
          </form>

          {/* Today's Logged Items */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-600">
              Meals Logged Today
            </h3>
            {todayData?.todayMeals && todayData.todayMeals.length > 0 ? (
              todayData.todayMeals.map((m) => (
                <div key={m.id} className="p-3 bg-surface rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-dark">{m.food_name || 'Logged Food'}</span>
                    <span className="text-gray-400 text-[10px] ml-2 capitalize">({m.meal_slot})</span>
                  </div>
                  <div className="font-mono text-right">
                    <span className="font-bold text-dark">{Math.round(m.calories)} kcal</span>
                    <span className="text-gray-400 text-[10px] ml-2">{m.protein_g}g P</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">No meals logged yet today.</p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: PROGRESS CHARTS ──────────────────────────────────────── */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-dark tracking-tight">Progress &amp; Trends</h2>
              <p className="text-xs text-gray-500">Weight tracking and weekly calorie adherence</p>
            </div>
            <button
              onClick={() => setIsLogWeightOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-orange-600 transition"
            >
              + Log Weigh-in
            </button>
          </div>

          {/* Weight Trend Line Chart */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Body Weight Trend (kg)
            </h3>
            {progressData?.weights && progressData.weights.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData.weights}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5, 10)} fontSize={11} stroke="#9CA3AF" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={11} stroke="#9CA3AF" />
                    <Tooltip formatter={(v) => [`${v} kg`, 'Weight']} />
                    <Line type="monotone" dataKey="weight" stroke="#FF6A00" strokeWidth={3} dot={{ fill: '#FF6A00', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No weight logs available.</p>
            )}
          </div>

          {/* Calorie Adherence Bar Chart */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Daily Calorie Intake vs Target
            </h3>
            {progressData?.macroTrend && progressData.macroTrend.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData.macroTrend.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5, 10)} fontSize={11} stroke="#9CA3AF" />
                    <YAxis fontSize={11} stroke="#9CA3AF" />
                    <Tooltip formatter={(v) => [`${v} kcal`, 'Calories']} />
                    <Bar dataKey="calories" fill="#FF6A00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No daily intake recorded.</p>
            )}
          </div>

          {/* Weekly Check-in Form */}
          <form onSubmit={handleSubmitCheckIn} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-dark">Submit Weekly Check-in</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Energy (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={checkInEnergy}
                  onChange={(e) => setCheckInEnergy(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Sleep (Hrs)</label>
                <input
                  type="number"
                  step={0.5}
                  value={checkInSleep}
                  onChange={(e) => setCheckInSleep(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Adherence (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={checkInAdherence}
                  onChange={(e) => setCheckInAdherence(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Notes for Coach</label>
              <textarea
                rows={3}
                value={checkInNotes}
                onChange={(e) => setCheckInNotes(e.target.value)}
                placeholder="How did workouts feel? Any soreness or meal planning challenges?"
                className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-dark text-white font-bold text-xs hover:bg-gray-800 transition active:scale-[0.98]"
            >
              Send Check-in to Trainer
            </button>
          </form>
        </div>
      )}

      {/* ── TAB: LIVE POSE TRACKER ────────────────────────────────────── */}
      {activeTab === 'pose' && (
        <LivePoseTracker onFinishSession={loadClientData} />
      )}

      {/* ── TAB: AI FORM CHECK ────────────────────────────────────────── */}
      {activeTab === 'form-check' && (
        <FormCheckUpload onCheckSubmitted={loadClientData} />
      )}

      {/* ── TAB: MESSAGES / CHAT ──────────────────────────────────────── */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
              👔
            </div>
            <div>
              <div className="font-bold text-sm text-dark">{todayData?.trainer?.name || 'Coach Brian Mukasa'}</div>
              <div className="text-[11px] text-gray-400">Personal Fitness &amp; Nutrition Coach</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm h-96 flex flex-col justify-between">
            <div className="overflow-y-auto space-y-3 p-2 flex-1">
              {messages.map((m) => {
                const isMe = m.sender_id === todayData?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-surface text-dark rounded-bl-none border border-gray-200'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 px-1">
                      {m.sent_at?.slice(11, 16)}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-gray-100">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message Coach Brian…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-orange-600 transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB: SUBSCRIPTION ─────────────────────────────────────────── */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-dark tracking-tight">Coaching Subscription</h2>
            <p className="text-xs text-gray-500">
              Pay monthly via MTN Mobile Money or Airtel Money (Simulation)
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary to-orange-600 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-mono text-orange-200">Current Plan</span>
                <h3 className="text-2xl font-black">FlexiFit Full Coaching</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-white text-primary text-xs font-black">
                {formatUGX(90000)} / mo
              </span>
            </div>

            <ul className="text-xs space-y-2 text-orange-100">
              <li className="flex items-center gap-2">✓ Unlimited weekly check-ins &amp; WhatsApp direct messaging</li>
              <li className="flex items-center gap-2">✓ Local Ugandan high-protein meal plans (Matooke, Tilapia, G-nuts)</li>
              <li className="flex items-center gap-2">✓ AI Video Form Checks analyzed by Claude Vision</li>
              <li className="flex items-center gap-2">✓ Live on-device pose tracking and squat rep counting</li>
            </ul>

            <button
              onClick={() => setIsMomoOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-white text-primary font-black text-xs shadow-lg hover:bg-gray-100 active:scale-[0.98] transition tap-target"
            >
              Simulate MTN / Airtel Payment (UGX 90,000)
            </button>
          </div>
        </div>
      )}

      {/* MoMo Simulation Modal */}
      <MomoModal
        isOpen={isMomoOpen}
        onClose={() => setIsMomoOpen(false)}
        initialAmount={90000}
      />

      {/* Log Weight Modal */}
      {isLogWeightOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-dark">Log Current Weight</h3>
            <form onSubmit={handleLogWeightSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Weight in kg</label>
                <input
                  type="number"
                  step={0.1}
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 text-lg font-bold font-mono text-center"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogWeightOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-orange-600"
                >
                  Save Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
