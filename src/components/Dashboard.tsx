
import { Component, OnInit, signal, computed, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../services/db.service';
import { GeminiService } from '../services/geminiService';
import type { UserProfile, CarePlan, GlucoseReading, Meal, Activity, WeightLog } from '../types';

import { DataInputFormComponent } from './DataInputForm';
import { GlucoseChartComponent } from './GlucoseChart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DataInputFormComponent, GlucoseChartComponent],
  template: `
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
      <!-- Sidebar: Patient Profile Summary -->
      <div class="xl:col-span-1 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center space-x-4 mb-4">
            <div class="bg-indigo-100 p-3 rounded-full text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900">{{ profile.fullName }}</h3>
              <p class="text-xs text-gray-500">{{ profile.diabetesType }} Patient</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm mb-6">
            <div class="bg-gray-50 p-3 rounded-lg">
              <span class="block text-xs text-gray-500">Weight</span>
              <span class="font-bold text-indigo-600">{{ latestWeight() }}kg</span>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
              <span class="block text-xs text-gray-500">Goal</span>
              <span class="font-bold text-green-600">{{ profile.targetWeight }}kg</span>
            </div>
          </div>
          <div class="space-y-2">
            <button (click)="onLogout.emit()" class="w-full py-2 text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Switch Profile
            </button>
          </div>
        </div>

        <app-data-input-form (addData)="handleAddData($event)"></app-data-input-form>
      </div>

      <!-- Main Content Area -->
      <div class="xl:col-span-3 space-y-8">
        <!-- AI Care Plan Section -->
        <div class="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Personalized Care Plan</h2>
              <p class="text-gray-500 text-sm">AI-synthesized based on your latest biometric data.</p>
            </div>
            <button (click)="generatePlan()" [disabled]="isLoading()" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center shadow-lg">
               <span *ngIf="isLoading()" class="animate-spin mr-2">◌</span>
               {{ isLoading() ? 'Synthesizing...' : 'Refresh Care Plan' }}
            </button>
          </div>

          <div *ngIf="carePlan()" class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="p-5 bg-blue-50 rounded-xl border border-blue-100">
                <h4 class="font-bold text-blue-900 mb-2 flex items-center">
                   <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                   Dietary Strategy
                </h4>
                <p class="text-sm text-blue-800 leading-relaxed">{{ carePlan()?.dietaryStrategy }}</p>
             </div>
             <div class="p-5 bg-green-50 rounded-xl border border-green-100">
                <h4 class="font-bold text-green-900 mb-2 flex items-center">
                   <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   Activity Plan
                </h4>
                <p class="text-sm text-green-800 leading-relaxed">{{ carePlan()?.physicalActivityPlan }}</p>
             </div>
             <div class="p-5 bg-purple-50 rounded-xl border border-purple-100">
                <h4 class="font-bold text-purple-900 mb-2 flex items-center">
                   <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                   Weight Goals
                </h4>
                <p class="text-sm text-purple-800 leading-relaxed">{{ carePlan()?.weightManagementGoals }}</p>
             </div>
             <div class="p-5 bg-red-50 rounded-xl border border-red-100" *ngIf="carePlan()?.alerts?.length">
                <h4 class="font-bold text-red-900 mb-2 flex items-center">
                   <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   Health Alerts
                </h4>
                <ul class="list-disc list-inside text-sm text-red-800 space-y-1">
                   <li *ngFor="let alert of carePlan()?.alerts">{{ alert }}</li>
                </ul>
             </div>
          </div>

          <div *ngIf="!carePlan() && !isLoading()" class="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <p class="text-gray-400">Log your first metrics to generate a care plan.</p>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 class="font-bold text-gray-900 mb-4">Glucose Trend (mg/dL)</h3>
             <app-glucose-chart [readings]="glucoseReadings" />
           </div>
           <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 class="font-bold text-gray-900 mb-4">Weight Progress (kg)</h3>
             <!-- Reuse chart for weight by mapping values -->
             <div *ngIf="weightLogs().length < 2" class="text-center py-12 text-gray-400 text-sm">
                Need at least 2 logs to show progress.
             </div>
             <app-glucose-chart *ngIf="weightLogs().length >= 2" [readings]="simulatedWeightReadings()" />
           </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  @Input({ required: true }) profile!: UserProfile;
  @Output() onLogout = new EventEmitter<void>();

  glucoseReadings = signal<GlucoseReading[]>([]);
  weightLogs = signal<WeightLog[]>([]);
  meals = signal<Meal[]>([]);
  activities = signal<Activity[]>([]);
  carePlan = signal<CarePlan | null>(null);
  isLoading = signal(false);

  latestWeight = computed(() => {
    const logs = this.weightLogs();
    return logs.length ? logs[logs.length - 1].value : this.profile.weight;
  });

  // Map weights to glucose types just to reuse the SVG chart component
  simulatedWeightReadings = computed(() => {
    return this.weightLogs().map(w => ({
      id: w.id,
      value: w.value,
      timestamp: w.timestamp,
      context: 'other' as const,
      patientId: w.patientId
    }));
  });

  constructor(private db: DatabaseService, private gemini: GeminiService) {}

  async ngOnInit() {
    await this.refreshData();
  }

  async refreshData() {
    this.glucoseReadings.set(await this.db.getEntriesByPatient('glucose', this.profile.id));
    this.weightLogs.set(await this.db.getEntriesByPatient('weights', this.profile.id));
    this.meals.set(await this.db.getEntriesByPatient('meals', this.profile.id));
    this.activities.set(await this.db.getEntriesByPatient('activities', this.profile.id));
  }

  async handleAddData(event: any) {
    const entry = { ...event.data, patientId: this.profile.id };
    const storeMap: Record<string, string> = {
      'glucose': 'glucose',
      'meal': 'meals',
      'activity': 'activities',
      'weight': 'weights'
    };
    
    await this.db.addEntry(storeMap[event.type], entry);
    await this.refreshData();
  }

  async generatePlan() {
    this.isLoading.set(true);
    try {
      const plan = await this.gemini.generateCarePlan(
        this.profile,
        this.glucoseReadings(),
        this.meals(),
        this.activities(),
        this.weightLogs()
      );
      this.carePlan.set(plan);
    } catch (e) {
      alert("AI synthesis failed. Using offline baseline.");
    } finally {
      this.isLoading.set(false);
    }
  }
}
