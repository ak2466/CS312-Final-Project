import React, { useState } from 'react';
import Button from './Button';
import {User, ChefHat} from 'lucide-react'


function NavBar(props) {
  const {
    username = "Username",
    currentView,
    onViewChange
    } = props;

  const pages = ['Home', 'Find', 'Recipe'];

  return (
    <header className="bg-red-500 h-16 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-[24px]">
        <div className="w-[98px] h-10 bg-white rounded flex items-center justify-center text-black shrink-0">
          <ChefHat size={24} />
        </div>

        {
          pages.map((page) => {
            if (page === currentView) return null;

            return (
              <Button
                key={page}
                variant="nav"
                className="w-[98px] h-10 flex justify-center items-center shrink-0"
                onClick={() => onViewChange(page)}
              >
              {page}
              </Button>
            );})
        }
      </div>

      <div className="flex items-center gap-3">
        <span className="text-white font-medium hidden md:block">
          Welcome, {username}
        </span>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 border-2 border-gray-200">
          <User size={20} />
        </div>
      </div>
    </header>
  );
}


export default NavBar;