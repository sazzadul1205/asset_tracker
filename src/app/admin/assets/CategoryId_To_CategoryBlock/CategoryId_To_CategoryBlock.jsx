// src/app/admin/departments/CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock.jsx

// Next Components
import Image from "next/image";

// React Components
import React from "react";
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/hooks/useAxiosPublic";

const CategoryId_To_CategoryBlock = ({
  categoryId,
  view = "icon",
}) => {
  const axiosPublic = useAxiosPublic();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["AssetCategoryName", categoryId],
    queryFn: async () => {
      const res = await axiosPublic.get(
        `/assetsCategories/${categoryId}`
      );
      return res.data?.data;
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });

  // Loading
  if (isLoading) {
    return <span className="text-gray-400">Loading...</span>;
  }

  // Error or not found
  if (isError || !data?.info?.name) {
    return <span className="text-red-500">Not Found</span>;
  }

  // -------- NAME VIEW --------
  if (view === "name") {
    return (
      <span className="text-sm font-medium text-gray-800">
        {data.info.name}
      </span>
    );
  }

  // -------- ICON VIEW (default) --------
  return (
    <div
      className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
      style={{ backgroundColor: data.info.iconBgColor || "#e2e8f0" }}
    >
      <Image
        src={
          data.info.icon ||
          "https://i.ibb.co/9996NVtk/info-removebg-preview.png"
        }
        alt={data.info.name}
        width={32}
        height={32}
        className="object-contain"
      />
    </div>
  );
};

export default CategoryId_To_CategoryBlock;
