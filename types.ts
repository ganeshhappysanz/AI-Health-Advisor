
export interface GlucoseReading {
  id: string;
  value: number;
  timestamp: string;
  context: 'before-meal' | 'after-meal' | 'fasting' | 'other';
}

export interface Meal {
  id: string;
  description: string;
  carbs: number;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: string;
  duration: number; // in minutes
  intensity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface UserData {
  glucoseReadings: GlucoseReading[];
  meals: Meal[];
  activities: Activity[];
}

export interface Recommendations {
  dietary: string;
  activity: string;
  medication: string;
}
