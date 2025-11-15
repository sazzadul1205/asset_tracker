// Hooks
import useAxiosPublic from "@/Hooks/useAxiosPublic";

// Tanstack
import { useQuery } from "@tanstack/react-query";

const UserDepartmentView = ({ department }) => {
  const axiosPublic = useAxiosPublic();

  // Fetch Department
  const { data, isLoading, error } = useQuery({
    queryKey: ["DepartmentInfo", department],
    queryFn: async () => {
      const res = await axiosPublic.get(`/Departments/department/${department}`);
      return res?.data?.data;
    },
    enabled: !!department,
  });

  // Loading
  if (isLoading) {
    return <span className="text-gray-500">{department}</span>;
  }

  // Error OR No data → fallback to parent
  if (error || !data) {
    return <span className="text-gray-800 font-medium">{department}</span>;
  }

  // Success
  return (
    <span className="font-medium text-gray-800">
      {data.department_name || department}
    </span>
  );
};

export default UserDepartmentView;
