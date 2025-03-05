import React from "react";

const Medications = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold text-blue-400">💊 Medications</h1>
      <p className="mt-4 text-lg text-gray-300 max-w-2xl text-center">
        Understanding medications ensures safe and effective use. Always consult
        a healthcare provider before taking new medicines.
      </p>
      <div className="mt-6 space-y-4 max-w-lg">
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          💊 <b>Painkillers:</b> Common medications include Ibuprofen and
          Paracetamol for headaches and muscle pain.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          ⚕️ <b>Antibiotics:</b> Used to treat bacterial infections. Overuse can
          lead to antibiotic resistance.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          ⚠️ <b>Side Effects:</b> Some medications may cause dizziness, nausea,
          or allergic reactions.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          💉 <b>Vaccinations:</b> Protect against diseases like flu, measles,
          and COVID-19. Staying up to date is crucial.
        </p>
        <p className="bg-gray-800 p-4 rounded-lg shadow">
          🏥 <b>Storage & Expiry:</b> Medications should be stored in cool, dry
          places. Expired medicines should never be used.
        </p>
      </div>
    </div>
  );
};

export default Medications;
