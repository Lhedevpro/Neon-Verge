import React from 'react';
import HeroNFT from './components/HeroNFT';
import './App.css';

function App() {
  return (
    <div className="App" style={{ '--background-image': 'url(/imgs/Fond.jpg)' }}>
      <header className="App-header">
        <h1>Neon Verge Heroes</h1>
      </header>
      <main>
        <HeroNFT />
      </main>
    </div>
  );
}

export default App;
