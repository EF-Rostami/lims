/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AlertCircle, CheckCircle2, Calculator } from 'lucide-react';

// 1. Define types for the form fields
interface CalibrationFormData {
  standard_id: string;
  nominal: number;
  reading: number;
  change_reason: string;
}

// 2. Define types for the component props
interface CalibrationWizardProps {
  equipmentId: number;
  onComplete: () => void;
}

export const CalibrationWizard: React.FC<CalibrationWizardProps> = ({ equipmentId, onComplete }) => {
  const [step, setStep] = useState(1);
  
  // 3. Initialize useForm with our data type
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<CalibrationFormData>();

  // 4. Properly type the submit handler
  const onSubmit: SubmitHandler<CalibrationFormData> = async (data) => {
    console.log(`Submitting Calibration for Equipment #${equipmentId}:`, data);
    // Add your fetch/axios call here
    onComplete();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 mx-1 rounded ${step >= i ? 'bg-blue-600' : 'bg-gray-100'}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Step 1: Reference Standard</h3>
            <p className="text-sm text-gray-500">Select the master instrument used for this test.</p>
            <select 
              {...register("standard_id", { required: "Standard is required" })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a Standard...</option>
              <option value="101">Fluke Multimeter (S/N: 9928)</option>
              <option value="102">Mitutoyo Caliper (S/N: 4410)</option>
            </select>
            <button type="button" onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Step 2: Measurement Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500">NOMINAL VALUE</label>
                <input 
                    type="number" 
                    step="any"
                    {...register("nominal", { required: true, valueAsNumber: true })} 
                    className="w-full p-2 border rounded" 
                    placeholder="10.00" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">ACTUAL READING</label>
                <input 
                    type="number" 
                    step="any"
                    {...register("reading", { required: true, valueAsNumber: true })} 
                    className="w-full p-2 border rounded" 
                    placeholder="10.02" 
                />
              </div>
            </div>
            <button type="button" onClick={() => setStep(3)} className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">Next</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-purple-700">Step 3: Verification & Audit</h3>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <label className="text-xs font-bold text-purple-700">CHANGE REASON (REQUIRED FOR AUDIT)</label>
              <textarea 
                {...register("change_reason", { required: "You must provide a reason" })}
                className="w-full p-2 mt-1 border rounded text-sm"
                placeholder="e.g., Annual scheduled calibration. Adjusted offset by 0.02."
              />
              {/* FIXED: We now access errors.change_reason.message properly */}
              {errors.change_reason && (
                <span className="text-red-500 text-xs mt-1 block">
                    {errors.change_reason.message}
                </span>
              )}
            </div>
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold mt-4">
                Submit Calibration Result
            </button>
          </div>
        )}
      </form>
    </div>
  );
};