// Packages
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AssignToRole = ({ email, showOnlyName = false }) => {
  const axiosPublic = useAxiosPublic();

  // Fetch IndividualCategory
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["UserByEmail", email],
    queryFn: () =>
      axiosPublic
        .get(`/Users/ByEmail/${email}`)
        .then((res) => res.data),
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
          ? data?.position
          : data?.position
        : "Un Assigned";


  return (
    <p className="text-sm font-medium text-gray-800">{displayText}</p>
  );
};

export default AssignToRole;