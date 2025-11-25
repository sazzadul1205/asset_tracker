import AssignToRole from '@/app/Admin/Assets/AssignToRole/AssignToRole';

const RequestMessage = ({
  request,
  UserEmail
}) => {
  return (
    <div>
      {request?.action_type && (
        <div
          className={`mt-2 p-3 rounded-lg text-sm font-medium border flex flex-col gap-2 ${request.action_type === "assign"
            ? "bg-blue-50 border-blue-200 text-blue-800"
            : request.action_type === "request"
              ? "bg-green-50 border-green-200 text-green-800"
              : request.action_type === "return"
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : request.action_type === "repair"
                  ? "bg-orange-50 border-orange-200 text-orange-800"
                  : ""
            }`}
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
        </div>
      )}
    </div>
  );
};

export default RequestMessage;