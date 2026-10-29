// client/src/pages/client/FormCheckUpload.jsx
// Form Check clip submission with in-browser HTML5 canvas frame extraction (4-6 frames) and Claude AI feedback review

import { useState } from 'react';
import { apiUpload, apiPost } from '../../api/client';
import { extractFrames } from '../../utils/videoFrames';

export default function FormCheckUpload({ onCheckSubmitted }) {
  const [exerciseName, setExerciseName] = useState('Bodyweight Squats');
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setError(null);

    // Extract 5 evenly spaced frames on canvas without ffmpeg
    try {
      const frames = await extractFrames(file, 5);
      setExtractedFrames(frames);
    } catch (err) {
      console.warn('Frame extraction error:', err.message);
      // Generate placeholder frames if video format is unsupported in browser
      setExtractedFrames([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentGiven) {
      return setError('Please accept the AI analysis consent notice before proceeding.');
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('exercise_name', exerciseName);
      if (selectedFile) formData.append('video', selectedFile);
      if (extractedFrames.length > 0) {
        formData.append('frames', JSON.stringify(extractedFrames));
      }

      const response = await apiUpload('/form-checks/upload', formData);
      setAiFeedback(response.ai_feedback);
      if (onCheckSubmitted) onCheckSubmitted(response);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to analyze video');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Sample Form Check for classroom demo guarantee
  const handleUseSampleClip = async (sampleType = 'squat') => {
    setLoading(true);
    setError(null);
    try {
      const exName = sampleType === 'squat' ? 'Bodyweight Squats' : 'Push-ups';
      setExerciseName(exName);

      const response = await apiPost('/form-checks/upload', {
        exercise_name: exName,
        frames: [],
      });
      setAiFeedback(response.ai_feedback);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-dark tracking-tight">AI Form Check &amp; Feedback</h2>
        <p className="text-xs text-gray-500">
          Upload a 5–15 second clip. Our AI analyzes your joint angles and shares feedback directly with Coach Brian.
        </p>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
        <span className="text-base">⚠️</span>
        <span>
          <strong>Safety note:</strong> AI guidance is not medical advice. Stop immediately if you experience joint pain or discomfort.
        </span>
      </div>

      {/* 1-Click Fast-Track Demo Buttons for Presenter */}
      <div className="p-4 bg-surface rounded-2xl border border-gray-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            ⚡ Quick Class Demo Mode
          </span>
          <span className="text-[10px] text-gray-500">Instant AI evaluation</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleUseSampleClip('squat')}
            disabled={loading}
            className="py-2.5 px-3 rounded-xl bg-dark hover:bg-gray-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
          >
            <span>📹 Sample Squat Clip</span>
          </button>
          <button
            type="button"
            onClick={() => handleUseSampleClip('pushup')}
            disabled={loading}
            className="py-2.5 px-3 rounded-xl bg-dark hover:bg-gray-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
          >
            <span>📹 Sample Push-up Clip</span>
          </button>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
            Exercise Name
          </label>
          <select
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Bodyweight Squats">Bodyweight Squats</option>
            <option value="Push-ups">Push-ups</option>
            <option value="Plank Hold">Plank Hold</option>
            <option value="Walking Lunges">Walking Lunges</option>
          </select>
        </div>

        {/* Video Upload Field */}
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
            Select or Record Video
          </label>
          <input
            type="file"
            accept="video/*"
            capture="environment"
            onChange={handleFileChange}
            className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-orange-600 cursor-pointer"
          />
        </div>

        {/* Extracted Frame Previews */}
        {extractedFrames.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase text-gray-500 mb-1.5 flex items-center justify-between">
              <span>Canvas-extracted analysis frames (no ffmpeg):</span>
              <span className="text-primary font-mono">{extractedFrames.length} frames</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {extractedFrames.map((frame, i) => (
                <img
                  key={i}
                  src={frame}
                  alt={`Frame ${i + 1}`}
                  className="rounded-lg object-cover h-14 w-full border border-gray-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Mandatory Consent Notice */}
        <div className="p-3 bg-surface rounded-xl flex items-start gap-2.5 text-xs text-gray-600">
          <input
            type="checkbox"
            id="consent"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 accent-primary cursor-pointer w-4 h-4"
          />
          <label htmlFor="consent" className="cursor-pointer leading-tight">
            <strong>Consent Notice:</strong> Frames from your video will be analysed by AI and shared with Coach Brian for feedback.
          </label>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">{error}</div>}

        <button
          type="submit"
          disabled={loading || !consentGiven}
          className="w-full py-3.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition active:scale-[0.98] tap-target"
        >
          {loading ? 'Analyzing Form with Claude AI…' : 'Submit Video for AI Feedback'}
        </button>
      </form>

      {/* AI Structured Feedback Result Display */}
      {aiFeedback && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in space-y-4">
          <div className="bg-dark text-white p-5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-primary font-mono font-bold">
                Analysis Complete • {aiFeedback.source === 'anthropic_claude_api' ? 'Claude Sonnet' : 'Prototype AI Model'}
              </div>
              <h3 className="text-lg font-black">{exerciseName} Form Evaluation</h3>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-primary">{aiFeedback.overall_score}</div>
              <div className="text-[9px] uppercase text-gray-400">Score / 10</div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* What Looks Good */}
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-green-950 space-y-1.5">
              <div className="font-extrabold text-xs flex items-center gap-1.5 text-green-700">
                <span>✓</span>
                <span>WHAT LOOKS SOLID:</span>
              </div>
              <ul className="list-disc list-inside text-xs space-y-1">
                {aiFeedback.what_looks_good?.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            {/* Corrections */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-950 space-y-1.5">
              <div className="font-extrabold text-xs flex items-center gap-1.5 text-amber-700">
                <span>⚠️</span>
                <span>AREAS TO REFINE:</span>
              </div>
              <ul className="list-disc list-inside text-xs space-y-1">
                {aiFeedback.fix_these?.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            {/* Suggested Cue */}
            {aiFeedback.suggested_cue && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-950 text-xs">
                <span className="font-extrabold text-blue-700 block mb-1">💡 COACHING CUE FOR NEXT SET:</span>
                <p className="italic font-medium">"{aiFeedback.suggested_cue}"</p>
              </div>
            )}

            {/* Safety Note */}
            {aiFeedback.safety_note && (
              <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
                <strong>Safety recommendation:</strong> {aiFeedback.safety_note}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
