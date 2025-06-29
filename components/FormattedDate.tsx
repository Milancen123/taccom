"use client"
import React from "react";



function formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
  
    // Helper to zero time for accurate comparisons
    const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  
    const target = stripTime(date);
    const today = stripTime(now);
    const diffTime = today.getTime() - target.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays > 1 && diffDays <= 6) {
      const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return weekdayNames[date.getDay()];
    }
  
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
  
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
  
    return `${day} ${month} ${year}`;
  }
  
  interface FormattedDateProps{
    timestamp:string;
  }


const FormattedDate = ({timestamp}:FormattedDateProps) => {
  const formattedDate = formatDate(timestamp);
  return (
    <div className="flex justify-center my-4">
      <span className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded-full shadow-sm">
        {formattedDate}
      </span>
    </div>
  );
};

export default FormattedDate;
