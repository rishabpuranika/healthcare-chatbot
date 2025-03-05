import React from "react";

const GeneralHealth = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold text-green-400">🩺 General Health</h1>
      <p className="mt-4 text-lg text-gray-300 max-w-2xl text-center">
        Maintaining good health requires a combination of balanced nutrition,
        exercise, and routine checkups.
      </p>
      <div className="mt-6 space-y-4 max-w-lg">
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          ✅ <b>Daily Exercise:</b> Engaging in at least 30 minutes of moderate
          exercise helps improve heart health and metabolism.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🍏 <b>Healthy Eating:</b> Include fruits, vegetables, and whole grains
          in your daily diet to boost immunity.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🏥 <b>Regular Check-ups:</b> Annual health screenings can help detect
          conditions like high blood pressure and diabetes early.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          😴 <b>Quality Sleep:</b> Adults should aim for 7-9 hours of
          uninterrupted sleep for optimal cognitive function.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          💧 <b>Hydration:</b> Drinking sufficient water (8+ glasses/day) is
          essential for digestion and energy levels.
        </p>
      </div>
    </div>
  );
};

export default GeneralHealth;
