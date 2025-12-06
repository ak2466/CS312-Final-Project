import { useState } from 'react'
import HomeView from './pages/HomeView'
import FindView from './pages/FindView'
import CreateView from './pages/CreateView'
import NavBar from './components/NavBar'
import RecipeView from './pages/RecipeView';
import SigninView from './pages/SigninView'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white font-sans flex flex-col">
        <NavBar username="User" />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/find" element={<FindView />} />
            <Route path="/create" element={<CreateView />} />
            <Route path="/recipe/:id" element={<RecipeView />} />
            <Route path="/signin" element={<SigninView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App
