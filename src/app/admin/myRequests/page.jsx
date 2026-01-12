// src/app/admin/myRequests/page.jsx
"use client";

// React Components
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

// Next Components
import { useSession } from 'next-auth/react';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Icons
import { IoMdAdd } from 'react-icons/io';

// Shared
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';

// Component
import MyRequestCards from './MyRequestCards/MyRequestCards';
import MyRequestsList from './MyRequestsList/MyRequestsList';
import Make_New_Request from './Make_New_Request/Make_New_Request';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';

const MyRequestPage = () => {
  const axiosPublic = useAxiosPublic();

  // Session
  const { data: session, status } = useSession();

  // Assigned Assets 
  const {
    data: assignedAssets,
    isLoading: isAssignedLoading,
    isError: isAssignedError,
    refetch: refetchAssignedAssets,
  } = useQuery({
    queryKey: ["assets", "assigned"],
    queryFn: async () => {
      const res = await axiosPublic.get("/assets/AssetOption", {
        params: { mode: "assigned" },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  // My Assets
  const {
    data: myAssets,
    isLoading: isMyAssetsLoading,
    isError: isMyAssetsError,
    refetch: refetchMyAssets,
  } = useQuery({
    queryKey: ["assets", "assigned-to-me", session?.user?.userId],
    queryFn: async () => {
      const res = await axiosPublic.get("/assets/AssetOption", {
        params: {
          mode: "assigned-to-me",
          userId: session?.user?.userId,
        },
      });
      return res.data;
    },
    enabled: !!session?.user?.userId,
    keepPreviousData: true,
  });

  // Unassigned Assets
  const {
    data: unassignedAssets,
    isLoading: isUnassignedLoading,
    isError: isUnassignedError,
    refetch: refetchUnassignedAssets,
  } = useQuery({
    queryKey: ["assets", "unassigned"],
    queryFn: async () => {
      const res = await axiosPublic.get("/assets/AssetOption", {
        params: { mode: "unassigned" },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  // User Options
  const {
    data: userOptions,
    isLoading: isUserOptionsLoading,
    isError: isUserOptionsError,
    refetch: refetchUserOptions,
  } = useQuery({
    queryKey: ["userOptions"],
    queryFn: async () => {
      const res = await axiosPublic.get("/users/UserOptions");
      return res.data;
    },
    keepPreviousData: true,
  });

  // My Requests with Infinite Loading
  const {
    data: myRequests,
    isLoading: isMyRequestsLoading,
    isError: isMyRequestsError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch: refetchMyRequests,
  } = useInfiniteQuery({
    queryKey: ["myRequests", session?.user?.userId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosPublic.get(`/requests/${session?.user?.userId}`, {
        params: { page: pageParam, limit: 10 }
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!session?.user?.userId,
    keepPreviousData: true,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Flatten all pages
  const allRequests = myRequests?.pages?.flatMap(page => page.data) || [];

  // Handle loading
  if (
    isAssignedLoading ||
    isMyAssetsLoading ||
    isUnassignedLoading ||
    isMyRequestsLoading ||
    isUserOptionsLoading ||
    status === "loading"
  )
    return <Loading
      message="Loading Users..."
      subText="Please wait while we fetch users data."
    />;

  // Handle errors
  if (
    isAssignedError ||
    isMyAssetsError ||
    isUnassignedError ||
    isMyRequestsError ||
    isUserOptionsError
  ) return <Error errors={
    isAssignedError || isMyAssetsError || isUnassignedError || isMyRequestsError || isUserOptionsError
  } />;

  // Refetch All
  const RefetchAll = () => {
    refetchAssignedAssets();
    refetchMyAssets();
    refetchUnassignedAssets();
    refetchUserOptions();
    refetchMyRequests();
  }

  return (
    <div>

      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 ' >
        {/* Title */}
        <div>
          <h3 className='text-xl sm:text-2xl font-bold text-gray-900' >My Requests</h3>
          <p className='text-sm sm:text-base text-gray-600 mt-1' >Manage and track your submitted requests</p>
        </div>

        {/* Edit Profile */}
        <Shared_Button
          variant="primary"
          onClick={() => document.getElementById("Make_New_Request")?.showModal()}
          className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
        >
          <IoMdAdd className="inline-block mr-2" />
          Make New Request
        </Shared_Button>
      </div>

      {/* Request Cards */}
      <MyRequestCards RequestCounts={myRequests?.pages[0]?.counts} />

      {/* My Requests with Infinite Scroll */}
      <div className="space-y-3 px-5">
        {allRequests.length > 0 ? (
          <>
            {allRequests.map((request) => (
              <MyRequestsList
                key={request._id}
                myRequests={request}
                RefetchAll={RefetchAll}
                UserId={session?.user?.userId}
                UserRole={session?.user?.role}
              />
            ))}

            {/* Load more trigger */}
            <div ref={ref} className="py-4">
              {isFetchingNextPage ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : hasNextPage ? (
                <p className="text-center text-sm text-gray-500">Scroll down to load more</p>
              ) : allRequests.length > 0 ? (
                <p className="text-center text-sm text-gray-500">No more requests to load</p>
              ) : null}
            </div>
          </>
        ) : !isMyRequestsLoading ? (
          <div className="flex flex-col items-center justify-center mt-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              📭
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              No requests found
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              {session?.user?.role === "admin"
                ? "There are no requests in the system yet."
                : session?.user?.role === "manager"
                  ? "No requests have been submitted in your department."
                  : "You haven’t created or received any requests yet."}
            </p>
          </div>
        ) : null}
      </div>

      {/* Add New Asset Modal */}
      <dialog id="Make_New_Request" className="modal">
        <Make_New_Request
          session={session}
          myAssets={myAssets}
          RefetchAll={RefetchAll}
          userOptions={userOptions}
          assignedAssets={assignedAssets}
          unassignedAssets={unassignedAssets}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default MyRequestPage; 