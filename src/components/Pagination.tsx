interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex justify-center items-center gap-3 py-10 text-sm">

      {/* Previous */}
      <button
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        className="text-slate-500 hover:text-slate-900 disabled:opacity-40 transition"
      >
        ‹ Previous
      </button>

      {/* Page Numbers */}
      {pages.map((p, index) =>
        p === "..." ? (
          <span
            key={index}
            className="text-slate-400 px-2"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(Number(p))}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${
              currentPage === p
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
        className="text-slate-500 hover:text-slate-900 disabled:opacity-40 transition"
      >
        Next ›
      </button>
    </div>
  );
}