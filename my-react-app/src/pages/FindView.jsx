import React, { useState } from 'react';
import { Search } from 'lucide-react'
import { Link } from "react-router-dom";
import RecipeCard from '../components/RecipeCard';

const FindView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  }

  const handleSearch = async () => {
    setLoading(true);

    try {
        // db query code
        const result = await fetch(`/api/search?search=${encodeURIComponent(searchTerm)}`);

        const data = await result.json();

        setRecipes(data.data);

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

        <button
          onClick={handleSearch}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <Search size={28} />
        </button>

        <input 
          type="text" 
          placeholder="Search Recipes" 
          value={searchTerm}
          onChange={handleChange}
          className="w-full h-16 pl-14 pr-6 rounded-full border-2 border-gray-300 bg-gray-50 text-xl placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-0 shadow-sm transition-all"
        />

      </div>
    </section>
    <div className="grid grid-cols-1 gap-4">
        {
            loading ? (<p>Loading...</p>) 
                : recipes.length > 0 ? ( recipes.map((recipe) => (
                  <Link key={recipe.recipe_id} to={`/recipe/${recipe.recipe_id}`}>
                    <RecipeCard recipeData={recipe} />
                  </Link>
                ))) 
                : (<p className="text-center text-gray-500">No recipes found.</p>)
        }
    </div>

  </> 
  );
};


export default FindView;

