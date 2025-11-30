import React, { useState } from 'react';
import {Search} from 'lucide-react'

const FindView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]); // Default to empty array
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true);

    try {
        // db query code
        const data = NULL;

        setRecipes(data);

    } catch (error) {
        console.log("Error Fetching Recipes");

    } finally {
        setLoading(false);
    }

  }

  return (
  <>
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
    <div className="grid grid-cols-1 gap-4">
        {
            loading ? (<p>Loading...</p>) 
                : recipes.length > 0 ? ( recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipeData={recipe} />
                ))) 
                : (<p className="text-center text-gray-500">No recipes found.</p>)
        }
    </div>

  </> 
  );
};


export default FindView;

