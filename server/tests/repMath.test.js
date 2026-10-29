// server/tests/repMath.test.js
import { describe, it, expect } from '@jest/globals';

function calculateAngle(a, b, c) {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);

  if (magBA === 0 || magBC === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

describe('Pose Tracking Angle Geometry & Rep Math', () => {
  it('measures a straight vertical leg as 180 degrees', () => {
    // Hip (0, 0), Knee (0, 1), Ankle (0, 2)
    const hip = { x: 0, y: 0 };
    const knee = { x: 0, y: 1 };
    const ankle = { x: 0, y: 2 };

    const angle = calculateAngle(hip, knee, ankle);
    expect(Math.round(angle)).toBe(180);
  });

  it('measures a 90-degree right angle squat knee bend', () => {
    // Hip (-1, 1), Knee (0, 1), Ankle (0, 2)
    const hip = { x: -1, y: 1 };
    const knee = { x: 0, y: 1 };
    const ankle = { x: 0, y: 2 };

    const angle = calculateAngle(hip, knee, ankle);
    expect(Math.round(angle)).toBe(90);
  });

  it('correctly tracks state transition for a squat rep', () => {
    // Squat state machine: 'up' -> 'down' (knee < 95) -> 'up' (knee > 160)
    let state = 'up';
    let reps = 0;

    const processFrame = (kneeAngle) => {
      if (state === 'up' && kneeAngle < 95) {
        state = 'down';
      } else if (state === 'down' && kneeAngle > 160) {
        state = 'up';
        reps += 1;
      }
    };

    // Frame sequence: standing -> descent -> full depth -> ascent -> standing
    [175, 140, 110, 85, 120, 150, 168].forEach(processFrame);

    expect(reps).toBe(1);
    expect(state).toBe('up');
  });

  it('evaluates plank hip alignment score', () => {
    // Ideal hip is ~175 deg. A sagging hip at 145 deg should be flagged
    const hipAngleSagging = 145;
    const isLevel = Math.abs(hipAngleSagging - 175) <= 15;
    expect(isLevel).toBe(false);

    const hipAngleNeutral = 172;
    const isNeutralLevel = Math.abs(hipAngleNeutral - 175) <= 15;
    expect(isNeutralLevel).toBe(true);
  });
});
