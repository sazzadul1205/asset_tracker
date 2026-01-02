// src/app/admin/myRequests/MyRequestCards/MyRequestCards.jsx

// React Components
import React from "react";
import { useEffect, useState } from "react";

// Icons 
import {
  IoFolderOpenOutline,
  IoPersonAddOutline,
  IoDocumentTextOutline,
  IoReturnDownBackOutline,
  IoBuildOutline,
  IoCloseCircleOutline,
  IoRepeatOutline,
  IoCreateOutline,
  IoTrashOutline,
} from "react-icons/io5";

const MyRequestCards = ({ RequestCounts }) => {

  // Cards Data
  const cards = [
    { label: "All Requests", key: "all", value: RequestCounts?.total || 0, icon: IoFolderOpenOutline, iconBg: "bg-gradient-to-tr from-slate-200 to-slate-400", iconColor: "text-slate-800" },
    { label: "Assign Assets Request", key: "assign", value: RequestCounts?.detailed.assign || 0, icon: IoPersonAddOutline, iconBg: "bg-gradient-to-tr from-blue-200 to-blue-400", iconColor: "text-blue-800" },
    { label: "Request Assets Request", key: "request", value: RequestCounts?.detailed.request || 0, icon: IoDocumentTextOutline, iconBg: "bg-gradient-to-tr from-green-200 to-green-400", iconColor: "text-green-800" },
    { label: "Return Assets Request", key: "return", value: RequestCounts?.detailed.return || 0, icon: IoReturnDownBackOutline, iconBg: "bg-gradient-to-tr from-yellow-200 to-yellow-400", iconColor: "text-yellow-800" },
    { label: "Repair Assets Request", key: "repair", value: RequestCounts?.detailed.repair || 0, icon: IoBuildOutline, iconBg: "bg-gradient-to-tr from-orange-200 to-orange-400", iconColor: "text-orange-800" },
    { label: "Retire Assets Request", key: "retire", value: RequestCounts?.detailed.retire || 0, icon: IoCloseCircleOutline, iconBg: "bg-gradient-to-tr from-red-200 to-red-400", iconColor: "text-red-800" },
    { label: "Transfer Assets Request", key: "transfer", value: RequestCounts?.detailed.transfer || 0, icon: IoRepeatOutline, iconBg: "bg-gradient-to-tr from-purple-200 to-purple-400", iconColor: "text-purple-800" },
    { label: "Update Assets Request", key: "update", value: RequestCounts?.detailed.update || 0, icon: IoCreateOutline, iconBg: "bg-gradient-to-tr from-teal-200 to-teal-400", iconColor: "text-teal-800" },
    { label: "Dispose Assets Request", key: "dispose", value: RequestCounts?.detailed.dispose || 0, icon: IoTrashOutline, iconBg: "bg-gradient-to-tr from-gray-200 to-gray-400", iconColor: "text-gray-800" },
  ];

  // Animated Counts
  const [animatedCounts, setAnimatedCounts] = useState(
    cards.reduce((acc, card) => ({ ...acc, [card.key]: 0 }), {})
  );

  // Animate counts on RequestCounts change
  useEffect(() => {
    const intervals = cards.map(card => {
      const stepTime = Math.max(20, 1000 / (card.value || 1));
      let current = 0;
      const interval = setInterval(() => {
        current += Math.ceil(card.value / 50);
        setAnimatedCounts(prev => ({ ...prev, [card.key]: Math.min(current, card.value) }));
        if (current >= card.value) clearInterval(interval);
      }, stepTime);
      return interval;
    });

    return () => intervals.forEach(clearInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RequestCounts]);

  // First 5 cards (row 1), remaining 4 cards (row 2)
  const firstRowCards = cards.slice(0, 5);
  const secondRowCards = cards.slice(5, 9);

  return (
    <div className="w-full px-4 md:px-5 py-4 md:py-6 space-y-4 md:space-y-6">
      {/* First Row - 5 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {firstRowCards.map((card) => {
          // Get Icon Component
          const Icon = card.icon;

          // Render each card
          return (
            <div
              key={card.key}
              className="rounded-xl border border-gray-100 bg-white shadow-lg hover:shadow-xl md:hover:shadow-2xl hover:-translate-y-1 md:hover:-translate-y-2 transform transition-all duration-300 cursor-pointer"
            >
              <div className="p-4 md:p-6 flex flex-row-reverse justify-between items-center h-full">
                {/* Icon */}
                <div className={`w-10 h-10 md:w-12 md:h-12 ${card.iconBg} rounded-lg flex items-center justify-center shadow-inner`}>
                  <Icon className={`${card.iconColor} text-xl md:text-2xl`} />
                </div>

                {/* Label & Count */}
                <div className="flex flex-col text-start">
                  {/* Label */}
                  <p className="text-xs md:text-sm font-medium text-gray-500 uppercase line-clamp-2">
                    {card.label}
                  </p>
                  {/* Count */}
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900">
                    {animatedCounts[card.key].toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Second Row - 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {secondRowCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.key}
              className="rounded-xl border border-gray-100 bg-white shadow-lg hover:shadow-xl md:hover:shadow-2xl hover:-translate-y-1 md:hover:-translate-y-2 transform transition-all duration-300 cursor-pointer"
            >
              <div className="p-4 md:p-6 flex flex-row-reverse justify-between items-center h-full">
                {/* Icon */}
                <div className={`w-10 h-10 md:w-12 md:h-12 ${card.iconBg} rounded-lg flex items-center justify-center shadow-inner`}>
                  <Icon className={`${card.iconColor} text-xl md:text-2xl`} />
                </div>

                {/* Label & Count */}
                <div className="flex flex-col text-start">
                  {/* Label */}
                  <p className="text-xs md:text-sm font-medium text-gray-500 uppercase line-clamp-2">
                    {card.label}
                  </p>
                  {/* Count */}
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900">
                    {animatedCounts[card.key].toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyRequestCards;