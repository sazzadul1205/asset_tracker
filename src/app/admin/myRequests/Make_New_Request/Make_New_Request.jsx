// src/app/admin/departments/Make_New_Request/Make_New_Request.jsx

import React, { useState } from "react";
import Shared_Button from "@/Shared/Shared_Button/Shared_Button";

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
  IoTrashOutline,
} from "react-icons/io5";

// Forms
import AssignAssetForm from "./AssignAssetForm/AssignAssetForm";
import RequestAssetForm from "./RequestAssetForm/RequestAssetForm";
import ReturnAssetForm from "./ReturnAssetForm/ReturnAssetForm";
import RepairAssetForm from "./RepairAssetForm/RepairAssetForm";
import RetireAssetForm from "./RetireAssetForm/RetireAssetForm";
import TransferAssetForm from "./TransferAssetForm/TransferAssetForm";
import UpdateAssetForm from "./UpdateAssetForm/UpdateAssetForm";
import DisposeAssetForm from "./DisposeAssetForm/DisposeAssetForm";

// Data
const actionItems = [
  [
    {
      key: "assign",
      title: "Assign Asset",
      description: "Give an asset to a user.",
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
  unassignedAssets,
}) => {
  const [selectedAction, setSelectedAction] = useState(null);

  // Helper functions
  const getCurrentUserRole = () =>
    session?.user?.role?.toLowerCase() || "employee";

  // Get selected item
  const selectedItem = actionItems
    .flat()
    .find((item) => item.key === selectedAction);

  // Close modal
  const handleClose = () => {
    setSelectedAction(null);
    document.getElementById("Make_New_Request")?.close();
  };

  return (
    <div
      id="Make_New_Request"
      className="
        modal-box w-full max-w-4xl mx-auto
        max-h-[95vh] overflow-y-auto
        bg-white rounded-xl shadow-2xl
        px-4 sm:px-6 py-5
        text-gray-900
      "
    >
      {/* Header                                                             */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h3 className="text-lg sm:text-xl font-semibold tracking-tight">
          {selectedAction ? `Make ${selectedItem?.title}` : "Make New Request"}
        </h3>

        <button
          type="button"
          onClick={handleClose}
          className="self-end sm:self-auto hover:text-red-500 transition"
        >
          <ImCross className="text-lg" />
        </button>
      </div>

      {/* ACTION SELECTION VIEW                                              */}
      {!selectedAction && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-base sm:text-lg">
              Select an Action
            </h3>
            <p className="text-sm text-gray-600">
              Choose what you want to do with an asset
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Admin or Manager approval may be required
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {actionItems.map((row, index) => (
              <div
                key={index}
                className=" grid gap-4 w-full grid-cols-1 sm:grid-cols-2"
                style={{
                  gridTemplateColumns:
                    window.innerWidth >= 1024
                      ? `repeat(${row.length}, minmax(0,1fr))`
                      : undefined,
                }}

              >

                {row.map((item) => {
                  const isDisabled =
                    item.allowedRoles &&
                    !item.allowedRoles.includes(getCurrentUserRole());

                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        !isDisabled && setSelectedAction(item.key)
                      }
                      className={`
                        p-4 rounded-lg border shadow-sm bg-white
                        transition-all duration-300
                        ${item.color}
                        ${isDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-3 rounded-lg ${item.iconBg}`}
                        >
                          <item.icon className="text-xl sm:text-2xl" />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                            {item.title}
                            {isDisabled && (
                              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                Restricted
                              </span>
                            )}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {item.description}
                          </p>
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

      {/* FORM VIEW                                                          */}
      {selectedAction && selectedItem && (
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <Shared_Button
              variant="ghost"
              onClick={() => setSelectedAction(null)}
              className="text-blue-600 flex items-center gap-2"
            >
              <IoMdArrowRoundBack /> Back to Actions
            </Shared_Button>

            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${selectedItem.iconBg}`}>
                <selectedItem.icon className="text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedItem.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedItem.description}
                </p>
              </div>
            </div>
          </div>

          {/* Forms */}
          {selectedItem.key === "assign" && (
            <AssignAssetForm
              session={session}
              RefetchAll={RefetchAll}
              handleClose={handleClose}
              userOptions={userOptions}
              unassignedAssets={unassignedAssets}
            />
          )}

          {selectedItem.key === "request" && (
            <RequestAssetForm
              session={session}
              RefetchAll={RefetchAll}
              handleClose={handleClose}
              unassignedAssets={unassignedAssets}
            />
          )}

          {selectedItem.key === "return" && (
            <ReturnAssetForm
              session={session}
              RefetchAll={RefetchAll}
              myAssets={myAssets}
              handleClose={handleClose}
            />
          )}

          {selectedItem.key === "repair" && (
            <RepairAssetForm
              session={session}
              RefetchAll={RefetchAll}
              myAssets={myAssets}
              handleClose={handleClose}
            />
          )}

          {selectedItem.key === "retire" && (
            <RetireAssetForm
              session={session}
              RefetchAll={RefetchAll}
              handleClose={handleClose}
              unassignedAssets={unassignedAssets}
            />
          )}

          {selectedItem.key === "transfer" && (
            <TransferAssetForm
              session={session}
              RefetchAll={RefetchAll}
              myAssets={myAssets}
              handleClose={handleClose}
              userOptions={userOptions}
            />
          )}

          {selectedItem.key === "update" && (
            <UpdateAssetForm
              session={session}
              RefetchAll={RefetchAll}
              myAssets={myAssets}
              handleClose={handleClose}
            />
          )}

          {selectedItem.key === "dispose" && (
            <DisposeAssetForm
              session={session}
              RefetchAll={RefetchAll}
              handleClose={handleClose}
              unassignedAssets={unassignedAssets}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Make_New_Request;
