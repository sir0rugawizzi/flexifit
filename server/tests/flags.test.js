// server/tests/flags.test.js
import { describe, it, expect } from '@jest/globals';

describe('Client Compliance Flag Evaluation', () => {
  const evaluateFlags = ({ workoutDaysAgo, macroAdherence, weightDaysAgo, checkInDaysAgo }) => {
    const FLAG_NO_WORKOUT_DAYS = 3;
    const FLAG_MACRO_ADHERENCE_PCT = 70;
    const FLAG_NO_WEIGHT_DAYS = 7;
    const FLAG_CHECKIN_MISSED_DAYS = 7;

    const reasons = [];
    if (workoutDaysAgo > FLAG_NO_WORKOUT_DAYS) {
      reasons.push(`No workout in ${workoutDaysAgo} days`);
    }
    if (macroAdherence < FLAG_MACRO_ADHERENCE_PCT) {
      reasons.push(`7-day macro adherence at ${macroAdherence}%`);
    }
    if (weightDaysAgo > FLAG_NO_WEIGHT_DAYS) {
      reasons.push(`No weight in ${weightDaysAgo} days`);
    }
    if (checkInDaysAgo > FLAG_CHECKIN_MISSED_DAYS) {
      reasons.push(`Weekly check-in overdue`);
    }

    let status = 'on_track';
    if (reasons.length >= 2) status = 'non_compliant';
    else if (reasons.length === 1) status = 'needs_attention';

    return { status, reasons };
  };

  it('marks client on_track when all metrics meet compliance thresholds', () => {
    const result = evaluateFlags({
      workoutDaysAgo: 1,
      macroAdherence: 85,
      weightDaysAgo: 2,
      checkInDaysAgo: 4,
    });
    expect(result.status).toBe('on_track');
    expect(result.reasons).toHaveLength(0);
  });

  it('marks client needs_attention when exactly 1 metric fails', () => {
    const result = evaluateFlags({
      workoutDaysAgo: 4, // > 3d fails
      macroAdherence: 80,
      weightDaysAgo: 2,
      checkInDaysAgo: 3,
    });
    expect(result.status).toBe('needs_attention');
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('No workout in 4 days');
  });

  it('marks client non_compliant when 2 or more metrics fail', () => {
    const result = evaluateFlags({
      workoutDaysAgo: 5,  // fails (>3)
      macroAdherence: 55, // fails (<70)
      weightDaysAgo: 2,
      checkInDaysAgo: 3,
    });
    expect(result.status).toBe('non_compliant');
    expect(result.reasons).toHaveLength(2);
  });

  it('triggers missed check-in flag when days exceed 7', () => {
    const result = evaluateFlags({
      workoutDaysAgo: 1,
      macroAdherence: 90,
      weightDaysAgo: 3,
      checkInDaysAgo: 10,
    });
    expect(result.status).toBe('needs_attention');
    expect(result.reasons[0]).toContain('Weekly check-in overdue');
  });
});
