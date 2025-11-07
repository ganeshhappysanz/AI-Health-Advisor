
import React from 'react';
import { LightBulbIcon } from './IconComponents';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <LightBulbIcon className="w-8 h-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">AI Health Advisor</h1>
      </div>
    </header>
  );
};

export default Header;
