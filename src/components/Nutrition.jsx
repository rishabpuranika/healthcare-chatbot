import React from "react";

const Nutrition = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold text-orange-400">🍎 Nutrition</h1>
      <p className="mt-4 text-lg text-gray-300 max-w-2xl text-center">
        A nutritious diet provides essential vitamins and minerals for a healthy
        body and mind.
      </p>
      <div className="mt-6 space-y-4 max-w-lg">
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🥗 <b>Fruits & Vegetables:</b> A variety of colorful vegetables and
          fruits provide fiber and antioxidants.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🥩 <b>Protein Sources:</b> Lean meats, beans, and nuts aid muscle
          growth and repair.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🥖 <b>Carbohydrates:</b> Whole grains like brown rice and oats provide
          sustained energy levels.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🚰 <b>Hydration:</b> Water is essential for digestion and maintaining
          body temperature.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🚫 <b>Processed Foods:</b> High sugar and sodium content in fast food
          can lead to long-term health issues.
        </p>
      </div>
    </div>
  );
};

export default Nutrition;
