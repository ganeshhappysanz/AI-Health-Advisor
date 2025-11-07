import React from 'react';
import type { GlucoseReading } from '../types';

interface GlucoseChartProps {
  readings: GlucoseReading[];
}

const GlucoseChart: React.FC<GlucoseChartProps> = ({ readings }) => {
  if (readings.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg mb-4">
        <p className="text-gray-500 text-sm px-4 text-center">Log at least two glucose readings to see a trend chart.</p>
      </div>
    );
  }

  // Sort readings by timestamp to ensure the line is drawn correctly
  const sortedReadings = [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const width = 500;
  const height = 200;
  const padding = 40;

  const minGlucose = Math.min(...sortedReadings.map(r => r.value)) - 10;
  const maxGlucose = Math.max(...sortedReadings.map(r => r.value)) + 10;
  const startTime = new Date(sortedReadings[0].timestamp).getTime();
  const endTime = new Date(sortedReadings[sortedReadings.length - 1].timestamp).getTime();
  const timeRange = endTime - startTime;

  const getX = (timestamp: string) => {
    if (timeRange === 0) {
      return padding + (width - padding * 2) / 2;
    }
    const date = new Date(timestamp).getTime();
    return ((date - startTime) / timeRange) * (width - padding * 2) + padding;
  };

  const getY = (value: number) => {
    const glucoseRange = maxGlucose - minGlucose;
     if (glucoseRange === 0) {
      return height / 2;
    }
    return height - (((value - minGlucose) / glucoseRange) * (height - padding * 2) + padding);
  };

  const pathD = sortedReadings
    .map((reading, i) => {
      const x = getX(reading.timestamp);
      const y = getY(reading.value);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
    
  const formatDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  return (
    <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Glucose Trend</h4>
        <div className="bg-gray-50 p-2 rounded-lg">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title" role="img">
                <title id="chart-title">Glucose Level Trend Chart</title>
                {/* Y-axis labels and grid line */}
                <text x={padding - 10} y={padding} dy=".3em" textAnchor="end" className="text-xs fill-current text-gray-500">{Math.round(maxGlucose)}</text>
                <line x1={padding} y1={padding} x2={width-padding} y2={padding} className="stroke-current text-gray-200" strokeDasharray="2" />

                <text x={padding - 10} y={height - padding} dy=".3em" textAnchor="end" className="text-xs fill-current text-gray-500">{Math.round(minGlucose)}</text>
                
                {/* Y-axis line */}
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="stroke-current text-gray-300" />

                {/* X-axis labels */}
                <text x={padding} y={height - padding + 20} textAnchor="start" className="text-xs fill-current text-gray-500">{formatDateLabel(sortedReadings[0].timestamp)}</text>
                <text x={width - padding} y={height - padding + 20} textAnchor="end" className="text-xs fill-current text-gray-500">{formatDateLabel(sortedReadings[sortedReadings.length - 1].timestamp)}</text>
                {/* X-axis line */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-current text-gray-300" />


                {/* Chart Line */}
                <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points */}
                {sortedReadings.map(reading => (
                    <circle
                        key={reading.id}
                        cx={getX(reading.timestamp)}
                        cy={getY(reading.value)}
                        r="4"
                        fill="white"
                        stroke="#4f46e5"
                        strokeWidth="2"
                        className="transition-transform duration-300 ease-in-out hover:scale-150"
                    >
                      <title>{`Value: ${reading.value} mg/dL at ${new Date(reading.timestamp).toLocaleString()}`}</title>
                    </circle>
                ))}
            </svg>
        </div>
    </div>
  );
};

export default GlucoseChart;
