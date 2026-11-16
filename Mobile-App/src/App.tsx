import React, { useState } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { PCBluetoothScreen } from './screens/PCBluetoothScreen';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'pc-bluetooth'>('home');

  const handleSelectCategory = (category: 'pc-bluetooth' | 'pc-wifi' | 'smartboard' | 'tv') => {
    if (category === 'pc-bluetooth') {
      setCurrentScreen('pc-bluetooth');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {currentScreen === 'home' && (
        <HomeScreen onSelectCategory={handleSelectCategory} />
      )}
      {currentScreen === 'pc-bluetooth' && (
        <PCBluetoothScreen onBack={() => setCurrentScreen('home')} />
      )}
    </main>
  );
};

export default App;
