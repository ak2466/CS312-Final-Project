import React, { useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { Search } from 'lucide-react';

const HomeView = () => (
  <>
    <div className="flex-1 bg-[url(/src/assets/top-view-table-full-food.jpg)] bg-center bg-cover">
      <section className="py-12 px-4 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl font-normal text-white mb-10 text-center tracking-tight">Featured Recipe</h1>

        <RecipeCard 
          recipe={{
            id: 0,
            title : "Example Featured Recipe", 
            description : "This is a test description", 
            tags : ["tag1", "tag2", "tag3"],
            image_url: null
          }}
        />

      </section>
    </div>
    
    <section className="bg-red-500 py-16 px-4 flex justify-center">
      <div className="relative w-full max-w-2xl">

        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <Search size={28} />
        </div>

        <input 
          type="text" 
          placeholder="Search Recipes" 
          className="w-full h-16 pl-14 pr-6 rounded-full border-2 border-gray-300 bg-gray-50 text-xl placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-0 shadow-sm transition-all"
        />

      </div>
    </section>
  </>
);

export default HomeView;