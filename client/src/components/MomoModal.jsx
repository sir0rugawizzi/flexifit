// client/src/components/MomoModal.jsx
// Authentic MTN Mobile Money & Airtel Money simulation with USSD dialog & SMS push notification

import { useState } from 'react';
import { apiPost } from '../api/client';
import { formatUGX } from '../utils/currency';

export default function MomoModal({ isOpen, onClose, onSuccess, initialAmount = 90000 }) {
  const [provider, setProvider] = useState('MTN_MOMO');
  const [phoneNumber, setPhoneNumber] = useState('+256772123456');
  const [step, setStep] = useState('input'); // 'input', 'ussd_pin', 'approved'
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [simData, setSimData] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return setError('Please enter a phone number.');
    setError(null);
    setLoading(true);

    try {
      const data = await apiPost('/subscriptions/simulate', {
        provider,
        phone_number: phoneNumber,
        amount_ugx: initialAmount,
      });
      setSimData(data);
      setStep('ussd_pin');
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePin = () => {
    if (pin.length < 4) {
      return setError('Please enter a 4-digit PIN for the simulation.');
    }
    setStep('approved');
    if (onSuccess) onSuccess(simData);
  };

  const isMTN = provider === 'MTN_MOMO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-primary">Flexi</span>
            <span className="text-xl font-extrabold text-white">Fit</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
              SIMULATION ONLY
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">
            ✕
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {step === 'input' && (
            <form onSubmit={handleInitiate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                  Select Mobile Money Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setProvider('MTN_MOMO');
                      setPhoneNumber('+256772123456');
                    }}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 transition text-left ${
                      isMTN
                        ? 'border-yellow-400 bg-yellow-50 text-gray-900 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-yellow-400 font-black text-black flex items-center justify-center text-xs">
                      MTN
                    </div>
                    <div>
                      <div className="font-bold text-xs">MTN MoMo</div>
                      <div className="text-[10px] text-gray-500">*165# Push</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProvider('AIRTEL_MONEY');
                      setPhoneNumber('+256752987654');
                    }}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2.5 transition text-left ${
                      !isMTN
                        ? 'border-red-500 bg-red-50 text-gray-900 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-red-600 font-black text-white flex items-center justify-center text-xs">
                      airtel
                    </div>
                    <div>
                      <div className="font-bold text-xs">Airtel Money</div>
                      <div className="text-[10px] text-gray-500">*185# Push</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Mobile Money Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+256 7XX XXX XXX"
                />
              </div>

              <div className="bg-surface p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Monthly Coaching Plan</div>
                  <div className="text-base font-bold text-dark">{formatUGX(initialAmount)} / month</div>
                </div>
                <div className="text-right text-[11px] text-green-700 bg-green-100 px-2 py-1 rounded font-medium">
                  Auto-renews monthly
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                <strong>Demo notice:</strong> This triggers an interactive USSD prompt simulation. No real money or mobile balance is touched.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-[0.98] transition tap-target"
              >
                {loading ? 'Sending USSD Prompt…' : `Pay ${formatUGX(initialAmount)} via Mobile Money`}
              </button>
            </form>
          )}

          {step === 'ussd_pin' && (
            <div className="space-y-4">
              {/* Authentic USSD Popup Box */}
              <div
                className={`p-5 rounded-2xl text-left shadow-inner border-2 ${
                  isMTN ? 'bg-yellow-400 text-gray-950 border-yellow-500' : 'bg-red-600 text-white border-red-700'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-mono opacity-80 mb-1">
                  USSD Push Service ({simData?.ussd_simulation?.ussd_code || '*165#'})
                </div>
                <p className="text-sm font-semibold mb-4 leading-snug">
                  {simData?.ussd_simulation?.prompt_text ||
                    `Enter PIN to approve payment of ${formatUGX(initialAmount)} to FlexiFit`}
                </p>

                <div className="space-y-2">
                  <input
                    type="password"
                    maxLength={4}
                    autoFocus
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-digit PIN (e.g. 1234)"
                    className={`w-full px-4 py-2.5 rounded-lg text-center tracking-widest text-lg font-mono font-bold focus:outline-none ${
                      isMTN
                        ? 'bg-yellow-200 text-gray-900 placeholder:text-yellow-800/60'
                        : 'bg-red-800 text-white placeholder:text-red-200/60'
                    }`}
                  />
                  <div className="text-[10px] text-center opacity-75">
                    Enter any 4 digits to simulate approval
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="w-1/3 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprovePin}
                  className="w-2/3 py-2.5 rounded-xl bg-dark hover:bg-gray-800 text-white text-xs font-bold shadow transition active:scale-[0.98]"
                >
                  Send PIN &amp; Approve
                </button>
              </div>
            </div>
          )}

          {step === 'approved' && (
            <div className="space-y-4 text-center py-2 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark">Subscription Active!</h3>
                <p className="text-xs text-gray-500">
                  Transaction approved for {phoneNumber}
                </p>
              </div>

              {/* Simulated SMS Notification banner */}
              <div className="bg-gray-900 text-left p-4 rounded-xl text-xs space-y-1 shadow-lg text-gray-200 border border-gray-700">
                <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1 mb-1">
                  <span>SMS from: <strong>{isMTN ? 'MTNMoMo' : 'AirtelMoney'}</strong></span>
                  <span>Just now</span>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-green-400">
                  {simData?.ussd_simulation?.sms_receipt ||
                    `Payment of ${formatUGX(initialAmount)} to FlexiFit successful. TxId: ${simData?.subscription?.reference_id}.`}
                </p>
              </div>

              <div className="text-left text-xs bg-surface p-3 rounded-lg space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Reference:</span>
                  <span className="font-mono font-bold">{simData?.subscription?.reference_id}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Amount:</span>
                  <span className="font-bold">{formatUGX(initialAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Status:</span>
                  <span className="text-green-600 font-bold">APPROVED (Simulated)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow hover:bg-orange-600 transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
