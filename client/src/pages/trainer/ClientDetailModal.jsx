// client/src/pages/trainer/ClientDetailModal.jsx
// Full client dossier: weights, adherence, check-ins, AI form checks, and plans

import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../../api/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ClientDetailModal({ clientId, isOpen, onClose, onNudgeWhatsApp }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, form_checks, check_ins
  const [trainerFeedback, setTrainerFeedback] = useState({});

  useEffect(() => {
    if (!isOpen || !clientId) return;
    setLoading(true);
    apiGet(`/trainer/clients/${clientId}`)
      .then((data) => {
        setClient(data.client);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  const handleSaveFeedback = async (formCheckId) => {
    const text = trainerFeedback[formCheckId];
    if (!text) return;
    try {
      await apiPut(`/form-checks/${formCheckId}/feedback`, { feedback: text });
      alert('Trainer feedback saved!');
    } catch (err) {
      alert('Failed to save feedback: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-lg border border-primary/30">
              {client?.name ? client.name[0] : 'C'}
            </div>
            <div>
              <div className="text-lg font-bold flex items-center gap-2">
                <span>{client?.name || 'Loading Client…'}</span>
                {client?.flag_status && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      client.flag_status === 'on_track'
                        ? 'bg-green-500/20 text-green-400'
                        : client.flag_status === 'needs_attention'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {client.flag_status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-3">
                <span>Goal: <strong className="text-white capitalize">{client?.client_profile?.goal_type?.replace('_', ' ')}</strong></span>
                <span>Region: <strong className="text-white">{client?.region || 'Kampala'}</strong></span>
                <span>Phone: <strong className="text-white font-mono">{client?.phone}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNudgeWhatsApp && onNudgeWhatsApp(client)}
              className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
              title="Open WhatsApp chat with prefilled nudge"
            >
              <span>💬 Nudge</span>
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white text-lg">
              ✕
            </button>
          </div>
        </div>

        {/* Subtabs strip */}
        <div className="bg-surface px-6 pt-3 border-b border-gray-200 flex gap-4">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeSubTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-dark'
            }`}
          >
            Overview &amp; Weight Trend
          </button>
          <button
            onClick={() => setActiveSubTab('form_checks')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeSubTab === 'form_checks' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-dark'
            }`}
          >
            AI Form Checks ({client?.form_checks?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('check_ins')}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeSubTab === 'check_ins' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-dark'
            }`}
          >
            Weekly Check-ins ({client?.check_ins?.length || 0})
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && <div className="text-center py-10 text-gray-400">Loading client dossier…</div>}
          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs">{error}</div>}

          {!loading && client && (
            <>
              {activeSubTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick stats cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-surface rounded-xl">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">Current Weight</div>
                      <div className="text-lg font-black text-dark">{client.client_profile?.current_weight_kg} kg</div>
                      <div className="text-[10px] text-gray-400">Target: {client.client_profile?.target_weight_kg} kg</div>
                    </div>

                    <div className="p-3 bg-surface rounded-xl">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">7-Day Macro Adherence</div>
                      <div className="text-lg font-black text-primary">{client.macro_adherence_7d}%</div>
                      <div className="text-[10px] text-gray-400">Target: ≥70%</div>
                    </div>

                    <div className="p-3 bg-surface rounded-xl">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">Daily Calorie Target</div>
                      <div className="text-lg font-black text-dark">{client.client_profile?.target_calories} kcal</div>
                      <div className="text-[10px] text-gray-400">{client.client_profile?.target_protein_g}g Protein</div>
                    </div>

                    <div className="p-3 bg-surface rounded-xl">
                      <div className="text-[10px] text-gray-500 uppercase font-bold">Completed Workouts</div>
                      <div className="text-lg font-black text-dark">{client.recent_workouts?.length || 0} logged</div>
                      <div className="text-[10px] text-gray-400">Past 30 days</div>
                    </div>
                  </div>

                  {/* Weight Progress Chart */}
                  <div className="bg-surface p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
                      4-Week Weight Trend (kg)
                    </h4>
                    {client.weights && client.weights.length > 0 ? (
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={client.weights}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                              dataKey="logged_at"
                              tickFormatter={(str) => str.slice(5, 10)}
                              fontSize={11}
                              stroke="#9CA3AF"
                            />
                            <YAxis domain={['dataMin - 1', 'dataMax + 1']} fontSize={11} stroke="#9CA3AF" />
                            <Tooltip
                              formatter={(value) => [`${value} kg`, 'Weight']}
                              labelFormatter={(label) => `Date: ${label.slice(0, 10)}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="weight_kg"
                              stroke="#FF6A00"
                              strokeWidth={3}
                              dot={{ fill: '#FF6A00', r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 py-6 text-center">No weigh-ins recorded yet.</p>
                    )}
                  </div>

                  {/* Assigned Plans */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface rounded-2xl border border-gray-100">
                      <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Assigned Workout Plan</div>
                      <div className="font-bold text-sm text-dark">{client.assigned_workout?.name || 'Default Home Calisthenics'}</div>
                      <div className="text-xs text-gray-500 mt-1">{client.assigned_workout?.exercises?.length || 4} exercises • 4 days/week</div>
                    </div>

                    <div className="p-4 bg-surface rounded-2xl border border-gray-100">
                      <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Assigned Meal Plan</div>
                      <div className="font-bold text-sm text-dark">{client.assigned_meal?.name || 'Ugandan Clean Protein & Staples'}</div>
                      <div className="text-xs text-gray-500 mt-1">Matooke, Tilapia, Beans, Dodo • Balanced Macros</div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'form_checks' && (
                <div className="space-y-4">
                  {client.form_checks && client.form_checks.length > 0 ? (
                    client.form_checks.map((fc) => {
                      let parsedAi = {};
                      try {
                        parsedAi = typeof fc.ai_feedback_json === 'string' ? JSON.parse(fc.ai_feedback_json) : fc.ai_feedback_json || {};
                      } catch (e) {
                        parsedAi = {};
                      }

                      return (
                        <div key={fc.id} className="p-5 bg-surface rounded-2xl border border-gray-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-sm text-dark">{fc.exercise_name}</span>
                              <span className="text-[10px] text-gray-400 ml-2">{fc.created_at?.slice(0, 10)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-500 font-medium">AI Score:</span>
                              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold text-xs">
                                {fc.ai_score || parsedAi.overall_score || 8.0} / 10
                              </span>
                            </div>
                          </div>

                          {/* Structured feedback cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-green-900">
                              <div className="font-bold text-[11px] mb-1">✓ What Looked Good:</div>
                              <ul className="list-disc list-inside space-y-0.5">
                                {parsedAi.what_looks_good?.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-900">
                              <div className="font-bold text-[11px] mb-1">⚠ Corrections Needed:</div>
                              <ul className="list-disc list-inside space-y-0.5">
                                {parsedAi.fix_these?.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {parsedAi.suggested_cue && (
                            <div className="text-xs p-2.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-100">
                              <strong>Suggested Coaching Cue:</strong> "{parsedAi.suggested_cue}"
                            </div>
                          )}

                          {/* Trainer's comment */}
                          <div className="pt-2 border-t border-gray-200">
                            <div className="text-[10px] font-bold uppercase text-gray-500 mb-1">
                              Coach Brian's Feedback:
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                defaultValue={fc.trainer_feedback || ''}
                                onChange={(e) =>
                                  setTrainerFeedback({ ...trainerFeedback, [fc.id]: e.target.value })
                                }
                                placeholder="Add your coaching comment for Grace…"
                                className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveFeedback(fc.id)}
                                className="px-3 py-1.5 rounded-xl bg-dark text-white font-bold text-xs hover:bg-gray-800 transition"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-400 py-8 text-center">No form check submissions yet.</p>
                  )}
                </div>
              )}

              {activeSubTab === 'check_ins' && (
                <div className="space-y-3">
                  {client.check_ins && client.check_ins.length > 0 ? (
                    client.check_ins.map((ci) => (
                      <div key={ci.id} className="p-4 bg-surface rounded-2xl border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-dark">{ci.submitted_at?.slice(0, 10)}</span>
                          <span className="text-gray-500">Sleep: <strong>{ci.sleep_hours} hrs</strong> • Energy: <strong>{ci.energy_level}/5</strong></span>
                        </div>
                        <p className="text-xs text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100">
                          "{ci.notes}"
                        </p>
                        {ci.trainer_feedback && (
                          <div className="text-[11px] text-primary bg-orange-50 p-2 rounded-lg border border-orange-100">
                            <strong>Your feedback:</strong> {ci.trainer_feedback}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 py-8 text-center">No weekly check-ins found.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
