// server/src/services/claudeAi.js
// Anthropic Claude Vision API integration for Form Check analysis
// With guaranteed sample fallback so the demo never breaks if key is missing or offline.

import Anthropic from '@anthropic-ai/sdk';
import config from '../config.js';

let anthropicClient = null;
if (config.ANTHROPIC_API_KEY) {
  try {
    anthropicClient = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
  } catch (err) {
    console.warn('Could not initialize Anthropic client:', err.message);
  }
}

export async function analyzeExerciseFrames(exerciseName, framesBase64 = []) {
  // If no Anthropic key or client, return realistic sample feedback
  if (!anthropicClient || !config.ANTHROPIC_API_KEY || framesBase64.length === 0) {
    return generateSampleFeedback(exerciseName);
  }

  try {
    // Format image messages for Claude Vision
    const content = [
      {
        type: 'text',
        text: `You are an expert biomechanics fitness coach. Analyze these ${framesBase64.length} chronological frames of a client performing a ${exerciseName}.
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
      },
    ];

    for (const frame of framesBase64.slice(0, 5)) {
      // Clean base64 string
      const match = frame.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      const mediaType = match ? match[1] : 'image/jpeg';
      const base64Data = match ? match[2] : frame;

      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      });
    }

    const response = await anthropicClient.messages.create({
      model: config.ANTHROPIC_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content }],
    });

    const replyText = response.content?.[0]?.text || '';
    const jsonMatch = replyText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        source: 'anthropic_claude_api',
        model: config.ANTHROPIC_MODEL,
      };
    }

    return generateSampleFeedback(exerciseName);
  } catch (err) {
    console.warn('Claude API call failed or timed out, using realistic fallback:', err.message);
    const fallback = generateSampleFeedback(exerciseName);
    fallback.note = 'Sample feedback used (API call fallback)';
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
