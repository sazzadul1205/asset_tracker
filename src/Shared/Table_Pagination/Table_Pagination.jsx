import React from "react";
// Icons
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const Table_Pagination = ({
  colSpan = 7,
  totalItems = 0,
  totalPages = 0,
  currentPage = 1,
  itemsPerPage = 10,
  setCurrentPage,
  paginationText = "Items",
}) => {
  // If there is no data, normalize values
  const safeCurrentPage = totalPages === 0 ? 0 : currentPage;

  // Calculate visible item range
  const startItem =
    totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;

  const endItem =
    totalItems === 0
      ? 0
      : Math.min(safeCurrentPage * itemsPerPage, totalItems);

  // Button state
  const isPrevDisabled = safeCurrentPage <= 1;
  const isNextDisabled =
    safeCurrentPage === totalPages || totalPages === 0;

  // Page handlers (safe guards included)
  const handlePrev = () => {
    if (!isPrevDisabled) {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleNext = () => {
    if (!isNextDisabled) {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }
  };

  return (
    <tfoot>
      <tr>
        <td colSpan={colSpan} className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-black">

            {/* Info */}
            <div>
              <p className="text-sm">
                Showing <strong>{startItem}</strong> to{" "}
                <strong>{endItem}</strong> of{" "}
                <strong>{totalItems}</strong>
              </p>
              <p className="text-xs font-semibold text-gray-500">
                {paginationText}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 justify-end">
              {/* Previous */}
              <button
                type="button"
                aria-label="Previous page"
                disabled={isPrevDisabled}
                onClick={handlePrev}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition
                  ${isPrevDisabled
                    ? "opacity-50 cursor-not-allowed bg-white"
                    : "bg-white hover:bg-gray-100 hover:shadow-sm"
                  }`}
              >
                <FaAngleLeft />
                Prev
              </button>

              {/* Page Indicator */}
              <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border font-medium">
                Page {safeCurrentPage} of {totalPages}
              </div>

              {/* Next */}
              <button
                type="button"
                aria-label="Next page"
                disabled={isNextDisabled}
                onClick={handleNext}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition
                  ${isNextDisabled
                    ? "opacity-50 cursor-not-allowed bg-white"
                    : "bg-white hover:bg-gray-100 hover:shadow-sm"
                  }`}
              >
                Next
                <FaAngleRight />
              </button>
            </div>
          </div>
        </td>
      </tr>
    </tfoot>
  );
};

export default Table_Pagination;
