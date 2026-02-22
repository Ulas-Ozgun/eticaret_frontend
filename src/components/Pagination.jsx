import React, { useMemo } from "react";
import "./Pagination.css";

function Pagination({ currentBlock, totalBlocks, onBlockChange }) {
  const pages = useMemo(() => {
    if (totalBlocks <= 7) {
      return Array.from({ length: totalBlocks }, (_, i) => i + 1);
    }

    const result = [];
    result.push(1);

    let start = Math.max(2, currentBlock - 2);
    let end = Math.min(totalBlocks - 1, currentBlock + 2);

    if (currentBlock <= 3) {
      end = Math.min(5, totalBlocks - 1);
    }
    if (currentBlock >= totalBlocks - 2) {
      start = Math.max(totalBlocks - 4, 2);
    }

    if (start > 2) result.push("...");
    for (let i = start; i <= end; i++) result.push(i);
    if (end < totalBlocks - 1) result.push("...");

    result.push(totalBlocks);
    return result;
  }, [currentBlock, totalBlocks]);

  if (totalBlocks <= 1) return null;

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn pagination-nav"
        disabled={currentBlock === 1}
        onClick={() => onBlockChange(currentBlock - 1)}
      >
        ← Önceki
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`dots-${idx}`} className="pagination-dots">
            ...
          </span>
        ) : (
          <button
            key={p}
            className={`pagination-btn ${p === currentBlock ? "active" : ""}`}
            onClick={() => onBlockChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="pagination-btn pagination-nav"
        disabled={currentBlock === totalBlocks}
        onClick={() => onBlockChange(currentBlock + 1)}
      >
        Sonraki →
      </button>
    </div>
  );
}

export default Pagination;
