"use client";

// React Components
import React from 'react';

// Icons
import { FaPlus } from 'react-icons/fa';
import { GoGear } from "react-icons/go";
import { BsBoxSeam } from "react-icons/bs";
import { BiTransfer } from "react-icons/bi";
import { IoMdReturnLeft } from "react-icons/io";
import { IoDocumentTextOutline } from "react-icons/io5";

// Tanstack
import { useQuery } from '@tanstack/react-query';

// Shared
import Error from '@/Shared/Error/Error';
import Loading from '@/Shared/Loading/Loading';

// Hooks
import useAxiosPublic from '@/Hooks/useAxiosPublic';

// Shared - Modal
import NewRequestModal from '@/Shared/Modals/MyRequests/NewRequestModal/NewRequestModal';

// Dashboard Cards
const dashboardCards = [
  {
    label: "Total Requests",
    value: 7,
    icon: IoDocumentTextOutline,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    label: "Asset Requests",
    value: 12,
    icon: BsBoxSeam,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
  },
  {
    label: "Repairs",
    value: 4,
    icon: GoGear,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
  },
  {
    label: "Returns",
    value: 2,
    icon: IoMdReturnLeft,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
  },
  {
    label: "Transfer",
    value: 105,
    icon: BiTransfer,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
  },
];

const MyRequestsPage = () => {
  const axiosPublic = useAxiosPublic();

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

  // Handle loading
  if (AssetBasicInfoIsLoading) {
    return <Loading />;
  }

  // Handle errors
  if (AssetBasicInfoError) {
    return <Error errors={[AssetBasicInfoError]} />;
  }

  // Refetch all
  const RefetchAll = () => {
    AssetBasicInfoRefetch();
  };

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
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 px-5' >
        {/* Card */}
        {dashboardCards.map((card, i) => (
          <div
            key={i}
            className="rounded-lg border bg-white shadow-xl cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.label}</p>
                <h3 className="text-2xl font-semibold text-gray-900">{card.value}</h3>
              </div>

              <div
                className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}
              >
                <card.icon className={`${card.iconColor} text-3xl`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Request Modal */}
      <dialog id="Add_Request_Modal" className="modal">
        <NewRequestModal
          RefetchAll={RefetchAll}
          AssetBasicInfoData={AssetBasicInfoData}
        />
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

    </div>
  );
};

export default MyRequestsPage;