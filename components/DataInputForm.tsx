
import React, { useState } from 'react';
import type { GlucoseReading, Meal, Activity } from '../types';

interface DataInputFormProps {
  onAddData: (data: GlucoseReading | Meal | Activity, type: 'glucose' | 'meal' | 'activity') => void;
}

type FormType = 'glucose' | 'meal' | 'activity';

const DataInputForm: React.FC<DataInputFormProps> = ({ onAddData }) => {
  const [formType, setFormType] = useState<FormType>('glucose');

  const [glucoseValue, setGlucoseValue] = useState('');
  const [glucoseContext, setGlucoseContext] = useState<'before-meal' | 'after-meal' | 'fasting' | 'other'>('other');
  
  const [mealDesc, setMealDesc] = useState('');
  const [mealCarbs, setMealCarbs] = useState('');

  const [activityType, setActivityType] = useState('');
  const [activityDuration, setActivityDuration] = useState('');
  const [activityIntensity, setActivityIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    const id = Date.now().toString();

    switch (formType) {
      case 'glucose':
        if (!glucoseValue) return;
        onAddData({ id, value: Number(glucoseValue), context: glucoseContext, timestamp }, 'glucose');
        setGlucoseValue('');
        break;
      case 'meal':
        if (!mealDesc || !mealCarbs) return;
        onAddData({ id, description: mealDesc, carbs: Number(mealCarbs), timestamp }, 'meal');
        setMealDesc('');
        setMealCarbs('');
        break;
      case 'activity':
        if (!activityType || !activityDuration) return;
        onAddData({ id, type: activityType, duration: Number(activityDuration), intensity: activityIntensity, timestamp }, 'activity');
        setActivityType('');
        setActivityDuration('');
        break;
    }
  };
  
  const renderFormFields = () => {
    switch(formType) {
      case 'glucose':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="glucoseValue" className="block text-sm font-medium text-gray-700">Glucose (mg/dL)</label>
              <input type="number" id="glucoseValue" value={glucoseValue} onChange={(e) => setGlucoseValue(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div className="mb-4">
              <label htmlFor="glucoseContext" className="block text-sm font-medium text-gray-700">Context</label>
              <select id="glucoseContext" value={glucoseContext} onChange={(e) => setGlucoseContext(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="other">Other</option>
                <option value="before-meal">Before Meal</option>
                <option value="after-meal">After Meal</option>
                <option value="fasting">Fasting</option>
              </select>
            </div>
          </>
        );
      case 'meal':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="mealDesc" className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" id="mealDesc" value={mealDesc} onChange={(e) => setMealDesc(e.target.value)} placeholder="e.g., Oatmeal with berries" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div className="mb-4">
              <label htmlFor="mealCarbs" className="block text-sm font-medium text-gray-700">Carbs (g)</label>
              <input type="number" id="mealCarbs" value={mealCarbs} onChange={(e) => setMealCarbs(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
          </>
        );
      case 'activity':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="activityType" className="block text-sm font-medium text-gray-700">Type</label>
              <input type="text" id="activityType" value={activityType} onChange={(e) => setActivityType(e.target.value)} placeholder="e.g., Brisk walk" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div className="mb-4">
              <label htmlFor="activityDuration" className="block text-sm font-medium text-gray-700">Duration (min)</label>
              <input type="number" id="activityDuration" value={activityDuration} onChange={(e) => setActivityDuration(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div className="mb-4">
              <label htmlFor="activityIntensity" className="block text-sm font-medium text-gray-700">Intensity</label>
              <select id="activityIntensity" value={activityIntensity} onChange={(e) => setActivityIntensity(e.target.value as any)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </>
        );
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Log New Entry</h2>
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {(['glucose', 'meal', 'activity'] as FormType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setFormType(tab)}
              className={`${
                formType === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <form onSubmit={handleSubmit}>
        {renderFormFields()}
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          Add Entry
        </button>
      </form>
    </div>
  );
};

export default DataInputForm;
