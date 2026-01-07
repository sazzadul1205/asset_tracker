// src/app/admin/departments/Make_New_Request/Make_New_Request.jsx

// React Components
import Shared_Button from "@/Shared/Shared_Button/Shared_Button";
import React, { useState } from "react";

// Icons
import { ImCross } from "react-icons/im";
import { IoMdArrowRoundBack } from "react-icons/io";
import {
  IoPersonAddOutline,
  IoDocumentTextOutline,
  IoReturnDownBackOutline,
  IoBuildOutline,
  IoCloseCircleOutline,
  IoRepeatOutline,
  IoCreateOutline,
  IoTrashOutline
} from "react-icons/io5";
import AssignAssetForm from "./AssignAssetForm/AssignAssetForm";
import RequestAssetForm from "./RequestAssetForm/RequestAssetForm";
import ReturnAssetForm from "./ReturnAssetForm/ReturnAssetForm";
import RepairAssetForm from "./RepairAssetForm/RepairAssetForm";
import RetireAssetForm from "./RetireAssetForm/RetireAssetForm";
import TransferAssetForm from "./TransferAssetForm/TransferAssetForm";
import UpdateAssetForm from "./UpdateAssetForm/UpdateAssetForm";
import DisposeAssetForm from "./DisposeAssetForm/DisposeAssetForm";

// Action Items arranged in rows for better layout
const actionItems = [
  [
    {
      key: "assign",
      title: "Assign Asset",
      description: "Give an asset to a user or department.",
      icon: IoPersonAddOutline,
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
      allowedRoles: ["admin", "manager"],
    },
    {
      key: "request",
      title: "Request Asset",
      description: "Ask for an asset you need.",
      icon: IoDocumentTextOutline,
      color: "bg-green-50 text-green-600",
      iconBg: "bg-green-100",
    },
    {
      key: "return",
      title: "Return Asset",
      description: "Return an assigned asset.",
      icon: IoReturnDownBackOutline,
      color: "bg-yellow-50 text-yellow-600",
      iconBg: "bg-yellow-100",
    },
  ],
  [
    {
      key: "repair",
      title: "Repair Asset",
      description: "Mark asset for maintenance.",
      icon: IoBuildOutline,
      color: "bg-orange-50 text-orange-600",
      iconBg: "bg-orange-100",
    },
    {
      key: "retire",
      title: "Retire Asset",
      description: "Move an asset out of active use.",
      icon: IoCloseCircleOutline,
      color: "bg-red-50 text-red-600",
      iconBg: "bg-red-100",
    },
    {
      key: "transfer",
      title: "Transfer Asset",
      description: "Move asset between departments.",
      icon: IoRepeatOutline,
      color: "bg-purple-50 text-purple-600",
      iconBg: "bg-purple-100",
    },
  ],
  [
    {
      key: "update",
      title: "Update Asset",
      description: "Modify asset details.",
      icon: IoCreateOutline,
      color: "bg-teal-50 text-teal-600",
      iconBg: "bg-teal-100",
    },
    {
      key: "dispose",
      title: "Dispose Asset",
      description: "Remove permanently.",
      icon: IoTrashOutline,
      color: "bg-gray-50 text-gray-600",
      iconBg: "bg-gray-100",
    },
  ],
];

