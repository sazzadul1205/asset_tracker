import Shared_Button from '@/Shared/Shared_Button/Shared_Button';
import React, { useRef, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import { TbActivityHeartbeat } from "react-icons/tb";
import UserId_To_Name from '../../departments/UserId_To_Name/UserId_To_Name';

const SystemLogs = ({ requestData, hasNextPage, fetchNextPage, isFetchingNextPage }) => {
  const loadMoreRef = useRef();

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className='rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-200 bg-white'>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
          <TbActivityHeartbeat className="text-blue-500 text-2xl" />
          Recent System Activity
        </h2>

        <Shared_Button
          variant="ghost"
          onClick={() =>
            document.getElementById("Add_New_Department_Modal")?.showModal()
          }
        >
          <FaFilter className="mr-2" />
          Filter
        </Shared_Button>
      </div>

      {/* Content */}
      <div className="p-4 pt-0 space-y-5">
        {requestData.map((log) => {
          const date = new Date(log.timestamp);

          return (
            <div key={log._id} className="relative pl-6 pb-5 border-l-2 border-gray-50 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-lg p-5">
              <span className={`absolute -left-1.75 top-2 h-5 w-5 rounded-full ${log.state === "accepted" ? "bg-green-500"
                : log.state === "rejected" ? "bg-red-500"
                  : "bg-orange-500"
                }`} />

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                {/* LEFT */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold capitalize text-gray-900">{log.action}</span>
                    <span className="text-gray-500">by</span>
                    <span className="font-medium text-gray-800">
                      <UserId_To_Name userId={log.performedBy} />
                    </span>
                  </div>

                  {log.details?.notes && <p className="text-sm italic text-gray-500">“{log.details.notes}”</p>}

                  <div className="text-sm text-gray-600 space-y-0.5">
                    {log.details?.departmentId && <div>Department: {log.details.departmentId}</div>}
                    {log.details?.additionalData?.assetId && (
                      <div>Asset Ref: <span className="font-medium">{log.details.additionalData.assetId}</span></div>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-sm text-gray-600 md:text-right space-y-1 shrink-0">
                  <div className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium capitalize ${log.state === "accepted" ? "bg-green-100 text-green-700"
                    : log.state === "rejected" ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                    }`}>
                    {log.state}
                  </div>

                  {log.details?.priority && <div>Priority: <span className="font-medium capitalize">{log.details.priority}</span></div>}

                  <div className="text-gray-500">
                    {date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Load More */}
        <div ref={loadMoreRef} className="text-center py-4">
          {isFetchingNextPage && <p>Loading more logs...</p>}
          {!hasNextPage && <p className="text-gray-500">No more logs</p>}
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
