// server/tests/geminiAi.test.js
import { describe, it, expect } from '@jest/globals';
import { generateSampleFeedback, analyzeExerciseFrames } from '../src/services/geminiAi.js';

describe('Google Gemini AI Form Check Service', () => {
  it('generates structured sample feedback for squats with correct JSON shape', () => {
    const feedback = generateSampleFeedback('Bodyweight Squats');

    expect(feedback).toHaveProperty('overall_score');
    expect(typeof feedback.overall_score).toBe('number');
    expect(feedback).toHaveProperty('what_looks_good');
    expect(Array.isArray(feedback.what_looks_good)).toBe(true);
    expect(feedback.what_looks_good.length).toBeGreaterThan(0);
    expect(feedback).toHaveProperty('fix_these');
    expect(Array.isArray(feedback.fix_these)).toBe(true);
    expect(feedback).toHaveProperty('safety_note');
    expect(typeof feedback.safety_note).toBe('string');
    expect(feedback).toHaveProperty('suggested_cue');
    expect(typeof feedback.suggested_cue).toBe('string');
    expect(feedback.source).toBe('sample_mode');
  });

  it('generates structured sample feedback for push-ups', () => {
    const feedback = generateSampleFeedback('Push-ups');

    expect(typeof feedback.overall_score).toBe('number');
    expect(feedback.what_looks_good.some(g => g.toLowerCase().includes('elbow'))).toBe(true);
    expect(feedback.safety_note.length).toBeGreaterThan(0);
    expect(feedback.source).toBe('sample_mode');
  });

  it('generates structured sample feedback for generic exercises', () => {
    const feedback = generateSampleFeedback('Plank');

    expect(typeof feedback.overall_score).toBe('number');
    expect(feedback.suggested_cue.length).toBeGreaterThan(0);
    expect(feedback.source).toBe('sample_mode');
  });

  it('falls back safely to sample feedback when no frames provided', async () => {
    const result = await analyzeExerciseFrames('Bodyweight Squats', []);

    expect(result).toHaveProperty('overall_score');
    expect(result.source).toBe('sample_mode');
  });

  it('preserves all required JSON fields in any analyzed response', async () => {
    const dummyFrame = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const result = await analyzeExerciseFrames('Bodyweight Squats', [dummyFrame]);

    expect(result).toHaveProperty('overall_score');
    expect(result).toHaveProperty('what_looks_good');
    expect(result).toHaveProperty('fix_these');
    expect(result).toHaveProperty('safety_note');
    expect(result).toHaveProperty('suggested_cue');
  });
});
