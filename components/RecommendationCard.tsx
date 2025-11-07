
import React from 'react';

interface RecommendationCardProps {
  title: string;
  recommendation: string;
  icon: React.ReactNode;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ title, recommendation, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-indigo-100 rounded-full mr-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {recommendation ? (
         <p className="text-gray-600 flex-grow">{recommendation}</p>
      ) : (
        <div className="space-y-2 flex-grow">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
