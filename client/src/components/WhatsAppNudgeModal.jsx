// client/src/components/WhatsAppNudgeModal.jsx
// 1-Tap context-aware WhatsApp nudge for trainers to follow up with flagged clients

import { useState } from 'react';

export default function WhatsAppNudgeModal({ client, isOpen, onClose }) {
  if (!isOpen || !client) return null;

  const firstName = client.name.split(' ')[0];
  const primaryReason = client.flag_reasons?.[0] || 'your workout consistency';

  // Construct context-aware message based on flag reason
  let defaultMessage = `Hey ${firstName}, Coach Brian here from FlexiFit! Just checking in on how everything went this week. How are you feeling?`;
  if (primaryReason.toLowerCase().includes('workout')) {
    defaultMessage = `Hey ${firstName}, Coach Brian here! Noticed you haven't logged your workouts over the past few days. Everything okay with your schedule or body? Let me know if you need any adjustments to the home plan!`;
  } else if (primaryReason.toLowerCase().includes('macro') || primaryReason.toLowerCase().includes('adherence')) {
    defaultMessage = `Hey ${firstName}, Coach Brian! Looking at your food log for the week, noticed your nutrition adherence dipped a bit. Are you finding it tricky to hit your protein targets with the local staples? Let's tweak your meal portions!`;
  } else if (primaryReason.toLowerCase().includes('check-in') || primaryReason.toLowerCase().includes('overdue')) {
    defaultMessage = `Hey ${firstName}, Coach Brian here! Your weekly FlexiFit check-in is overdue. Could you take 60 seconds today to fill in your energy and sleep numbers in the app so we stay on track?`;
  }

  const [message, setMessage] = useState(defaultMessage);

  const cleanPhone = (client.phone || '+256701234567').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  const handleSend = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <span className="font-bold text-sm">WhatsApp Check-In Nudge</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white font-bold">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 bg-surface p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
              {firstName[0]}
            </div>
            <div>
              <div className="font-bold text-sm text-dark">{client.name}</div>
              <div className="text-xs text-gray-500">{client.phone || '+256 701 234 567'}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Trigger Reason:
            </div>
            <div className="text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
              {client.flag_reasons?.join(' • ') || 'Routine accountability check-in'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Custom WhatsApp Message:
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          <div className="text-[11px] text-gray-500 leading-snug">
            Tapping below opens WhatsApp directly with this pre-filled message, keeping your habit of fast mobile communication intact.
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="w-2/3 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md shadow-green-500/20 flex items-center justify-center gap-2 transition"
            >
              <span>Open in WhatsApp</span>
              <span>↗</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