const Make_New_Request = ({
  session,
  myAssets,
  RefetchAll,
  userOptions,
  assignedAssets,
  unassignedAssets,
}) => {
  const [selectedAction, setSelectedAction] = useState(null);

  // Find the selected item details
  const getSelectedItem = () => {
    for (const row of actionItems) {
      for (const item of row) {
        if (item.key === selectedAction) {
          return item;
        }
      }
    }
    return null;
  };

  // Get the selected item details
  const selectedItem = getSelectedItem();

  // Close modal
  const handleClose = () => {
    setSelectedAction(null);
    document.getElementById("Make_New_Request")?.close();
  };

  // Get current user role
  const getCurrentUserRole = () => {
    return session?.user?.role?.toLowerCase() || "employee";
  };

  return (
    <div
      id="Make_New_Request"
      className="modal-box w-full max-w-4xl mx-auto max-h-[95vh] overflow-y-auto bg-white rounded-xl shadow-2xl px-6 py-5 text-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="tracking-tight text-xl font-semibold text-gray-900">
          {selectedAction ? `Make ${selectedItem?.title}` : "Make New Request"}
        </h3>
        <button
          type="button"
          onClick={handleClose}
          className="hover:text-red-500 transition-colors duration-300 cursor-pointer"
        >
          <ImCross className="text-lg" />
        </button>
      </div>

      {/* Main Content */}
      {selectedAction === null && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg pb-2 text-gray-800">Select an Action</h3>
            <p className="text-gray-600 text-sm">Choose what you want to do with an asset</p>
            <p className="text-gray-600 text-sm">After Requesting the Admin/Manager Will Accept or Deny Any Request</p>
          </div>

          <div className="flex flex-col items-center gap-6">
            {actionItems.map((row, index) => (
              <div
                key={index}
                className="grid gap-4 w-full"
                style={{
                  gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                }}
              >

                {row.map((item) => {
                  const isDisabled = item.allowedRoles && !item.allowedRoles.includes(getCurrentUserRole());

                  return (
                    <div
                      key={item.key}
                      onClick={() => !isDisabled && setSelectedAction(item.key)}
                      className={` p-4 border rounded-lg shadow-sm bg-white transition-all duration-300 ${item.color} ${isDisabled
                        ? 'opacity-50 cursor-not-allowed border-gray-200'
                        : 'cursor-pointer hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] border-gray-200'
                        }`}
                      title={isDisabled ? "Only admins and managers can assign assets" : ""}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${item.iconBg} ${isDisabled ? 'opacity-70' : ''}`}>
                          <item.icon className="text-2xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {item.title}
                            {isDisabled && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                Restricted
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Action Form Area */}
      {selectedAction && selectedItem && (
        <div className="mt-2">
          {/* Header */}
          <div className="flex justify-between items-center">
            <Shared_Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedAction(null)}
              className="mb-4 py-2 px-0 h-auto text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <IoMdArrowRoundBack /> <span>Back to Actions</span>
              </div>
            </Shared_Button>

            {/* Selected Action Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-3 rounded-lg ${selectedItem.iconBg}`}>
                  <selectedItem.icon className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedItem.title}</h3>
                  <p className="text-sm text-gray-600">{selectedItem.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action-specific placeholder messages */}
          <div>
            {/* Assign Asset Form */}
            {selectedItem.key === "assign" && (
              <AssignAssetForm
                session={session}
                RefetchAll={RefetchAll}
                handleClose={handleClose}
                userOptions={userOptions}
                unassignedAssets={unassignedAssets}
              />
            )}

            {/* Request Asset Form */}
            {selectedItem.key === "request" && (
              <RequestAssetForm
                session={session}
                RefetchAll={RefetchAll}
                handleClose={handleClose}
                unassignedAssets={unassignedAssets}
              />
            )}

            {/* Return Asset Form */}
            {selectedItem.key === "return" && (
              <ReturnAssetForm
                session={session}
                RefetchAll={RefetchAll}
                myAssets={myAssets}
                handleClose={handleClose}
              />
            )}

            {/* Repair Asset Form */}
            {selectedItem.key === "repair" && (
              <RepairAssetForm
                session={session}
                RefetchAll={RefetchAll}
                myAssets={myAssets}
                handleClose={handleClose}
              />
            )}

            {/* Retire Asset Form */}
            {selectedItem.key === "retire" && (
              <RetireAssetForm
                session={session}
                RefetchAll={RefetchAll}
                handleClose={handleClose}
                unassignedAssets={unassignedAssets}
              />

            )}

            {/* Transfer Asset Form */}
            {selectedItem.key === "transfer" && (
              <TransferAssetForm
                session={session}
                RefetchAll={RefetchAll}
                myAssets={myAssets}
                handleClose={handleClose}
                userOptions={userOptions}
              />
            )}

            {/* Update Asset Form */}
            {selectedItem.key === "update" && (
              <UpdateAssetForm
                session={session}
                RefetchAll={RefetchAll}
                myAssets={myAssets}
                handleClose={handleClose}
              />
            )}

            {/* Dispose Asset Form */}
            {selectedItem.key === "dispose" && (
              <DisposeAssetForm
                session={session}
                RefetchAll={RefetchAll}
                handleClose={handleClose}
                unassignedAssets={unassignedAssets}
              />
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Make_New_Request;