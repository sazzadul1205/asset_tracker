// Hooks
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { useQuery } from "@tanstack/react-query";

const LocationToDepartment = ({ location, showOnlyName = false }) => {
  const axiosPublic = useAxiosPublic();

  // Fetch department data based on location (dept_id)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["IndividualLocationData", location],
    queryFn: async () => {
      if (!location) return null;
      const res = await axiosPublic.get(`/Departments/department/${location}`);
      return res.data.data;
    },
    keepPreviousData: true,
    enabled: !!location,
  });

  // Determine text to display
  const displayText = isLoading
    ? "Loading..."
    : isError
      ? error?.message || "Failed to load department"
      : data
        ? showOnlyName
          ? data.department_name
          :
          <p>{data.department_name}</p>
        : "Unknown";

  // Determine background color (optional)
  const backgroundColor = isLoading
    ? "#f0f0f0"
    : isError
      ? "#f87171"
      : data?.selectedColor || "#e2e8f0";

  return (
    <div
    >
      <p className="text-sm font-medium text-gray-800">{displayText}</p>
    </div>
  );
};

export default LocationToDepartment;
