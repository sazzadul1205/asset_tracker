// Packages
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const UserDepartmentManager = ({ email, employee_id, showRoleLabel = true }) => {
  const axiosPublic = useAxiosPublic();

  // 1. Determine lookup type
  const lookupType = employee_id ? "employee_id" : email ? "email" : null;
  const queryKey = lookupType === "employee_id" ? ["UserByEmployeeId", employee_id] : ["UserByEmail", email];
  const queryFn =
    lookupType === "employee_id"
      ? () => axiosPublic.get(`/Users/${employee_id}`).then(res => res.data)
      : () => axiosPublic.get(`/Users/ByEmail/${email}`).then(res => res.data);

  // 2. Fetch user
  const { data: user, isLoading: userLoading, isError: userError } = useQuery({
    queryKey,
    queryFn,
    enabled: !!lookupType,
    keepPreviousData: true,
  });

  // 3. Fetch department info if not admin
  const { data: departmentInfo, isLoading: deptLoading, isError: deptError } = useQuery({
    queryKey: ["DepartmentInfoData", user?.department],
    queryFn: () => axiosPublic.get(`/Departments/department/${user?.department}?fields=manager`).then(res => res.data.data),
    enabled: !!user?.department && user?.access_level !== "admin",
    keepPreviousData: true,
  });

  // 4. Handle loading/error/no lookup
  if (!lookupType) return <span>No user lookup provided</span>;
  if (userLoading) return <span>Loading user…</span>;
  if (userError) return <span>Failed to load user</span>;

  // 5. Determine who to display: user themselves if admin, else department manager
  const displayName = user?.access_level === "admin" ? user.full_name : departmentInfo?.manager?.full_name;
  const roleLabel = user?.access_level === "admin" ? "Admin" : "Manager";

  // 6. Department handling for non-admin
  if (user?.access_level !== "admin") {
    if (!user?.department) return <span>No department assigned</span>;
    if (deptLoading) return <span>Loading manager…</span>;
    if (deptError) return <span>Failed to load department</span>;
    if (!departmentInfo?.manager) return <span>No manager assigned</span>;
  }

  // 7. Render
  return showRoleLabel ? (
    <div className="flex flex-col">
      <p className="font-semibold">{displayName}</p>
      <p className="text-gray-500 text-sm">{roleLabel}</p>
    </div>
  ) : (
    <span>{displayName}</span>
  );
};

export default UserDepartmentManager;
