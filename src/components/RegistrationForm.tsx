
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { UserProfile, DiabetesType } from '../types';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-indigo-600 px-8 py-6">
        <h2 class="text-2xl font-bold text-white">Patient Enrollment</h2>
        <p class="text-indigo-100 text-sm mt-1">Please provide accurate health details for your personalized diabetic care plan.</p>
      </div>
      
      <form (ngSubmit)="submit()" class="p-8 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Legal Name</label>
            <input type="text" [(ngModel)]="model.fullName" name="fullName" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="John Doe">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="number" [(ngModel)]="model.age" name="age" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="45">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Current Weight (kg)</label>
            <input type="number" [(ngModel)]="model.weight" name="weight" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="85">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input type="number" [(ngModel)]="model.height" name="height" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="175">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Diabetes Diagnosis</label>
            <select [(ngModel)]="model.diabetesType" name="diabetesType" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
              <option value="Type 1">Type 1</option>
              <option value="Type 2">Type 2</option>
              <option value="Gestational">Gestational</option>
              <option value="Pre-diabetic">Pre-diabetic</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Target Weight (kg)</label>
            <input type="number" [(ngModel)]="model.targetWeight" name="targetWeight" required class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="75">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Medications (Comma separated)</label>
          <input type="text" [(ngModel)]="medsInput" name="meds" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Metformin, Lisinopril...">
        </div>

        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
           <div class="flex items-start">
             <input type="checkbox" required class="mt-1 h-4 w-4 text-indigo-600 rounded">
             <p class="ml-3 text-xs text-blue-800">
               I acknowledge that this system is for management tracking and does not replace medical consultation. 
               Data is stored locally on this device for privacy.
             </p>
           </div>
        </div>

        <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg transform active:scale-95 transition-all">
          Register & Initialize Profile
        </button>
      </form>
    </div>
  `
})
export class RegistrationFormComponent {
  @Output() register = new EventEmitter<UserProfile>();

  model: Partial<UserProfile> = {
    diabetesType: 'Type 2',
    targetGlucoseRange: { min: 70, max: 130 }
  };
  medsInput: string = '';

  submit() {
    const profile: UserProfile = {
      id: 'patient_' + Date.now(),
      fullName: this.model.fullName || 'Anonymous',
      age: Number(this.model.age) || 0,
      weight: Number(this.model.weight) || 0,
      height: Number(this.model.height) || 0,
      diabetesType: this.model.diabetesType as DiabetesType,
      medications: this.medsInput.split(',').map(m => m.trim()).filter(m => m),
      targetWeight: Number(this.model.targetWeight) || 0,
      targetGlucoseRange: this.model.targetGlucoseRange || { min: 70, max: 130 },
      registeredAt: new Date().toISOString()
    };
    this.register.emit(profile);
  }
}
