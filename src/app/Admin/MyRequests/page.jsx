"use client";

// React Components
import React, { useState } from 'react';

// Next Components
import { useSession } from 'next-auth/react';

// Icons
import {
  IoTrashOutline,
  IoBuildOutline,
  IoCreateOutline,
  IoRepeatOutline,
  IoPersonAddOutline,
  IoFolderOpenOutline,
  IoCloseCircleOutline,
  IoDocumentTextOutline,
  IoReturnDownBackOutline,
} from "react-icons/io5";
import { FaPlus } from 'react-icons/fa';
import { BsInbox } from 'react-icons/bs';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

// Packages
import InfiniteScroll from "react-infinite-scroll-component";

// Tanstack
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';
import RequestCard from '@/Shared/Modals/MyRequests/RequestCard/RequestCard';

// Hooks
import useAxiosPublic from '@/Hooks/useAxiosPublic';

// Shared - Modal
import NewRequestModal from '@/Shared/Modals/MyRequests/NewRequestModal/NewRequestModal';

const MyRequestsPage = () => {
  const axiosPublic = useAxiosPublic();
  const { data: session, status } = useSession();

  // Fetch Assets Basic Info Data
  const {
    data: AssetBasicInfoData,
    error: AssetBasicInfoError,
    refetch: AssetBasicInfoRefetch,
    isLoading: AssetBasicInfoIsLoading,
  } = useQuery({
    queryKey: ["AssetBasicInfoData"],
    queryFn: () =>
      axiosPublic.get(`/Assets/BasicInfo`).then((res) => res.data.data),
    keepPreviousData: true,
  });

  // Fetch Users Basic Info Data
  const {
    data: UsersBasicInfoData,
    error: UsersBasicInfoError,
    refetch: UsersBasicInfoRefetch,
    isLoading: UsersBasicInfoIsLoading,
  } = useQuery({
    queryKey: ["UsersBasicInfoData"],
    queryFn: () =>
      axiosPublic.get(`/Users/BasicInfo`).then((res) => res.data.data),
    keepPreviousData: true,
  });

  // Fetch Request Count
  const {
    data: RequestCountData,
    error: RequestCountError,
    refetch: RequestCountRefetch,
    isLoading: RequestCountIsLoading,
  } = useQuery({
    queryKey: ["RequestCountData", session?.user?.email],
    queryFn: () =>
      axiosPublic.get(`/Requests/Count?email=${session?.user?.email}`).
        then((res) => res.data
        ),
    keepPreviousData: true,
    enabled: !!session?.user?.email,
  });

  // Fetch Infinite Request Data
  const {
    data,
    error,
    refetch,
    isError,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["MyRequestData", session?.user?.email],
    queryFn: ({ pageParam = 1 }) =>
      axiosPublic
        .get(`/Requests?requested_by=${session?.user?.email}&page=${pageParam}&limit=5`)
        .then((res) => res.data),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: !!session?.user?.email,
  });

  // Handle loading
  if (
    status === "loading" ||
    RequestCountIsLoading ||
    AssetBasicInfoIsLoading ||
    UsersBasicInfoIsLoading
  ) {
    return <Loading />;
  }

  // Handle errors
  if (
    RequestCountError ||
    AssetBasicInfoError ||
    UsersBasicInfoError
  ) {
    return <Error errors={[
      RequestCountError,
      AssetBasicInfoError,
      UsersBasicInfoError,
    ]} />;
  }

  // Refetch all
  const RefetchAll = () => {
    refetch();
    RequestCountRefetch();
    AssetBasicInfoRefetch();
    UsersBasicInfoRefetch();
  };

  // Dashboard Cards with values assigned from server data
  const dashboardCards = [
    {
      label: "All Requests",
      key: "all",
      value: RequestCountData.total || 0,
      icon: IoFolderOpenOutline,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
    },
    {
      label: "Assign Assets Request",
      key: "assign",
      value: RequestCountData.detailed.assign || 0,
      icon: IoPersonAddOutline,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      label: "Request Assets Request",
      key: "request",
      value: RequestCountData.detailed.request || 0,
      icon: IoDocumentTextOutline,
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      label: "Return Assets Request",
      key: "return",
      value: RequestCountData.detailed.return || 0,
      icon: IoReturnDownBackOutline,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-700",
    },
    {
      label: "Repair Assets Request",
      key: "repair",
      value: RequestCountData.detailed.repair || 0,
      icon: IoBuildOutline,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-700",
    },
    {
      label: "Retire Assets Request",
      key: "retire",
      value: RequestCountData.detailed.retire || 0,
      icon: IoCloseCircleOutline,
      iconBg: "bg-red-100",
      iconColor: "text-red-700",
    },
    {
      label: "Transfer Assets Request",
      key: "transfer",
      value: RequestCountData.detailed.transfer || 0,
      icon: IoRepeatOutline,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
    {
      label: "Update Assets Request",
      key: "update",
      value: RequestCountData.detailed.update || 0,
      icon: IoCreateOutline,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-700",
    },
    {
      label: "Dispose Assets Request",
      key: "dispose",
      value: RequestCountData.detailed.dispose || 0,
      icon: IoTrashOutline,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-700",
    }
  ];

  // Rows
  const rows = [
    dashboardCards?.slice(0, 5),
    dashboardCards?.slice(5, 9),
  ];

  return (
    <div>
      {/* Header */}
      <div className='flex items-center justify-between p-5' >
        {/* Left: Title */}
        <div>
          <h3 className='text-2xl font-bold text-gray-900' >My Requests </h3>
          <p className='text-gray-600' >Manage and track your submitted requests </p>
        </div>

        {/* Right: Add Button */}
        <div className="flex items-center gap-3" >
          {/* Add Button */}
          <button
            onClick={() => { document.getElementById("Add_Request_Modal").showModal() }}
            className=" gap-2 font-semibold text-white  py-2 bg-blue-600 rounded-lg shadow-md 
                     hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 
                     active:translate-y-px active:shadow-md"
          >
            <div className='flex items-center w-52 justify-between px-5' >
              <FaPlus className="text-sm" />
              Add New Request
            </div>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col items-center gap-6 px-5">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
              width:
                row.length === 3
                  ? "100%"
                  : row.length === 2
                    ? "70%"
                    : "100%", // safety
            }}
          >
            {row.map((card) => (
              <div
                key={card.key}
                className="rounded-lg border bg-white shadow-md hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="p-5 flex items-center justify-between">

                  {/* Text */}
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}
                  >
                    <card.icon className={`${card.iconColor} text-3xl`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* My Requests */}
      <MyRequestsList
        data={data}
        error={error}
        isError={isError}
        isLoading={isLoading}
        RefetchAll={RefetchAll}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />

      {/* Add Request Modal */}
      <dialog id="Add_Request_Modal" className="modal">
        <NewRequestModal
          RefetchAll={RefetchAll}
          UserEmail={session?.user?.email}
          UserId={session?.user?.employee_id}
          AssetBasicInfoData={AssetBasicInfoData}
          UsersBasicInfoData={UsersBasicInfoData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default MyRequestsPage;

// My Requests List Component
const MyRequestsList = ({
  data,
  error,
  isError,
  isLoading,
  RefetchAll,
  hasNextPage,
  fetchNextPage,
}) => {
  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg shadow-md m-6">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">Loading Requests</h3>
        <p className="text-sm text-gray-500 mt-1">Please wait while we fetch your requests...</p>
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-lg border border-red-200 shadow-md m-6">
        <BsInbox className="text-4xl text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-700">Something went wrong</h3>
        <p className="text-sm text-red-500 mt-1">{error?.message || "Unable to load your requests."}</p>
        <button
          onClick={RefetchAll}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const allRequests = data.pages.flatMap((page) => page.data);

  return (
    <InfiniteScroll
      dataLength={allRequests.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<p className="text-center py-4 text-gray-500">Loading more requests...</p>}
      endMessage={
        allRequests.length ? (
          <p className="text-center py-4 text-gray-500">No more requests</p>
        ) : null
      }
    >
      <div>
        {allRequests.length > 0 ? (
          allRequests.map((request, index) => (
            <RequestCard
              key={`${request.request_id || request._id}-${index}` || index}
              MyRequestData={request}
              RefetchAll={RefetchAll}
            />
          ))
        ) : (
          <div className="m-6 text-center flex flex-col items-center justify-center gap-2">
            <BsInbox className="text-4xl text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700">No Requests Found</h3>
            <p className="text-sm text-gray-500">
              There are currently no requests to display. Please check back later or create a new request.
            </p>
          </div>
        )}
      </div>
    </InfiniteScroll>
  );
};

