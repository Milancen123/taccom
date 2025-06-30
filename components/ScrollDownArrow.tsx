"use client";
import React from "react";
import { ArrowDown } from "lucide-react";

const ScrollDownArrow = () => {
  return (
    <div className="fixed bottom-20 right-6 z-50">
      <button className="w-8 h-8 rounded-full bg-gray-700 border-[1px] flex items-center justify-center hover:bg-gray-900 transition">
        <ArrowDown className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default ScrollDownArrow;
