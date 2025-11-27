// Next Components
import Image from "next/image";

// Packages
import { useQuery } from "@tanstack/react-query";

// Tooltip
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

// Hooks
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const CategoryToIcon = ({
  id,
  category,
  showOnlyName = false,
  enableTooltip = true,
}) => {
  const axiosPublic = useAxiosPublic();

  // STEP 1: Fetch asset only if ID is provided
  const {
    data: AssetCategoryData,
  } = useQuery({
    queryKey: ["AssetCategoryData", id],
    queryFn: () =>
      axiosPublic
        .get(`/Assets/${id}?fields=asset_category`)
        .then((res) => res.data.data),
    enabled: !!id, // Only fetch if id exists
  });

  // Resolve category source:
  const resolvedCategory = category || AssetCategoryData?.asset_category;

  // STEP 2: Fetch category based on resolvedCategory
  const {
    data: CategoryData,
    error: CategoryError,
    isError: CategoryIsError,
    isLoading: CategoryLoading,
  } = useQuery({
    queryKey: ["CategoryData", resolvedCategory],
    queryFn: () =>
      axiosPublic
        .get(`/AssetCategory/ByCategory/${resolvedCategory}`)
        .then((res) => res.data.data),
    enabled: !!resolvedCategory, // only fetch when category is known
  });

  // Determine display text
  const displayText = CategoryLoading
    ? "Loading..."
    : CategoryIsError
      ? (CategoryError?.message || "Failed to load category")
      : showOnlyName
        ? CategoryData?.category_name
        : `${CategoryData?.category_name} (${CategoryData?.ac_id})`;

  // Background color
  const backgroundColor = CategoryLoading
    ? "#f0f0f0"
    : CategoryIsError
      ? "#f87171"
      : CategoryData?.selectedColor || "#e2e8f0";

  const tooltipId = `category-tooltip-${resolvedCategory || "unknown"}`;

  return (
    <div>
      {/* TEXT MODE */}
      {showOnlyName ? (
        <p className="px-2 py-1 rounded text-sm font-medium text-gray-800">
          {displayText}
        </p>

        // ICON MODE
      ) : (
        <div
          className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg transition-colors duration-200"
          style={{ backgroundColor }}
          {...(enableTooltip
            ? {
              "data-tooltip-id": tooltipId,
              "data-tooltip-content": displayText,
            }
            : {})}
        >
          <Image
            src={
              CategoryData?.iconImage ||
              "https://i.ibb.co/9996NVtk/info-removebg-preview.png"
            }
            alt={CategoryData?.category_name || "Unknown Category"}
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
      )}

      {/* Tooltip */}
      {!showOnlyName && enableTooltip && (
        <Tooltip id={tooltipId} place="top" effect="solid" />
      )}
    </div>
  );
};

export default CategoryToIcon;
