// Packages
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AssignToRole = ({ email, employee_id, showOnlyName = false }) => {
  const axiosPublic = useAxiosPublic();

  // Decide which lookup to use
  const lookupType = employee_id ? "employee_id" : email ? "email" : null;
  const queryKey = lookupType === "employee_id"
    ? ["UserByEmployeeId", employee_id]
    : ["UserByEmail", email];

  const queryFn =
    lookupType === "employee_id"
      ? () => axiosPublic.get(`/Users/${employee_id}`).then(res => res.data)
      : () => axiosPublic.get(`/Users/ByEmail/${email}`).then(res => res.data);

  // Fetch user
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
    enabled: !!lookupType,
    keepPreviousData: true,
  });

  const displayText = isLoading
    ? "Loading..."
    : isError
      ? "Not Found"
      : data
        ? showOnlyName
          ? data?.full_name || "No Name"
          : data?.position || "No Position"
        : "Un Assigned";

  return <span className="text-sm font-medium text-gray-800">{displayText}</span>;
};

export default AssignToRole;
