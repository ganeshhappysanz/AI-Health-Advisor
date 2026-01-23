
export type DiabetesType = 'Type 1' | 'Type 2' | 'Gestational' | 'Pre-diabetic';

export interface UserProfile {
  id: string;
  fullName: string;
  age: number;
  weight: number; // current weight
  height: number;
  diabetesType: DiabetesType;
  medications: string[];
  targetWeight: number;
  targetGlucoseRange: { min: number; max: number };
  registeredAt: string;
}

export interface GlucoseReading {
  id: string;
  patientId: string;
  value: number;
  timestamp: string;
  context: 'before-meal' | 'after-meal' | 'fasting' | 'other';
}

export interface WeightLog {
  id: string;
  patientId: string;
  value: number;
  timestamp: string;
}

export interface Meal {
  id: string;
  patientId: string;
  description: string;
  carbs: number;
  timestamp: string;
}

export interface Activity {
  id: string;
  patientId: string;
  type: string;
  duration: number; // in minutes
  intensity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface CarePlan {
  dietaryStrategy: string;
  physicalActivityPlan: string;
  weightManagementGoals: string;
  clinicianNotes: string;
  alerts: string[];
}
