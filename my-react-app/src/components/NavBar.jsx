import React, { useState } from 'react';
import Button from './Button';
import {User, ChefHat} from 'lucide-react'
import { Link, useLocation } from "react-router-dom";


function NavBar(props) {
  const {
    username = "Username",
  } = props;

  const pages = [
    { label: "Home", path: "/" },
    { label: "Find", path: "/find" },
    { label: "Create", path: "/create" }
  ];

  return (
    <header className="bg-red-500 h-16 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-[24px]">
        <div className="w-[98px] h-10 bg-white rounded flex items-center justify-center text-black shrink-0">
          <ChefHat size={24} />
        </div>

        {
          pages.map((page) => {
            const active = location.pathname === page.path;

            return (
              <Link key={page.path} to={page.path}>
                <Button
                  key={page}
                  variant="nav"
                  className={`w-[98px] h-10 flex justify-center items-center shrink-0 ${active ? "bg-white text-black" : ""}`}
                >
                  {page.label}
                </Button>
              </Link>
            );})
        }
      </div>

      <div className="flex items-center gap-3">
        <span className="text-white font-medium hidden md:block">
          Welcome, {username}
        </span>
          <Link key={`/signin`} to={`/signin`}>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 border-2 border-gray-200">
              <User size={20} />
            </div>
          </Link>
      </div>
    </header>
  );
}


export default NavBar;