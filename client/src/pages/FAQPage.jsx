import React, { useState } from 'react';

const faqs = [
  {
    question: "How does FlexiFit differ from a gym membership?",
    answer: "FlexiFit provides personalized coaching delivered to your home or preferred outdoor space. We focus on Ugandan nutrition and calisthenics, eliminating the need for expensive gym fees or commuting in Kampala traffic."
  },
  {
    question: "Do I need special equipment for the workouts?",
    answer: "Most of our programs use bodyweight exercises (calisthenics). If a specific tool is needed, your trainer will guide you on using common household items as alternatives."
  },
  {
    question: "How does the AI Form Check work?",
    answer: "You upload a short clip of your exercise. Our AI analyzes key joint angles to provide immediate feedback on your form. This is a guide to help you improve; it is not medical advice."
  },
  {
    question: "How do I pay for my subscription?",
    answer: "Payments are made directly via MTN MoMo or Airtel Money to your trainer's registered number. Once you pay, simply tap 'I've Paid' in the app, and your trainer will activate your account."
  },
  {
    question: "Is my data private?",
    answer: "Yes. Pose tracking happens entirely on your device. Only video frames you explicitly choose to upload for AI analysis are sent to our secure server and the Gemini API."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-dark mb-2">Frequently Asked Questions</h1>
      <p className="text-gray-500 mb-8">Everything you need to know about your FlexiFit journey.</p>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <span className="font-bold text-sm text-dark">{faq.question}</span>
              <span className={`text-xl transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>
            {openIndex === index && (
              <div className="p-4 pt-0 text-sm text-gray-600 border-t border-gray-100 bg-gray-50/50">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
