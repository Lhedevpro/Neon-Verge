import React from 'react';
import HeroNFT from './components/HeroNFT';
import './App.css';

function App() {
  return (
    <div className="App" style={{ '--background-image': 'url(/imgs/Fond.jpg)' }}>
      <header className="App-header">
      <img src="/imgs/Logo.png" alt="Neon Verge Logo" className="App-logo" />
      <h1>Neon Verge Heroes</h1>
      </header>
      <main>
        <HeroNFT />
      </main>
      <footer className="App-header">
        <p>Neon Verge © 2025</p>
        <p>
          Available for freelance Web3 missions. Reach me on&nbsp;
          <a href="https://twitter.com/UnblinkingEyeNG" target="_blank">X</a>.
        </p>
      </footer>
    </div>
  );
}

export default App;
