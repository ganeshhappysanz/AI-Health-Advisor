
import React from 'react';
import Dashboard from './components/Dashboard';
import Header from './components/Header';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <Dashboard />
      </main>
      <footer className="text-center p-4 text-gray-500 text-xs">
          <p>&copy; 2024 AI Health Advisor. All Rights Reserved.</p>
          <p className="mt-1 font-semibold text-red-500">Disclaimer: This is not medical advice. Always consult with a healthcare professional for medical decisions.</p>
      </footer>
    </div>
  );
};

export default App;
