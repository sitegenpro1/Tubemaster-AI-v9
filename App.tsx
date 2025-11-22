
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { KeywordFinder } from './pages/KeywordFinder';
import { ScriptGenerator } from './pages/ScriptGenerator';
import { ThumbnailGenerator } from './pages/ThumbnailGenerator';
import { ThumbnailCompare } from './pages/ThumbnailCompare';
import { CompetitorAnalysis } from './pages/CompetitorAnalysis';
import { TitleTime } from './pages/TitleTime';

function App() {
  // Simple state-based navigation instead of react-router
  const [currentView, setCurrentView] = useState('home');

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onNavigate={setCurrentView} />;
      case 'keywords':
        return <KeywordFinder />;
      case 'script':
        return <ScriptGenerator />;
      case 'thumbnail-gen':
        return <ThumbnailGenerator />;
      case 'compare':
        return <ThumbnailCompare />;
      case 'competitors':
        return <CompetitorAnalysis />;
      case 'title-time':
        return <TitleTime />;
      default:
        return <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default App;
