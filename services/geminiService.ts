
import { GoogleGenAI, Type } from "@google/genai";
import type { UserData, Recommendations } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        dietary: {
            type: Type.STRING,
            description: "Actionable dietary advice based on user data. Focus on meal composition, carb intake, and food order.",
        },
        activity: {
            type: Type.STRING,
            description: "Specific suggestions for physical activity, including type, duration, and timing relative to meals.",
        },
        medication: {
            type: Type.STRING,
            description: "General guidance on medication/insulin. Frame as topics to discuss with a healthcare provider, not a direct order.",
        },
    },
    required: ["dietary", "activity", "medication"],
};


export const getPersonalizedRecommendations = async (userData: UserData): Promise<Recommendations> => {
    const prompt = `
        Analyze the following user health data to provide personalized recommendations.
        The user is trying to manage their glucose levels.

        User Data:
        - Recent Glucose Readings (mg/dL): ${JSON.stringify(userData.glucoseReadings.slice(-5))}
        - Recent Meals: ${JSON.stringify(userData.meals.slice(-5))}
        - Recent Activities: ${JSON.stringify(userData.activities.slice(-5))}

        Based on this data, provide concise, actionable recommendations in three key areas:
        1.  Dietary Guidance: How can the user improve their diet to better manage glucose spikes?
        2.  Activity Suggestions: What physical activities would be beneficial, and when should they be performed?
        3.  Medication/Insulin Guidance: What should the user consider regarding their medication or insulin? Remind them to consult their doctor before making any changes.

        Your response must be a valid JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
            }
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        return parsedResponse as Recommendations;
    } catch (error) {
        console.error("Error fetching recommendations from Gemini API:", error);
        throw new Error("Failed to get recommendations. Please check your API key and network connection.");
    }
};
