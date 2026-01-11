// src/app/admin/departments/CategoryId_To_CategoryBlock/CategoryId_To_CategoryBlock.jsx

// Next Components
import Image from "next/image";

// React Components
import React from "react";
import { useQuery } from "@tanstack/react-query";

// Hooks
import useAxiosPublic from "@/hooks/useAxiosPublic";

// Icons
import { FiFolder, FiImage } from "react-icons/fi";

const CategoryId_To_CategoryBlock = ({
  categoryId,
  view = "icon",
  size = "md",
  showName = false,
  showTooltip = true,
}) => {
  const axiosPublic = useAxiosPublic();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["AssetCategoryName", categoryId],
    queryFn: async () => {
      if (!categoryId || categoryId === "unassigned") return null;
      const res = await axiosPublic.get(
        `/assetsCategories/${categoryId}`
      );
      return res.data?.data;
    },
    enabled: !!categoryId && categoryId !== "unassigned",
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Size configurations
  const sizeConfigs = {
    xs: {
      iconSize: "w-6 h-6",
      imageSize: 16,
      textSize: "text-xs",
      containerSize: "w-8 h-8",
    },
    sm: {
      iconSize: "w-8 h-8",
      imageSize: 20,
      textSize: "text-sm",
      containerSize: "w-10 h-10",
    },
    md: {
      iconSize: "w-10 h-10",
      imageSize: 24,
      textSize: "text-base",
      containerSize: "w-12 h-12",
    },
    lg: {
      iconSize: "w-12 h-12",
      imageSize: 28,
      textSize: "text-lg",
      containerSize: "w-14 h-14",
    },
  };

  const config = sizeConfigs[size] || sizeConfigs.md;

  // Handle unassigned/empty category
  if (!categoryId || categoryId === "unassigned") {
    return (
      <div className="flex items-center gap-2">
        <div className={`${config.containerSize} rounded-lg bg-gray-100 flex items-center justify-center`}>
          <FiFolder className={`text-gray-400 ${config.iconSize}`} />
        </div>
        {showName && (
          <span className={`${config.textSize} text-gray-500`}>
            Unassigned
          </span>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${config.containerSize} rounded-lg bg-gray-200 animate-pulse`} />
        {showName && (
          <div className={`h-4 w-20 bg-gray-200 rounded animate-pulse ${config.textSize}`} />
        )}
      </div>
    );
  }

  // Error state or not found
  if (isError || !data?.info?.name) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${config.containerSize} rounded-lg bg-red-50 flex items-center justify-center`}>
          <FiImage className={`text-red-400 ${config.iconSize}`} />
        </div>
        {showName && (
          <span className={`${config.textSize} text-red-500`}>
            Not Found
          </span>
        )}
      </div>
    );
  }

  // -------- NAME VIEW --------
  if (view === "name") {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`rounded-lg flex items-center justify-center ${config.containerSize}`}
          style={{ backgroundColor: data.info.iconBgColor || "#e2e8f0" }}
        >
          <Image
            src={data.info.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
            alt={data.info.name}
            width={config.imageSize}
            height={config.imageSize}
            className="object-contain"
          />
        </div>
        <span className={`font-medium text-gray-800 ${config.textSize}`}>
          {data.info.name}
        </span>
      </div>
    );
  }

  // -------- ICON VIEW (default) --------
  return (
    <div className="relative group">
      <div
        className={`rounded-lg flex items-center justify-center ${config.containerSize}`}
        style={{ backgroundColor: data.info.iconBgColor || "#e2e8f0" }}
      >
        <Image
          src={data.info.icon || "https://i.ibb.co/9996NVtk/info-removebg-preview.png"}
          alt={data.info.name}
          width={config.imageSize}
          height={config.imageSize}
          className="object-contain"
        />
      </div>

      {/* Tooltip on hover (desktop) */}
      {showTooltip && (
        <div className="hidden md:block absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 whitespace-nowrap">
          <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-3 shadow-lg">
            <div className="font-medium">{data.info.name}</div>
            <div className="text-gray-300 text-xs">Category ID: {categoryId}</div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        </div>
      )}

      {/* Show name if requested */}
      {showName && (
        <div className="mt-1 text-center">
          <p className={`text-gray-600 truncate ${config.textSize === "text-xs" ? "text-xs" : "text-sm"}`}>
            {data.info.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryId_To_CategoryBlock;