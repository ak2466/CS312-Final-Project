import { useState } from 'react'
import HomeView from './pages/HomeView'
import FindView from './pages/FindView'
import NavBar from './components/NavBar'
import RecipeView from './pages/RecipeView';

function App() {
    const [currentView, setCurrentView] = useState('Home');

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">

      <NavBar 
        username="User" 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      
      <main className="flex-1 flex flex-col">
        {currentView === 'Home' && <HomeView />}
        {currentView === 'Find' && <FindView />}
        {currentView === 'Recipe' && <RecipeView />}
      </main>

    </div>
  );
}

export default App
