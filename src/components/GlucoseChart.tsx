import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { GlucoseReading } from '../types';

@Component({
  selector: 'app-glucose-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6" *ngIf="readings().length > 0; else noData">
        <h4 class="text-md font-semibold text-gray-700 mb-2">Glucose Trend</h4>
        <div class="bg-gray-50 p-2 rounded-lg relative" *ngIf="readings().length >= 2; else notEnoughData">
            <svg [attr.viewBox]="'0 0 ' + chartConfig.width + ' ' + chartConfig.height" class="w-full h-auto" aria-labelledby="chart-title" role="img">
                <title id="chart-title">Glucose Level Trend Chart</title>
                
                <text [attr.x]="chartConfig.padding - 10" [attr.y]="chartConfig.padding" dy=".3em" text-anchor="end" class="text-xs fill-current text-gray-500">{{ chartData().maxGlucose.toFixed(0) }}</text>
                <line [attr.x1]="chartConfig.padding" [attr.y1]="chartConfig.padding" [attr.x2]="chartConfig.width - chartConfig.padding" [attr.y2]="chartConfig.padding" class="stroke-current text-gray-200" stroke-dasharray="2" />

                <text [attr.x]="chartConfig.padding - 10" [attr.y]="height - chartConfig.padding" dy=".3em" text-anchor="end" class="text-xs fill-current text-gray-500">{{ chartData().minGlucose.toFixed(0) }}</text>
                <line [attr.x1]="chartConfig.padding" [attr.y1]="chartConfig.padding" [attr.x2]="chartConfig.padding" [attr.y2]="height - chartConfig.padding" class="stroke-current text-gray-300" />

                <text [attr.x]="chartConfig.padding" [attr.y]="height - chartConfig.padding + 20" text-anchor="start" class="text-xs fill-current text-gray-500">{{ formatDateLabel(chartData().sortedReadings[0].timestamp) }}</text>
                <text [attr.x]="width - chartConfig.padding" [attr.y]="height - chartConfig.padding + 20" text-anchor="end" class="text-xs fill-current text-gray-500">{{ formatDateLabel(chartData().sortedReadings[chartData().sortedReadings.length - 1].timestamp) }}</text>
                <line [attr.x1]="chartConfig.padding" [attr.y1]="height - chartConfig.padding" [attr.x2]="width - chartConfig.padding" [attr.y2]="height - chartConfig.padding" class="stroke-current text-gray-300" />

                <path [attr.d]="chartData().pathD" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

                <g *ngFor="let reading of chartData().sortedReadings">
                  <circle
                      [attr.cx]="getX(reading.timestamp)"
                      [attr.cy]="getY(reading.value)"
                      [attr.r]="activePoint()?.id === reading.id ? 6 : 4"
                      fill="white"
                      stroke="#4f46e5"
                      stroke-width="2"
                      class="transition-all duration-150 ease-in-out cursor-pointer"
                      (mouseenter)="activePoint.set(reading)"
                      (mouseleave)="activePoint.set(null)"
                  />
                </g>
                
                <g *ngIf="activePoint()" 
                    [attr.transform]="'translate(' + getX(activePoint()!.timestamp) + ', ' + getY(activePoint()!.value) + ')'"
                    class="pointer-events-none">
                    <foreignObject x="10" y="-50" width="160" height="60">
                       <div class="bg-gray-800 text-white text-xs rounded-lg p-2 shadow-lg">
                            <div><strong>Value:</strong> {{ activePoint()!.value }} mg/dL</div>
                            <div class="mt-1 opacity-80">{{ formatDate(activePoint()!.timestamp) }}</div>
                       </div>
                    </foreignObject>
                </g>
            </svg>
        </div>
        <ng-template #notEnoughData>
            <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg mb-4">
                <p class="text-gray-500 text-sm px-4 text-center">Log at least two glucose readings to see a trend chart.</p>
            </div>
        </ng-template>
    </div>
    <ng-template #noData></ng-template>
  `
})
export class GlucoseChartComponent {
    @Input({ required: true }) readings = signal<GlucoseReading[]>([]);
    
    activePoint = signal<GlucoseReading | null>(null);

    chartConfig = { width: 500, height: 200, padding: 40 };
    width = this.chartConfig.width;
    height = this.chartConfig.height;

    chartData = computed(() => {
        const sortedReadings = [...this.readings()].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const values = sortedReadings.map(r => r.value);
        const minGlucose = Math.min(...values) - 10;
        const maxGlucose = Math.max(...values) + 10;
        const startTime = new Date(sortedReadings[0].timestamp).getTime();
        const endTime = new Date(sortedReadings[sortedReadings.length - 1].timestamp).getTime();
        const timeRange = endTime - startTime;
        
        const pathD = sortedReadings
            .map((reading, i) => {
                const x = this.getX(reading.timestamp, startTime, timeRange);
                const y = this.getY(reading.value, minGlucose, maxGlucose);
                return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
            })
            .join(' ');
            
        return { sortedReadings, minGlucose, maxGlucose, startTime, endTime, timeRange, pathD };
    });

    getX(timestamp: string, startTime?: number, timeRange?: number) {
        const start = startTime ?? this.chartData().startTime;
        const range = timeRange ?? this.chartData().timeRange;
        if (range === 0) return this.chartConfig.padding + (this.width - this.chartConfig.padding * 2) / 2;
        const date = new Date(timestamp).getTime();
        return ((date - start) / range) * (this.width - this.chartConfig.padding * 2) + this.chartConfig.padding;
    }

    getY(value: number, minGlucose?: number, maxGlucose?: number) {
        const minG = minGlucose ?? this.chartData().minGlucose;
        const maxG = maxGlucose ?? this.chartData().maxGlucose;
        const glucoseRange = maxG - minG;
        if (glucoseRange === 0) return this.height / 2;
        return this.height - (((value - minG) / glucoseRange) * (this.height - this.chartConfig.padding * 2) + this.chartConfig.padding);
    }

    formatDateLabel = (timestamp: string) => {
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    formatDate = (dateString: string) => new Date(dateString).toLocaleString();
}
