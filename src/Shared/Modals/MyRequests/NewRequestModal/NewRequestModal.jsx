// React Components
import React, { useState } from "react";

// React Hook Form
import { useForm } from "react-hook-form";

// Icons
import { ImCross } from "react-icons/im";
import {
  IoPersonAddOutline,
  IoDocumentTextOutline,
  IoReturnDownBackOutline,
  IoBuildOutline,
  IoTrashOutline,
  IoRepeatOutline,
  IoCreateOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";

// Hooks
import { useToast } from "@/Hooks/Toasts";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

// Components
import AssignAssetForm from "./AssignAssetForm/AssignAssetForm";
import RequestAssetForm from "./RequestAssetForm/RequestAssetForm";
import ReturnAssetForm from "./ReturnAssetForm/ReturnAssetForm";
import RepairAssetForm from "./RepairAssetForm/RepairAssetForm";
import RetireAssetForm from "./RetireAssetForm/RetireAssetForm";
import UpdateAssetForm from "./UpdateAssetForm/UpdateAssetForm";
import DisposeAssetForm from "./DisposeAssetForm/DisposeAssetForm";
import TransferAssetForm from "./TransferAssetForm/TransferAssetForm";

// Utils
import { getAssetsByEmail, RemoveAssigned } from "@/Utils/AssetRequestModalFunc";


// Action Items
const actionItems = [
  {
    key: "assign",
    title: "Assign Asset",
    description: "Give an asset to a user or department.",
    icon: IoPersonAddOutline,
    color: "bg-blue-100 text-blue-700",
  },
  {
    key: "request",
    title: "Request Asset",
    description: "Ask for an asset you need.",
    icon: IoDocumentTextOutline,
    color: "bg-green-100 text-green-700",
  },
  {
    key: "return",
    title: "Return Asset",
    description: "Return an assigned asset.",
    icon: IoReturnDownBackOutline,
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    key: "repair",
    title: "Repair Asset",
    description: "Mark asset for maintenance.",
    icon: IoBuildOutline,
    color: "bg-orange-100 text-orange-700",
  },
  {
    key: "retire",
    title: "Retire Asset",
    description: "Move an asset out of active use.",
    icon: IoCloseCircleOutline,
    color: "bg-red-100 text-red-700",
  },
  {
    key: "transfer",
    title: "Transfer Asset",
    description: "Move asset between departments.",
    icon: IoRepeatOutline,
    color: "bg-purple-100 text-purple-700",
  },
  {
    key: "update",
    title: "Update Asset",
    description: "Modify asset details.",
    icon: IoCreateOutline,
    color: "bg-teal-100 text-teal-700",
  },
  {
    key: "dispose",
    title: "Dispose Asset",
    description: "Remove permanently.",
    icon: IoTrashOutline,
    color: "bg-gray-100 text-gray-700",
  },
];

// Rows
const rows = [
  actionItems.slice(0, 3),
  actionItems.slice(3, 6),
  actionItems.slice(6, 8),
];

const NewRequestModal = ({
  UserEmail,
  RefetchAll,
  UsersBasicInfoData,
  AssetBasicInfoData,
}) => {
  const { success } = useToast();
  const axiosPublic = useAxiosPublic();

  // States
  const [formError, setFormError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form Data
  const [selectedAction, setSelectedAction] = useState(null);

  // Close modal
  const handleClose = () => {
    reset();
    setFormError(null);
    setSelectedAction(null);
    document.getElementById("Add_Request_Modal")?.close();
  }

  // Form Hooks
  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Remove assigned assets
  const AllAssetData = RemoveAssigned(AssetBasicInfoData);

  const MyAssetData = getAssetsByEmail(AssetBasicInfoData, UserEmail);

  // Handle Universal Submit
  const handleUniversalSubmit = async (data, action_type) => {
    setFormError(null);
    setIsLoading(true);

    // Make request
    try {

      // If user email is missing
      if (!UserEmail) {
        setFormError("Session error: User email missing.");
        return;
      }

      // Build payload
      const payload = {
        ...data,
        action_type,
        requested_by: UserEmail,
        requested_at: new Date().toISOString(),
      };

      // Make request
      await axiosPublic.post("/Requests", payload);

      // 
      RefetchAll();
      handleClose();
      success(`${action_type.toUpperCase()} Request Created Successfully.`);
    } catch (err) {
      const serverError =
        err.response?.data?.message ||
        err.message ||
        `Failed to make ${action_type} request.`;

      setFormError(serverError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="Add_Request_Modal"
      className="modal-box w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">
          Add New Asset Request
        </h3>
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300"
        >
          <ImCross className="text-xl" />
        </button>
      </div>

      {/* Divider */}
      <hr className="my-3 border-gray-300" />

      {/* Action Selection */}
      <div className="mt-1">

        {/* Main Content */}
        {selectedAction === null && (
          <div>
            <h3 className="font-semibold text-lg pb-2">Select an Action</h3>

            <div className="flex flex-col items-center gap-6">
              {rows.map((row, index) => (
                <div
                  key={index}
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
                  {row.map((item) => (
                    <div
                      key={item.key}
                      onClick={() => setSelectedAction(item.key)}
                      className={`p-4 border rounded-lg cursor-pointer shadow bg-white transition-transform hover:-translate-y-1 hover:shadow-lg`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-5 rounded-lg ${item.color}`}>
                          <item.icon className="text-2xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          <p className="text-xs text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

        )}

        {/* Assign Asset Form */}
        {selectedAction === "assign" &&
          <AssignAssetForm
            reset={reset}
            errors={errors}
            control={control}
            register={register}
            isLoading={isLoading}
            formError={formError}
            isSubmitting={isSubmitting}
            AllAssetData={AllAssetData}
            handleSubmit={handleSubmit}
            setSelectedAction={setSelectedAction}
            handleUniversalSubmit={handleUniversalSubmit}
          />
        }

        {/* Request Asset Form */}
        {selectedAction === "request" &&
          <RequestAssetForm
            reset={reset}
            errors={errors}
            control={control}
            register={register}
            isLoading={isLoading}
            formError={formError}
            MyAssetData={MyAssetData}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            AllAssetData={AllAssetData}
            setSelectedAction={setSelectedAction}
            handleUniversalSubmit={handleUniversalSubmit}
          />
        }

        {/* Return Asset Form */}
        {selectedAction === "return" &&
          <ReturnAssetForm
            reset={reset}
            errors={errors}
            control={control}
            register={register}
            isLoading={isLoading}
            formError={formError}
            MyAssetData={MyAssetData}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            setSelectedAction={setSelectedAction}
            handleUniversalSubmit={handleUniversalSubmit}
          />
        }

        {/* Repair Asset Form */}
        {selectedAction === "repair" &&
          <RepairAssetForm
            reset={reset}
            errors={errors}
            control={control}
            register={register}
            isLoading={isLoading}
            formError={formError}
            MyAssetData={MyAssetData}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            setSelectedAction={setSelectedAction}
            handleUniversalSubmit={handleUniversalSubmit}
          />
        }

        {/* Retire Asset Form */}
        {selectedAction === "retire" &&
          <RetireAssetForm
            reset={reset}
            errors={errors}
            control={control}
            register={register}
            isLoading={isLoading}
            formError={formError}
            MyAssetData={MyAssetData}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            setSelectedAction={setSelectedAction}
            handleUniversalSubmit={handleUniversalSubmit}
          />
        }

        {/* Transfer Asset Form */}
        {selectedAction === "transfer" &&
          <TransferAssetForm
            reset={reset}
            errors={errors}
            control={control}
            register={register}
            isLoading={isLoading}
            formError={formError}
            MyAssetData={MyAssetData}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            setSelectedAction={setSelectedAction}
            handleUniversalSubmit={handleUniversalSubmit}
          />
        }

        {/* Update Asset Form */}
        {selectedAction === "update" &&
          <UpdateAssetForm
            reset={reset}
            errors={errors}
            control={control}
            register={register}
            isLoading={isLoading}
            formError={formError}
            MyAssetData={MyAssetData}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            setSelectedAction={setSelectedAction}
            handleUniversalSubmit={handleUniversalSubmit}
          />
        }

        {/* Dispose Asset Form */}
        {selectedAction === "dispose" &&
          <DisposeAssetForm
            reset={reset}
            errors={errors}
            control={control}
            register={register}
            isLoading={isLoading}
            formError={formError}
            MyAssetData={MyAssetData}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            setSelectedAction={setSelectedAction}
            handleUniversalSubmit={handleUniversalSubmit}
          />
        }
      </div>
    </div>
  );
};

export default NewRequestModal;