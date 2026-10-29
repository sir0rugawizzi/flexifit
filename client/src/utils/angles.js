/**
 * Joint Angle Math Utilities for Pose Tracking
 *
 * Used by the MediaPipe PoseLandmarker integration (Phase 6) to calculate
 * joint angles for exercise rep counting and form scoring.
 *
 * All points are { x, y, z? } — 2D or 3D coordinates.
 */

/**
 * Calculate the angle in degrees at pointB formed by the line segments BA and BC.
 *
 *       A
 *      /
 *     / ) angle
 *    B -------- C
 *
 * @param {{ x: number, y: number, z?: number }} a
 * @param {{ x: number, y: number, z?: number }} b - The vertex
 * @param {{ x: number, y: number, z?: number }} c
 * @returns {number} Angle in degrees (0–180)
 */
export function calculateAngle(a, b, c) {
  // Vectors BA and BC
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  // Include z-axis if all three points have it
  if (a.z != null && b.z != null && c.z != null) {
    ba.z = a.z - b.z;
    bc.z = c.z - b.z;
  }

  // Dot product
  let dot = ba.x * bc.x + ba.y * bc.y;
  if (ba.z != null) dot += ba.z * bc.z;

  // Magnitudes
  let magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2 + (ba.z ?? 0) ** 2);
  let magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2 + (bc.z ?? 0) ** 2);

  if (magBA === 0 || magBC === 0) return 0;

  // Clamp to avoid NaN from floating point
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));

  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Check if an angle is within ±tolerance of a target angle.
 *
 * @param {number} angle - The measured angle in degrees
 * @param {number} target - The target angle in degrees
 * @param {number} tolerance - The allowed deviation in degrees
 * @returns {boolean}
 */
export function isWithinRange(angle, target, tolerance) {
  return Math.abs(angle - target) <= tolerance;
}

/**
 * Common exercise angle thresholds.
 * Used by the rep-counting state machines in Phase 6.
 */
export const EXERCISE_ANGLES = {
  squat: {
    // Knee angle: standing ~170°, bottom of squat ~70-90°
    standingKnee: 170,
    bottomKnee: 85,
    repThreshold: 30, // angle change needed to count a rep
    hipStanding: 170,
    hipBottom: 80,
  },
  pushUp: {
    // Elbow angle: top ~170°, bottom ~90°
    elbowTop: 170,
    elbowBottom: 90,
    repThreshold: 30,
  },
  plank: {
    // Hip angle should stay ~170-180° (straight body line)
    idealHip: 175,
    tolerance: 15, // ±15° is acceptable
  },
};
