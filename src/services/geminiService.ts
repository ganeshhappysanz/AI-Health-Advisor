
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import type { UserProfile, CarePlan, GlucoseReading, Meal, Activity, WeightLog } from '../types';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private readonly carePlanSchema = {
    type: Type.OBJECT,
    properties: {
        dietaryStrategy: {
            type: Type.STRING,
            description: "Evidence-based dietary strategy focusing on glycemic load and weight reduction.",
        },
        physicalActivityPlan: {
            type: Type.STRING,
            description: "A tailored exercise regimen considering patient's age, weight, and diabetes type.",
        },
        weightManagementGoals: {
            type: Type.STRING,
            description: "Short and long term weight targets with specific motivational milestones.",
        },
        clinicianNotes: {
            type: Type.STRING,
            description: "Summarized clinical insights for the healthcare provider.",
        },
        alerts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Immediate safety alerts or behavioral flags identified from the data.",
        },
    },
    required: ["dietaryStrategy", "physicalActivityPlan", "weightManagementGoals", "clinicianNotes", "alerts"],
  };

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateCarePlan(
    profile: UserProfile, 
    glucose: GlucoseReading[], 
    meals: Meal[], 
    activities: Activity[],
    weights: WeightLog[]
  ): Promise<CarePlan> {
    const prompt = `
        You are a Clinical Diabetic Educator and Weight Management Specialist.
        Analyze the following comprehensive patient profile and history to generate a HIPAA-compliant personalized care plan.

        Patient Profile:
        - Name: ${profile.fullName}
        - Age: ${profile.age}
        - Weight: ${profile.weight}kg (Current), Target: ${profile.targetWeight}kg
        - Height: ${profile.height}cm
        - Diagnosis: ${profile.diabetesType}
        - Medications: ${profile.medications.join(', ')}
        
        Recent History (Last 10 entries):
        - Glucose: ${JSON.stringify(glucose.slice(-10))}
        - Weight Trends: ${JSON.stringify(weights.slice(-10))}
        - Meals: ${JSON.stringify(meals.slice(-10))}
        - Activity: ${JSON.stringify(activities.slice(-10))}

        Provide a structured care plan in JSON format. Ensure all advice is medically sound but clearly marked as "to be discussed with a doctor".
    `;

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: this.carePlanSchema,
                temperature: 0.2, // Lower temperature for more consistent medical-style output
            }
        });

        return JSON.parse(response.text) as CarePlan;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Unable to synthesize care plan. Please ensure your API key is valid.");
    }
  }
}
