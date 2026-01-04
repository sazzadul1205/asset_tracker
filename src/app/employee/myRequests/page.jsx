// src/app/admin/myRequests/page.jsx
"use client";

// React Components
import React from 'react';

// Next Components
import { useSession } from 'next-auth/react';

// Hooks
import useAxiosPublic from '@/hooks/useAxiosPublic';

// Icons
import { IoMdAdd } from 'react-icons/io';

// Shared
import Shared_Button from '@/Shared/Shared_Button/Shared_Button';


// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import { useQuery } from '@tanstack/react-query';
import Make_New_Request from '@/app/admin/myRequests/Make_New_Request/Make_New_Request';
import MyRequestsList from '@/app/admin/myRequests/MyRequestsList/MyRequestsList';
import MyRequestCards from '@/app/admin/myRequests/MyRequestCards/MyRequestCards';

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

  // My Requests 
  const {
    data: myRequests,
    isLoading: isMyRequestsLoading,
    isError: isMyRequestsError,
    refetch: refetchMyRequests,
  } = useQuery({
    queryKey: ["myRequests", session?.user?.userId],
    queryFn: async () => {
      const res = await axiosPublic.get(`/requests/${session?.user?.userId}`);
      return res.data;
    },
    enabled: !!session?.user?.userId,
    keepPreviousData: true,
  });

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
      <MyRequestCards RequestCounts={myRequests?.counts} />

      {/* My Requests */}
      {myRequests?.data?.length > 0 ? (
        <div className="p-5 space-y-3">
          {myRequests.data.map((request) => (
            <MyRequestsList
              key={request._id}
              myRequests={request}
              RefetchAll={RefetchAll}
              UserId={session?.user?.userId}
              UserRole={session?.user?.role}
            />
          ))}
        </div>
      ) : (
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
      )}

      {/* Add New Asset Modal */}
      <dialog id="Make_New_Request" className="modal">
        <Make_New_Request
          session={session}
          myAssets={myAssets}
          userOptions={userOptions}
          RefetchAll={RefetchAll}
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