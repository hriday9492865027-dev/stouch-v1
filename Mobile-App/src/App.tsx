import React, { useState } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { PCBluetoothScreen } from './screens/PCBluetoothScreen';
import { PCWiFiScreen } from './screens/PCWiFiScreen';
import { SmartBoardScreen } from './screens/SmartBoardScreen';
import { TVScreen } from './screens/TVScreen';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'pc-bluetooth' | 'pc-wifi' | 'smartboard' | 'tv'>('home');

  const handleSelectCategory = (category: 'pc-bluetooth' | 'pc-wifi' | 'smartboard' | 'tv') => {
    setCurrentScreen(category);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center items-start sm:py-6 selection:bg-cyan-500 selection:text-white">
      {/* Smartphone frame container */}
      <main className="w-full max-w-md min-h-screen sm:min-h-[860px] sm:max-h-[920px] sm:rounded-3xl bg-slate-950 text-slate-100 flex flex-col shadow-2xl sm:border sm:border-slate-800/80 sm:overflow-hidden relative">
        {/* Subtle top indicator for desktop preview */}
        <div className="hidden sm:flex justify-between items-center px-6 pt-3 pb-1 text-[11px] font-medium text-slate-500 tracking-wider">
          <span>STouch Mobile</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {currentScreen === 'home' && (
            <HomeScreen onSelectCategory={handleSelectCategory} />
          )}
          {currentScreen === 'pc-bluetooth' && (
            <PCBluetoothScreen onBack={() => setCurrentScreen('home')} />
          )}
          {currentScreen === 'pc-wifi' && (
            <PCWiFiScreen onBack={() => setCurrentScreen('home')} />
          )}
          {currentScreen === 'smartboard' && (
            <SmartBoardScreen onBack={() => setCurrentScreen('home')} />
          )}
          {currentScreen === 'tv' && (
            <TVScreen onBack={() => setCurrentScreen('home')} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
