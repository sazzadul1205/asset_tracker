import AssignToRole from '@/app/Admin/Assets/AssignToRole/AssignToRole';

const RequestMessage = ({
  request,
  UserEmail
}) => {

  // Get action styles
  const getActionStyles = (action) => {
    switch (action) {
      case "assign":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "request":
        return "bg-green-50 border-green-200 text-green-800";
      case "return":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "repair":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "retire":
        return "bg-red-50 border-red-200 text-red-800";
      case "transfer":
        return "bg-purple-50 border-purple-200 text-purple-800";
      case "update":
        return "bg-cyan-50 border-cyan-200 text-cyan-800";
      case "dispose":
        return "bg-gray-50 border-gray-200 text-gray-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };


  return (
    <div>
      {request?.action_type && (
        <div
          className={`mt-2 p-3 rounded-lg text-sm font-medium border flex flex-col gap-2 
            ${getActionStyles(request.action_type)}`}
        >
          {/* Assign Request */}
          {request.action_type === "assign" && (
            UserEmail === request?.requested_by?.email ? (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Assign Request:</span>
                When approved, this asset will be assigned to
                <AssignToRole employee_id={request?.assign_to?.value} showOnlyName />
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Assign Request:</span>
                When approved, this asset will be assigned to <b>you</b>.
              </div>
            )
          )}

          {/* Request Request */}
          {request.action_type === "request" && (
            UserEmail === request?.requested_by?.email ? (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Request Asset:</span>
                When approved, this asset will be transferred to <b>the assigned user</b>.
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Request Asset:</span>
                When approved, this asset will be transferred to <b>you</b>.
              </div>
            )
          )}

          {/* Return Request */}
          {request.action_type === "return" && (
            UserEmail === request?.requested_by?.email ? (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Return Asset:</span>
                When approved, this asset will be returned to <b>Inventory</b>.
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Return Asset:</span>
                This asset is being returned by <b>{request?.requested_by?.email}</b>.
              </div>
            )
          )}

          {/* Repair Request */}
          {request.action_type === "repair" && (
            UserEmail === request?.requested_by?.email ? (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Repair Request:</span>
                This asset will be reviewed and approved by <b>the Manager</b>.
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Repair Request:</span>
                <b>{request?.requested_by?.email}</b> submitted this repair request.
              </div>
            )
          )}

          {/* Retire Request */}
          {request.action_type === "retire" && (
            UserEmail === request?.requested_by?.email ? (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Retire Request:</span>
                When approved, this asset will be retired.
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Retire Request:</span>
                <b>{request?.requested_by?.email}</b> submitted this retire request.
              </div>
            )
          )}

          {/* Transfer Request */}
          {request.action_type === "transfer" && (
            <div className="flex gap-2 items-center">
              <span className="font-bold">Transfer Request:</span>

              {UserEmail === request?.requested_by?.email ? (
                <>
                  When approved, this asset will be transferred to&nbsp;
                  {request?.transfer_to?.label}.
                </>
              ) : (
                <>
                  <b>{request?.requested_by?.email}</b> requested to transfer this asset to&nbsp;
                  <b>{request?.transfer_to?.label}</b>.
                </>
              )}
            </div>
          )}

          {/* Update Request */}
          {request.action_type === "update" && (
            UserEmail === request?.requested_by?.email ? (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Update Request:</span>
                When approved, this asset will be updated.
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Update Request:</span>
                <b>{request?.requested_by?.email}</b> submitted this update request.
              </div>
            )
          )}

          {/* Dispose Request */}
          {request.action_type === "dispose" && (
            UserEmail === request?.requested_by?.email ? (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Dispose Request:</span>
                When approved, this asset will be disposed.
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <span className="font-bold">Dispose Request:</span>
                <b>{request?.requested_by?.email}</b> submitted this dispose request.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default RequestMessage;