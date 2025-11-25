// Packages
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AssignToRole = ({ email, showOnlyName = false }) => {
  const axiosPublic = useAxiosPublic();

  // Fetch user data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["UserByEmail", email],
    queryFn: () => axiosPublic.get(`/Users/ByEmail/${email}`).then(res => res.data),
    keepPreviousData: true,
    enabled: !!email,
  });

  // Determine text to display
  const displayText = isLoading
    ? "Loading..."
    : isError
      ? "Not Found"
      : data
        ? showOnlyName
          ? data?.full_name || "No Name"
          : data?.position || "No Position"
        : "Un Assigned";

  return (
    <p className="text-sm font-medium text-gray-800">{displayText}</p>
  );
};

export default AssignToRole;
