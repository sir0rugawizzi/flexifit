import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-[rgb(var(--color-fg))] mb-4">Privacy Policy</h1>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="font-bold text-[rgb(var(--color-fg))] mb-2 uppercase text-xs tracking-wider">1. Data Collection</h2>
          <p>We collect basic profile information (name, email, phone) to enable communication between trainers and clients. Workout and meal logs are stored to track your progress over time.</p>
        </section>

        <section>
          <h2 className="font-bold text-[rgb(var(--color-fg))] mb-2 uppercase text-xs tracking-wider">2. On-Device Pose Tracking</h2>
          <p>Our live pose tracking uses MediaPipe, which runs entirely within your web browser. <strong>No video data from live tracking ever leaves your device.</strong></p>
        </section>

        <section>
          <h2 className="font-bold text-[rgb(var(--color-fg))] mb-2 uppercase text-xs tracking-wider">3. AI Form Analysis</h2>
          <p>When you explicitly choose to upload a video for a form check, the app extracts a few key frames. These frames are sent to our server and processed by the Google Gemini API to generate biomechanical feedback. These images are stored temporarily on our server for your trainer to review.</p>
        </section>

        <section>
          <h2 className="font-bold text-[rgb(var(--color-fg))] mb-2 uppercase text-xs tracking-wider">4. Third-Party Services</h2>
          <p>We use Google's Gemini AI for multimodal analysis. By using the form-check feature, you consent to these frames being processed by their API in accordance with their privacy terms.</p>
        </section>

        <section>
          <h2 className="font-bold text-[rgb(var(--color-fg))] mb-2 uppercase text-xs tracking-wider">5. Your Rights</h2>
          <p>You can request the deletion of your account and all associated logs at any time by contacting your trainer or our support team.</p>
        </section>
      </div>
    </div>
  );
}
