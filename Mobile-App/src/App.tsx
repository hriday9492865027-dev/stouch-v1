import React, { useState } from 'react';
import { HomeScreen, type ScreenTarget } from './screens/HomeScreen';
import { PCBluetoothScreen } from './screens/PCBluetoothScreen';
import { PCWiFiScreen } from './screens/PCWiFiScreen';
import { SmartBoardScreen } from './screens/SmartBoardScreen';
import { TVScreen } from './screens/TVScreen';
import { TouchpadDeck } from './components/TouchpadDeck';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | ScreenTarget>('home');

  const handleSelectCategory = (target: ScreenTarget) => {
    setCurrentScreen(target);
  };

  const isWideDeck = currentScreen === 'touchpad-deck';

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex justify-center items-start sm:p-3 md:p-6 selection:bg-cyan-500 selection:text-white">
      {/* Responsive Viewport Frame: expands to max-w-4xl on PC widescreen for TouchpadDeck, max-w-md on menu */}
      <main className={`w-full ${isWideDeck ? 'max-w-4xl sm:min-h-[640px]' : 'max-w-md sm:min-h-[860px]'} min-h-screen sm:max-h-[920px] sm:rounded-3xl bg-[#070c18] text-slate-100 flex flex-col shadow-2xl sm:border sm:border-slate-800/80 sm:overflow-hidden relative transition-all duration-300`}>
        {/* Top desktop header bar (hidden in touch deck to maximize area) */}
        {!isWideDeck && (
          <div className="hidden sm:flex justify-between items-center px-6 pt-3 pb-1 text-[11px] font-medium text-slate-500 tracking-wider">
            <span>STouch Universal Controller</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Online</span>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto">
          {currentScreen === 'home' && (
            <HomeScreen onSelectCategory={handleSelectCategory} />
          )}

          {/* Full Direct Touchpad Deck (Matches User's Screenshots exactly) */}
          {currentScreen === 'touchpad-deck' && (
            <TouchpadDeck onBack={() => setCurrentScreen('home')} connectionMode="bluetooth" />
          )}

          {/* PC Screens */}
          {currentScreen === 'pc-bluetooth' && (
            <PCBluetoothScreen onBack={() => setCurrentScreen('home')} />
          )}
          {currentScreen === 'pc-wifi' && (
            <PCWiFiScreen onBack={() => setCurrentScreen('home')} />
          )}

          {/* Smart Board Screens */}
          {currentScreen === 'smartboard-bluetooth' && (
            <SmartBoardScreen initialMode="bluetooth" onBack={() => setCurrentScreen('home')} />
          )}
          {currentScreen === 'smartboard-wifi' && (
            <SmartBoardScreen initialMode="wifi" onBack={() => setCurrentScreen('home')} />
          )}

          {/* Smart TV Screens */}
          {currentScreen === 'tv-bluetooth' && (
            <TVScreen initialMode="bluetooth" onBack={() => setCurrentScreen('home')} />
          )}
          {currentScreen === 'tv-wifi' && (
            <TVScreen initialMode="wifi" onBack={() => setCurrentScreen('home')} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
