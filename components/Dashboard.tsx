import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { UserData, Recommendations, GlucoseReading, Meal, Activity } from '../types';
import { getPersonalizedRecommendations } from '../services/geminiService';
import DataInputForm from './DataInputForm';
import RecommendationCard from './RecommendationCard';
import { MealIcon, ActivityIcon, GlucoseIcon, LightBulbIcon } from './IconComponents';
import GlucoseChart from './GlucoseChart';

const initialUserData: UserData = {
  glucoseReadings: [],
  meals: [],
  activities: [],
};

const initialRecommendations: Recommendations = {
    dietary: "",
    activity: "",
    medication: "",
};


const Dashboard: React.FC = () => {
  const [userData, setUserData] = useLocalStorage<UserData>('userData', initialUserData);
  const [recommendations, setRecommendations] = useState<Recommendations>(initialRecommendations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if(userData.activities.length === 0 && userData.meals.length === 0 && userData.glucoseReadings.length === 0) {
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setRecommendations(initialRecommendations); // Clear old recommendations

    try {
      const newRecommendations = await getPersonalizedRecommendations(userData);
      setRecommendations(newRecommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userData]);


  useEffect(() => {
    // Fetch recommendations only if there's data, but don't run on every render.
    // The user will trigger it with the button.
  }, []);

  const handleAddData = (data: GlucoseReading | Meal | Activity, type: 'glucose' | 'meal' | 'activity') => {
    const newUserData = { ...userData };
    switch (type) {
      case 'glucose':
        newUserData.glucoseReadings = [...newUserData.glucoseReadings, data as GlucoseReading];
        break;
      case 'meal':
        newUserData.meals = [...newUserData.meals, data as Meal];
        break;
      case 'activity':
        newUserData.activities = [...newUserData.activities, data as Activity];
        break;
    }
    setUserData(newUserData);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  }
  
  const hasData = userData.glucoseReadings.length > 0 || userData.meals.length > 0 || userData.activities.length > 0;
  const hasGlucoseData = userData.glucoseReadings.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <DataInputForm onAddData={handleAddData} />
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Recent Data</h3>
            
            {hasGlucoseData && <GlucoseChart readings={userData.glucoseReadings} />}

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {userData.glucoseReadings.slice().reverse().map(r => (
                    <div key={r.id} className="text-sm p-2 bg-gray-50 rounded-md"><b>Glucose:</b> {r.value} mg/dL ({r.context}) <span className="text-xs text-gray-500 block">{formatDate(r.timestamp)}</span></div>
                ))}
                {userData.meals.slice().reverse().map(m => (
                    <div key={m.id} className="text-sm p-2 bg-gray-50 rounded-md"><b>Meal:</b> {m.description} ({m.carbs}g carbs) <span className="text-xs text-gray-500 block">{formatDate(m.timestamp)}</span></div>
                ))}
                {userData.activities.slice().reverse().map(a => (
                    <div key={a.id} className="text-sm p-2 bg-gray-50 rounded-md"><b>Activity:</b> {a.type} ({a.duration} min, {a.intensity}) <span className="text-xs text-gray-500 block">{formatDate(a.timestamp)}</span></div>
                ))}
                {!hasData && <p className="text-gray-500">No data logged yet.</p>}
            </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Personalized Recommendations</h2>
            <button 
                onClick={() => fetchRecommendations()}
                disabled={isLoading || !hasData}
                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                {isLoading ? 'Generating...' : 'Get New Advice'}
            </button>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>}

        {!hasData && !isLoading && (
            <div className="text-center py-12 px-6 bg-white rounded-xl shadow-lg">
                <LightBulbIcon className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Ready for your insights?</h3>
                <p className="mt-1 text-sm text-gray-500">Log some data using the form on the left to get your first set of personalized recommendations from our AI.</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RecommendationCard 
                title="Dietary Guidance"
                icon={<MealIcon className="w-6 h-6 text-indigo-600" />}
                recommendation={recommendations.dietary}
            />
            <RecommendationCard 
                title="Activity Suggestions"
                icon={<ActivityIcon className="w-6 h-6 text-indigo-600" />}
                recommendation={recommendations.activity}
            />
            <RecommendationCard 
                title="Medication Guidance"
                icon={<GlucoseIcon className="w-6 h-6 text-indigo-600" />}
                recommendation={recommendations.medication}
            />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;