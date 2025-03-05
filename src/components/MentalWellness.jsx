import React from "react";

const MentalWellness = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold text-purple-400">🧘 Mental Wellness</h1>
      <p className="mt-4 text-lg text-gray-300 max-w-2xl text-center">
        Prioritizing mental well-being improves overall quality of life. Simple
        habits can reduce stress and enhance emotional balance.
      </p>
      <div className="mt-6 space-y-4 max-w-lg">
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🧘‍♂️ <b>Mindfulness & Meditation:</b> Practicing deep breathing and
          meditation reduces anxiety and improves focus.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🌿 <b>Self-care Routine:</b> Engaging in hobbies, reading, or walking
          in nature can uplift mood.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          💤 <b>Quality Sleep:</b> Poor sleep habits are linked to stress and
          depression. Establish a consistent sleep schedule.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🎧 <b>Music Therapy:</b> Listening to relaxing music can significantly
          lower stress levels.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          📞 <b>Seeking Help:</b> Consulting a therapist or counselor is
          essential when struggling with mental health challenges.
        </p>
      </div>
    </div>
  );
};

export default MentalWellness;
