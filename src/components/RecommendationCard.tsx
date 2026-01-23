import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
      <div class="flex items-center mb-4">
        <div class="p-2 bg-indigo-100 rounded-full mr-4">
          <ng-content></ng-content> <!-- Icon projection -->
        </div>
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
      </div>
      <p *ngIf="recommendation; else loading" class="text-gray-600 flex-grow">{{ recommendation }}</p>
      <ng-template #loading>
        <div class="space-y-2 flex-grow">
            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </ng-template>
    </div>
  `
})
export class RecommendationCardComponent {
  @Input() title: string = '';
  @Input() recommendation: string = '';
}
