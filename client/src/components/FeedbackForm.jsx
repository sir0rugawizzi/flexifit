import React, { useState } from 'react';

export default function FeedbackForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, comment: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mocking submission for now as no backend route exists yet
    console.log('Feedback submitted:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center p-6 bg-white border border-gray-200 rounded-2xl">
        <div className="text-3xl mb-2">🌟</div>
        <h3 className="font-bold text-dark">Thank you!</h3>
        <p className="text-xs text-gray-500">Your feedback helps us improve the FlexiFit experience.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <h3 className="font-bold text-dark text-sm mb-2">Share your experience</h3>

      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            className={`text-2xl transition ${formData.rating >= star ? 'grayscale-0' : 'grayscale opacity-30'}`}
          >
            ⭐
          </button>
        ))}
      </div>

      <textarea
        value={formData.comment}
        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
        placeholder="Tell us what you love or what we can improve..."
        className="w-full p-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-24"
      />

      <button
        type="submit"
        className="w-full py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-orange-600 transition"
      >
        Submit Feedback
      </button>
    </form>
  );
}
