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
  category,
  showOnlyName = false,
  enableTooltip = true,
}) => {
  const axiosPublic = useAxiosPublic();

  // Fetch IndividualCategory
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["IndividualCategoryData", category],
    queryFn: () =>
      axiosPublic
        .get(`/AssetCategory/ByCategory/${category}`)
        .then((res) => res.data.data),
    keepPreviousData: true,
    enabled: !!category,
  });

  // Determine text to display
  const displayText = isLoading
    ? "Loading..."
    : isError
      ? error?.message || "Failed to load category"
      : showOnlyName
        ? data?.category_name
        : `${data?.category_name} (${data?.ac_id})`;

  // Background color
  const backgroundColor = isLoading
    ? "#f0f0f0"
    : isError
      ? "#f87171"
      : data?.selectedColor || "#e2e8f0";

  const tooltipId = `category-tooltip-${category}`;

  return (
    <div>
      {showOnlyName ? (
        <p className="px-2 py-1 rounded text-sm font-medium text-gray-800">
          {displayText}
        </p>
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
              data?.iconImage ||
              "https://i.ibb.co/9996NVtk/info-removebg-preview.png"
            }
            alt={data?.category_name || "Unknown Category"}
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
      )}

      {/* Tooltip render only if allowed */}
      {!showOnlyName && enableTooltip && (
        <Tooltip id={tooltipId} place="top" effect="solid" />
      )}
    </div>
  );
};

export default CategoryToIcon;
