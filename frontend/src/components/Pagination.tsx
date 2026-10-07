import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  currentPage?: number;
}

export default function Pagination({ onNext, onPrev, hasNext, hasPrev, currentPage }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl mt-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-400">
            Showing results {currentPage && <span className="font-medium text-gray-200">Page {currentPage}</span>}
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium ${
                hasPrev ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-l-0 border-gray-700 bg-gray-800 text-sm font-medium ${
                hasNext ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 cursor-not-allowed"
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
