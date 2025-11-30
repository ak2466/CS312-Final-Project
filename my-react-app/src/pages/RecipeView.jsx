import { useState } from "react";
import {useParams} from "react-router-dom";


const RecipeView = () => {
  const {id} = useParams();
  // 
  //const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const recipe = {
        id: id,
        title: "Test",
        description: "This is a test recipe",
        cookTime: "100 mins",
        image_url: null,
        tags: ["tag1", "tag2", "tag3"],
        ingredients: [
          "2 mesure ingredient 1",
          "1 mesure ingredient 2",
          "1 mesure ingredient 3",
          "4 mesure ingredient 4",
          "2 mesure ingredient 5",
          "1 mesure ingredient 6"
        ]
      };

  //if (loading) return <div className="text-center mt-20">Loading Recipe...</div>;
  //if (!recipe) return <div className="text-center mt-20">Recipe not found</div>;

  const loadRecipe = async () => {

    setLoading(true);

    try {
      //query here
      const data = null;

    } catch (e) {
      console
    } finally {
      setLoading(false);
    }

  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="container mx-auto p-8 flex-grow">
        <div className="flex flex-col md:flex-row gap-12">
          
          <div className="w-full md:w-1/3 flex flex-col items-center md:items-start space-y-8 bg-red-300 p-6 rounded-lg">
            
            <div className="w-64 h-64 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center overflow-hidden shadow-lg">
              {recipe.image_url ? (
                <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 font-bold text-xl">Recipe Image</span>
              )}
            </div>

            <div className="w-full border-2 border-dotted border-gray-400 p-4 bg-white text-center rounded">
              <h3 className="text-lg font-bold uppercase text-gray-500 mb-1">Cook Time</h3>
              <p className="text-2xl font-bold text-black">{recipe.cookTime}</p>
            </div>

            <div className="w-full">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {recipe.tags.map((tag, i) => (
                  <span key={i} className="bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 space-y-8">
          
            <div className="border-b-2 border-dotted border-gray-300 pb-4">
              <h1 className="text-5xl font-bold text-gray-800">{recipe.title}</h1>
            </div>

            <div className="bg-white p-6 rounded border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-2 text-gray-600">Description</h2>
              <p className="text-lg text-gray-800 leading-relaxed">
                {recipe.description}
              </p>
            </div>

            <div className="border-2 border-dotted border-gray-400 p-6 rounded bg-white relative">
               <h2 className="text-3xl font-bold mb-6 border-b border-gray-200 pb-2">Ingredients</h2>
               
               <ul className="space-y-3 text-lg">
                 {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                   <li key={i} className="flex items-center">
                     <span className="mr-2 text-gray-400">•</span>
                     {ing}
                   </li>
                 ))}
               </ul>
            </div>

          </div>
        </div>
      </main>
    </div>);
}

export default RecipeView;
