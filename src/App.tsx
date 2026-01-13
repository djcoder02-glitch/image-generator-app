import { useState } from 'react';
import './App.css';
import MainScreen from './components/MainScreen';
import Screen1 from './components/Screen1';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'main' | 'screen1'>('main');

  return (
    <div className="app-container">
      {currentScreen === 'main' && (
        <MainScreen onStart={() => setCurrentScreen('screen1')} />
      )}
      {currentScreen === 'screen1' && (
        <Screen1 onBack={() => setCurrentScreen('main')} />
      )}
    </div>
  );
}

export default App;
