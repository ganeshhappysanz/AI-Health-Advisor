
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type FormType = 'glucose' | 'meal' | 'activity' | 'weight';

@Component({
  selector: 'app-data-input-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Quick Log</h2>
      <div class="flex flex-wrap gap-2 mb-6">
        <button *ngFor="let tab of formTypes"
          (click)="formType = tab"
          [class]="formType === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          class="px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all"
        >
          {{tab}}
        </button>
      </div>

      <form (ngSubmit)="handleSubmit()" class="space-y-4">
        <div [ngSwitch]="formType">
          <div *ngSwitchCase="'glucose'">
            <div class="space-y-3">
              <input type="number" [(ngModel)]="glucoseValue" name="v" placeholder="Value (mg/dL)" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
              <select [(ngModel)]="glucoseContext" name="c" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="fasting">Fasting</option>
                <option value="before-meal">Before Meal</option>
                <option value="after-meal">After Meal</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div *ngSwitchCase="'weight'">
             <input type="number" [(ngModel)]="weightValue" name="w" placeholder="Weight (kg)" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
          </div>

          <div *ngSwitchCase="'meal'">
            <div class="space-y-3">
              <input type="text" [(ngModel)]="mealDesc" name="md" placeholder="Description" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
              <input type="number" [(ngModel)]="mealCarbs" name="mc" placeholder="Carbs (g)" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>

          <div *ngSwitchCase="'activity'">
            <div class="space-y-3">
              <input type="text" [(ngModel)]="activityType" name="at" placeholder="Type (e.g. Walking)" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
              <input type="number" [(ngModel)]="activityDuration" name="ad" placeholder="Duration (min)" class="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
            </div>
          </div>
        </div>

        <button type="submit" class="w-full bg-gray-900 text-white py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-md">
          Save Entry
        </button>
      </form>
    </div>
  `
})
export class DataInputFormComponent {
  @Output() addData = new EventEmitter<{ data: any, type: FormType }>();

  formTypes: FormType[] = ['glucose', 'weight', 'meal', 'activity'];
  formType: FormType = 'glucose';

  glucoseValue = '';
  glucoseContext: any = 'fasting';
  weightValue = '';
  mealDesc = '';
  mealCarbs = '';
  activityType = '';
  activityDuration = '';

  handleSubmit() {
    const timestamp = new Date().toISOString();
    const id = 'log_' + Date.now();

    let data: any = { id, timestamp };

    if (this.formType === 'glucose' && this.glucoseValue) {
      data = { ...data, value: Number(this.glucoseValue), context: this.glucoseContext };
    } else if (this.formType === 'weight' && this.weightValue) {
      data = { ...data, value: Number(this.weightValue) };
    } else if (this.formType === 'meal' && this.mealDesc) {
      data = { ...data, description: this.mealDesc, carbs: Number(this.mealCarbs) };
    } else if (this.formType === 'activity' && this.activityType) {
      data = { ...data, type: this.activityType, duration: Number(this.activityDuration), intensity: 'medium' };
    } else {
      return;
    }

    this.addData.emit({ data, type: this.formType });
    this.reset();
  }

  private reset() {
    this.glucoseValue = '';
    this.weightValue = '';
    this.mealDesc = '';
    this.mealCarbs = '';
    this.activityType = '';
    this.activityDuration = '';
  }
}
