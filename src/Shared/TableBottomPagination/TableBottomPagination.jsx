import React from "react";

// Icons
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

/**
 * TableBottomPagination Component
 * 
 * Renders a table footer with pagination controls, including:
 * - Showing item range
 * - Page indicator
 * - Previous/Next buttons with disabled states and proper cursor
 * 
 * @param {number} totalItems - Total number of items in the dataset
 * @param {number} totalPages - Total number of pages available
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} itemsPerPage - Number of items per page
 * @param {function} setCurrentPage - Function to update the current page
 * @param {string} [paginationText] - Optional label for the items section (default: "Items")
 * @param {number} [colSpan] - Number of columns to span (default: 7)
 * @returns {JSX.Element} JSX element representing the table footer
 */
const TableBottomPagination = ({
  colSpan = 7,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  paginationText,
}) => {
  // Calculate the range of items currently displayed
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Determine if Previous or Next buttons should be disabled
  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages || totalPages === 0;

  return (
    <tfoot>
      <tr>
        <td colSpan={colSpan} className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-black">
            {/* Display current item range and optional label */}
            <div>
              <p className="text-sm">
                Showing {totalItems === 0 ? 0 : startItem} to {endItem} of {totalItems}
              </p>
              <p className="text-xs font-semibold text-gray-500">
                {paginationText || "Items"}
              </p>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-end space-x-2 mt-4">
              {/* Previous Button */}
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 transition
                  ${isPrevDisabled
                    ? "opacity-50 cursor-not-allowed pointer-events-none bg-white"
                    : "bg-white hover:bg-gray-100 hover:shadow-sm"
                  }`}
                disabled={isPrevDisabled}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <FaAngleLeft /> Prev
              </button>

              {/* Page Indicator */}
              <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 font-medium">
                Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
              </div>

              {/* Next Button */}
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 transition
                  ${isNextDisabled
                    ? "opacity-50 cursor-not-allowed pointer-events-none bg-white"
                    : "bg-white hover:bg-gray-100 hover:shadow-sm"
                  }`}
                disabled={isNextDisabled}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next <FaAngleRight />
              </button>
            </div>
          </div>
        </td>
      </tr>
    </tfoot>
  );
};

export default TableBottomPagination;
