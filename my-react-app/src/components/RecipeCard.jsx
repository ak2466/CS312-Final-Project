import React, { useState } from 'react';
import Button from './Button';
import { MoreHorizontal } from 'lucide-react';


const RecipeCard = ( recipe ) => {
  
  const { 
    id,
    name = "Untitled Recipe", 
    description = "No description provided.", 
    tags = [],
    image_url = null
  } = recipe.recipeData;

  console.log("Recipe: ", recipe.recipeData)

  return (
    <div className="bg-white border border-black w-full max-w-3xl p-6 relative shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
    
        <div className="shrink-0">
          {image_url ? (
            <img 
              src={image_url} 
              alt={name} 
              className="w-40 h-40 rounded-full object-cover border-2 border-gray-300"
            />
          ) : (

            <div className="w-40 h-40 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-50 text-center p-4">
              <span className="text-gray-400 text-sm font-medium">No Image</span>
            </div>
          )}
        </div>

        <div className="flex-1 w-full">
          <div className="border-b border-gray-200 pb-2 mb-2">
              <h2 className="text-2xl font-bold">
                {name}
              </h2>
          </div>
          
          <p className="text-gray-600 mb-6 min-h-[4rem]">
            {description}
          </p>

          <div className="flex items-center gap-2 flex-wrap pt-4">
              
            {tags && tags.length > 0 && tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold"
              >
                {tag}
              </span>
            ))}

            {tags && tags.length > 3 && (
                <MoreHorizontal size={24} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

