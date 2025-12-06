import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import { X, Plus } from 'lucide-react';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';


const CreateView = () => {

  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeCookTime, setCookTime] = useState('');
  const [recipeImgUrl, setImgUrl] = useState('')
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeSteps, setSteps] = useState(['']);
  const [recipeTags, setTags] = useState(['']);
  const [recipeIngs, setIngs] = useState([{ name: "", quantity: "", unit: "" }]);

  const recipeUserId = "1";
  const navigate = useNavigate();


  const handleTitleChange = (event) => {
    setRecipeTitle(event.target.value);
  };

    const handleDescriptionChange = (event) => {
    setRecipeDescription(event.target.value);
  };

  const handleCookTimeChange = (event) => {
    setCookTime(event.target.value);
  }

  const handleImgUrlChange = (event) => {
    console.log(recipeImgUrl);
    setImgUrl(event.target.value);
  }

  const handleAddTag = () => {
    setTags([...recipeTags, '']);
  }
  const handleRemoveTag = (index) => {
    setTags(recipeTags.filter((_, i) => i !== index))
  }

  const handleTagChange = (index, value) => {
    const newTags = recipeTags.map((tag, i) => {
      if (i === index) {
        return value;
      }
      
      return tag;
    });

    setTags(newTags);
  }

  const handleAddIng = () => {
    setIngs([...recipeIngs, { name: "", quantity: "", unit: "" }]);
  };

  const handleRemoveIng = (index) => {
    setIngs(recipeIngs.filter((_, i) => i !== index));
  };


  const handleIngChange = (index, field, value) => {
    setIngs(prev =>
      prev.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    );
  };

  const handleAddStep = () => {
    setSteps([...recipeSteps, '']);
  }

  const handleRemoveStep = () => {
    if(recipeSteps.length > 1) {
        setSteps(recipeSteps.slice(0, -1));
    }
  }

  const handleStepChange = (index, value) => {
    const newSteps = recipeSteps.map((step, i) => {

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recipe = {
      name:recipeTitle,
      description: recipeDescription,
      ingredients: recipeIngs,
      steps: recipeSteps,
      tags: recipeTags,
      cook_time: recipeCookTime,
      image_url: recipeImgUrl,
      user_id: recipeUserId
    }

    try {
      console.log(recipe);
      const res = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
      });

      if (res.ok) {
        navigate('/');
      } else {
        console.error('Failed to create recipe');
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="container mx-auto p-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/3 flex flex-col items-center space-y-8 bg-red-300 p-6 rounded-lg">
                
            <div className="w-64 h-64 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
              {recipeImgUrl ? (
                <img src={recipeImgUrl} alt={recipeTitle} className="w-full h-full object-cover" />
              ) : (
                <input
                type="text"
                placeholder='Image URL' 
                className="text-lg font-bold uppercase text-gray-500 mb-1 text-center bg-transparent border-none focus:ring-0 focus:outline-none"
                value={recipeImgUrl}
                onChange={handleImgUrlChange}
                />
              )}
            </div>

            <div className="w-full border-2 border-gray-400 p-4 bg-white text-center rounded">
              <h3 className="text-lg font-bold uppercase text-gray-500 mb-1 text-center">Cook Time</h3>
              <input
                type="text"
                placeholder='Cook Time (min)' 
                className="text-lg font-bold uppercase text-gray-500 mb-1 text-center bg-transparent border-none focus:ring-0 focus:outline-none"
                value={recipeCookTime}
                onChange={handleCookTimeChange}
              />
            </div>

            <div className="w-full">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {recipeTags.map((tag, i) => (
                  <div className='inline-flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-white text-sm rounded-full shadow-sm'>
                  <input
                    type="text"
                    placeholder="Enter tag"
                    value={tag}
                    onChange={(e) => handleTagChange(i, e.target.value)}
                    className='truncate max-w-[90px] bg-transparent border-none focus:ring-0 focus:outline-none'
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(i)}
                    className='p-1 rounded-full hover:bg-gray-800'
                  >
                    <X size={15}/>
                  </button>
                  </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddTag}
                    className='p-2 rounded-full text-gray-700 hover:bg-red-400 transition'
                >
                    <Plus size={15}/>
                </button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/3 space-y-8">

            <div className="border-b-2 border-dotted border-gray-300 pb-4">
              <input 
                  type="text" 
                  placeholder="Recipe Title" 
                  className="text-5xl font-bold text-gray-800 bg-transparent border-none focus:ring-0 focus:outline-none"
                  value={recipeTitle}
                  onChange={handleTitleChange}
              />
            </div>

            <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
              <input 
                  type="text" 
                  placeholder="Recipe Description" 
                  className="text-lg text-gray-800 leading-relaxed bg-transparent border-none focus:ring-0 focus:outline-none"
                  value={recipeDescription}
                  onChange={handleDescriptionChange}
              />
            </div>

            <div className="border-2 border-dotted border-gray-400 p-6 rounded bg-white relative">
              <h2 className="text-3xl font-bold mb-6 border-b border-gray-200 pb-2">Ingredients</h2>
               
              <ul className="space-y-3 text-lg">
                {recipeIngs.map((ing, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Qty"
                      value={ing.quantity}
                      onChange={(e) => handleIngChange(i, "quantity", e.target.value)}
                      className='bg-transparent border-none focus:ring-0 focus:outline-none'
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={ing.unit}
                      onChange={(e) => handleIngChange(i, "unit", e.target.value)}
                      className='bg-transparent border-none focus:ring-0 focus:outline-none'
                    />
                    <input
                      type="text"
                      placeholder="Name"
                      value={ing.name}
                      onChange={(e) => handleIngChange(i, "name", e.target.value)}
                      className='bg-transparent border-none focus:ring-0 focus:outline-none'
                    />
                    <button 
                      type='button'
                      onClick={() => handleRemoveIng(i)}
                      className='bg-transparent hover:bg-red-50 rounded-full p-1'
                    >
                      <X size={15}/>
                    </button>
                  </div>
                  
                ))}
              </ul>
              <div className="flex justify-end mt-4">
                <Button
                  variant="primary"
                  onClick={handleAddIng}
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Ingredient
                </Button>
              </div>
            </div>
            {recipeSteps.map((step, index) => (
                <div key={index} className="w-full mb-4 flex items-center">
                <span className="text-xl font-bold mr-3 text-gray-700">{index + 1}.</span>
                
                <input
                    type="text"
                    placeholder={`Step ${index + 1} instructions...`}
                    value={step} 
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="flex-grow h-14 pl-4 pr-6 rounded border-2 border-gray-300 bg-gray-50 text-lg placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-0 shadow-sm transition-all"
                />
                </div>
            ))}

            <div className='inline-flex gap-3 justify-center'>
              <Button
                  variant="primary"
                  onClick={handleAddStep}
              >
                  Add new step
              </Button>

              <Button
                  variant='text'
                  onClick={handleRemoveStep}
              >
                  Remove last step
              </Button>
            </div>

            <div className='flex justify-end'>
              <Button
                variant='primary'
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </div>

          </div>
        </div>
      </main>
    </div>
      
    </>
  );
}

export default CreateView;