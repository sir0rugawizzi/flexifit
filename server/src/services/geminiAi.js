// server/src/services/geminiAi.js
// Google Gemini API integration for Form Check vision analysis
// With guaranteed sample fallback so the demo never breaks if key is missing, offline, or rate-limited.

import { GoogleGenAI } from '@google/genai';
import config from '../config.js';

let geminiClient = null;

function getClient() {
  if (!geminiClient && config.GEMINI_API_KEY && config.GEMINI_API_KEY.trim()) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY.trim() });
    } catch (err) {
      console.warn('Could not initialize Google GenAI client:', err.message);
    }
  }
  return geminiClient;
}

export async function analyzeExerciseFrames(exerciseName = 'Bodyweight Squats', framesBase64 = []) {
  // If no Gemini key or no frames, return labeled sample feedback
  if (!config.GEMINI_API_KEY || !config.GEMINI_API_KEY.trim() || framesBase64.length === 0) {
    return generateSampleFeedback(exerciseName);
  }

  const client = getClient();
  if (!client) {
    return generateSampleFeedback(exerciseName);
  }

  try {
    const contents = [];

    // Format image frames for multimodal analysis (up to 5 frames)
    for (const frame of framesBase64.slice(0, 5)) {
      const match = typeof frame === 'string' ? frame.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/) : null;
      const mimeType = match ? match[1] : 'image/jpeg';
      const data = match ? match[2] : (typeof frame === 'string' ? frame : '');

      if (data) {
        contents.push({
          inlineData: {
            mimeType,
            data,
          },
        });
      }
    }

    // Add structured instruction prompt
    contents.push({
      text: `You are an expert biomechanics fitness coach. Analyze these chronological frames of a client performing a ${exerciseName}.
Evaluate their form, depth, joint alignment, and safety.

Return ONLY a valid JSON object matching this schema:
{
  "overall_score": 8.5,
  "what_looks_good": [
    "string praising specific positive biomechanics"
  ],
  "fix_these": [
    "string noting 1-2 critical corrections"
  ],
  "safety_note": "string warning about joint stress or injury prevention",
  "suggested_cue": "a short memorable mental cue the client can focus on next rep"
}`,
    });

    const response = await client.models.generateContent({
      model: config.GEMINI_MODEL,
      contents,
    });

    const replyText = response.text || '';
    const jsonMatch = replyText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        overall_score: typeof parsed.overall_score === 'number' ? parsed.overall_score : 8.0,
        what_looks_good: Array.isArray(parsed.what_looks_good) ? parsed.what_looks_good : [],
        fix_these: Array.isArray(parsed.fix_these) ? parsed.fix_these : [],
        safety_note: parsed.safety_note || '',
        suggested_cue: parsed.suggested_cue || '',
        source: 'gemini_api',
        model: config.GEMINI_MODEL,
      };
    }

    const fallback = generateSampleFeedback(exerciseName);
    fallback.note = 'Sample feedback used (unable to parse JSON from Gemini response)';
    return fallback;
  } catch (err) {
    // Check for HTTP 429 rate limit errors (RESOURCE_EXHAUSTED / quota exceeded)
    const is429 =
      err.status === 429 ||
      err.statusCode === 429 ||
      err.code === 429 ||
      (typeof err.message === 'string' &&
        (err.message.includes('429') ||
          err.message.includes('RESOURCE_EXHAUSTED') ||
          err.message.toLowerCase().includes('quota') ||
          err.message.toLowerCase().includes('rate limit')));

    if (is429) {
      console.warn('Gemini API rate limit reached (HTTP 429 / RESOURCE_EXHAUSTED):', err.message);
      const fallback = generateSampleFeedback(exerciseName);
      fallback.note = 'Sample feedback used (Gemini API rate limit reached - HTTP 429)';
      return fallback;
    }

    console.warn('Gemini API call failed, using realistic fallback:', err.message);
    const fallback = generateSampleFeedback(exerciseName);
    fallback.note = `Sample feedback used (API fallback: ${err.message})`;
    return fallback;
  }
}

export function generateSampleFeedback(exerciseName = 'Bodyweight Squats') {
  const norm = exerciseName.toLowerCase();

  if (norm.includes('squat')) {
    return {
      overall_score: 8.2,
      what_looks_good: [
        'Maintains good upright torso angle without excessive forward tilt',
        'Hip crease clearly drops below the top of the knees (full depth)',
        'Foot arches remain grounded with stable heel contact',
      ],
      fix_these: [
        'Slight knee valgus (inward caving) at the start of the ascent',
        'Initiate the movement by pushing hips back before bending knees',
      ],
      safety_note: 'Avoid letting your lower back round at the very bottom (butt wink).',
      suggested_cue: 'Spread the floor with your feet and drive knees outward as you push up.',
      source: 'sample_mode',
    };
  }

  if (norm.includes('push') || norm.includes('pushup') || norm.includes('push-up')) {
    return {
      overall_score: 7.8,
      what_looks_good: [
        'Solid elbow tuck at approximately 45 degrees to the torso',
        'Chest reaches within 3 inches of the floor',
        'Neck remains neutral looking slightly ahead',
      ],
      fix_these: [
        'Slight hip sagging in the middle of the set indicating core fatigue',
        'Squeeze glutes and brace abs tighter to keep a rigid straight line',
      ],
      safety_note: 'Keep shoulder blades depressed away from the ears to protect rotators.',
      suggested_cue: 'Imagine pushing the floor away from your chest like a moving plank.',
      source: 'sample_mode',
    };
  }

  // Plank or generic
  return {
    overall_score: 8.0,
    what_looks_good: [
      'Good shoulder position stacked directly over the elbows',
      'Neutral cervical spine without dropping the head',
    ],
    fix_these: [
      'Hips are slightly elevated; bring pelvis down 2 inches into neutral',
      'Engage quads actively to support core tension',
    ],
    safety_note: 'Breathe steadily into the belly; do not hold your breath.',
    suggested_cue: 'Pull your elbows toward your toes to ignite deep abdominal tension.',
    source: 'sample_mode',
  };
}
