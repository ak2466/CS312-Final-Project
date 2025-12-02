import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import { Search } from 'lucide-react';
import { Link } from "react-router-dom";

const HomeView = () => {

  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [steps, setSteps] = useState(['']);

  const handleTitleChange = (event) => {
    setRecipeTitle(event.target.value);
  };

    const handleDescriptionChange = (event) => {
    setRecipeDescription(event.target.value);
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  }

  const handleRemoveStep = () => {
    if(steps.length > 1) {
        setSteps(steps.slice(0, -1));
    }
  }

  const handleStepChange = (index, value) => {
    const newSteps = steps.map((step, i) => {

    // If the index matches the step being edited, return the new value
      if (i === index) {
        return value;
      }
    // Otherwise, return the original step value
      return step;

    })

    // Update the state with the new array
    setSteps(newSteps);

  }


  return (
    <>
      <div className="flex-1 bg-center bg-cover">
        <section className="py-12 px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl font-normal mb-10 text-center tracking-tight">Create Recipe</h1>

        <input 
            type="text" 
            placeholder="Recipe Title" 
            className="w-1/2 h-16 pl-14 pr-6 border-2 border-gray-300 bg-gray-50 text-xl placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-0 shadow-sm transition-all"
            value={recipeTitle}
            onChange={handleTitleChange}
        />

        <input 
            type="text" 
            placeholder="Description" 
            className="w-1/2 h-32 pl-14 pr-6 border-2 border-gray-300 bg-gray-50 text-m placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-0 shadow-sm transition-all"
            value={recipeDescription}
            onChange={handleDescriptionChange}
        />

        {steps.map((step, index) => (
            <div key={index} className="w-full mb-4 flex items-center">
            {/* Step number label */}
            <span className="text-xl font-bold mr-3 text-gray-700">{index + 1}.</span>
            
            <input
                type="text"
                placeholder={`Step ${index + 1} instructions...`}
                // Bind the input's value to the specific step in the array
                value={step} 
                // Use the index to know which step in the array to update
                onChange={(e) => handleStepChange(index, e.target.value)}
                className="flex-grow h-14 pl-4 pr-6 rounded border-2 border-gray-300 bg-gray-50 text-lg placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-0 shadow-sm transition-all"
            />
            </div>
        ))}

        <button
            type="button"
            className="border-2 border-gray-300 bg-gray-50"
            onClick={handleAddStep}
        >
            Add new step
        </button>

        <button
            type="button"
            className="border-2 border-gray-300 bg-gray-50"
            onClick={handleRemoveStep}
        >
            Remove last step
        </button>

        </section>
      </div>
      
    </>
  );
}

export default HomeView;