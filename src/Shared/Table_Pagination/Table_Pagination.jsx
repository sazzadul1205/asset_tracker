import React from "react";

// Icons
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

const Table_Pagination = ({
  colSpan = 7,
  totalItems = 0,
  setCurrentPage,
  totalPages = 0,
  currentPage = 1,
  itemsPerPage = 10,
  paginationText = "Items",
  mobileView = false,
}) => {
  // If there is no data, normalize values
  const safeCurrentPage = totalPages === 0 ? 0 : currentPage;

  // Calculate visible item range
  const startItem =
    totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;

  // Calculate visible item range
  const endItem =
    totalItems === 0
      ? 0
      : Math.min(safeCurrentPage * itemsPerPage, totalItems);

  // Button state
  const isPrevDisabled = safeCurrentPage <= 1;
  const isNextDisabled =
    safeCurrentPage === totalPages || totalPages === 0;
  const isFirstPageDisabled = safeCurrentPage === 1;
  const isLastPageDisabled = safeCurrentPage === totalPages;

  // Page handlers
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

  const handleFirst = () => {
    if (!isFirstPageDisabled) {
      setCurrentPage(1);
    }
  };

  const handleLast = () => {
    if (!isLastPageDisabled) {
      setCurrentPage(totalPages);
    }
  };

  // Mobile-only pagination
  if (mobileView) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Mobile Pagination */}
        <div className="flex flex-col gap-4">
          {/* Info */}
          <div className="text-center">
            <p className="text-sm text-gray-700">
              Showing <strong className="text-gray-900">{startItem}</strong> to{" "}
              <strong className="text-gray-900">{endItem}</strong> of{" "}
              <strong className="text-gray-900">{totalItems}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Page {safeCurrentPage} of {totalPages}
            </p>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center justify-between">
            {/* First Page Button */}
            <button
              type="button"
              aria-label="First page"
              disabled={isFirstPageDisabled}
              onClick={handleFirst}
              className={`p-3 rounded-lg border transition ${isFirstPageDisabled
                  ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300"
                  : "bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                }`}
            >
              <FaAngleDoubleLeft className="w-4 h-4" />
            </button>

            {/* Previous Button */}
            <button
              type="button"
              aria-label="Previous page"
              disabled={isPrevDisabled}
              onClick={handlePrev}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition ${isPrevDisabled
                  ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300"
                  : "bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                }`}
            >
              <FaAngleLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Indicator - Mobile */}
            <div className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-300 font-medium text-sm">
              {safeCurrentPage} / {totalPages}
            </div>

            {/* Next Button */}
            <button
              type="button"
              aria-label="Next page"
              disabled={isNextDisabled}
              onClick={handleNext}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition ${isNextDisabled
                  ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300"
                  : "bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                }`}
            >
              <span className="hidden sm:inline">Next</span>
              <FaAngleRight className="w-4 h-4" />
            </button>

            {/* Last Page Button */}
            <button
              type="button"
              aria-label="Last page"
              disabled={isLastPageDisabled}
              onClick={handleLast}
              className={`p-3 rounded-lg border transition ${isLastPageDisabled
                  ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300"
                  : "bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                }`}
            >
              <FaAngleDoubleRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page Numbers - Horizontal Scroll for Mobile */}
          {totalPages > 1 && (
            <div className="mt-2">
              <div className="flex items-center justify-center gap-1 overflow-x-auto py-2 scrollbar-hide">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (safeCurrentPage <= 4) {
                    pageNum = i + 1;
                  } else if (safeCurrentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = safeCurrentPage - 3 + i;
                  }

                  if (pageNum > totalPages || pageNum < 1) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-10 px-3 py-2 rounded-lg text-sm font-medium transition ${safeCurrentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop table pagination
  return (
    <tfoot>
      <tr>
        <td colSpan={colSpan} className="px-4 md:px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-black">
            {/* Info Section */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-700">
                Showing <strong className="text-gray-900">{startItem}</strong> to{" "}
                <strong className="text-gray-900">{endItem}</strong> of{" "}
                <strong className="text-gray-900">{totalItems}</strong> {paginationText}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Page {safeCurrentPage} of {totalPages}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Quick Page Numbers */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (safeCurrentPage <= 3) {
                      pageNum = i + 1;
                    } else if (safeCurrentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = safeCurrentPage - 2 + i;
                    }

                    if (pageNum > totalPages || pageNum < 1) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-10 px-3 py-2 rounded-lg text-sm font-medium transition ${safeCurrentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  type="button"
                  aria-label="First page"
                  disabled={isFirstPageDisabled}
                  onClick={handleFirst}
                  className={`hidden sm:flex items-center justify-center p-3 rounded-lg border transition ${isFirstPageDisabled
                      ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300"
                      : "bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                    }`}
                >
                  <FaAngleDoubleLeft className="w-4 h-4" />
                </button>

                {/* Previous */}
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={isPrevDisabled}
                  onClick={handlePrev}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition ${isPrevDisabled
                      ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300"
                      : "bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                    }`}
                >
                  <FaAngleLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Current Page Info */}
                <div className="px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg border border-gray-300 font-medium text-sm whitespace-nowrap">
                  Page {safeCurrentPage} of {totalPages}
                </div>

                {/* Next */}
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={isNextDisabled}
                  onClick={handleNext}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition ${isNextDisabled
                      ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300"
                      : "bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                    }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <FaAngleRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  aria-label="Last page"
                  disabled={isLastPageDisabled}
                  onClick={handleLast}
                  className={`hidden sm:flex items-center justify-center p-3 rounded-lg border transition ${isLastPageDisabled
                      ? "opacity-40 cursor-not-allowed bg-gray-100 border-gray-300"
                      : "bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm cursor-pointer"
                    }`}
                >
                  <FaAngleDoubleRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </tfoot>
  );
};

// Custom CSS for scrollbar hiding
const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Table_Pagination;