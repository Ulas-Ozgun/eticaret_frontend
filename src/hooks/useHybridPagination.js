import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const API_URL = "https://localhost:7258/api";

export default function useHybridPagination({
  categoryId,
  search,
  includePending = false,
  sellerId = null,
  sortBy = null,
}) {
  const [products, setProducts] = useState([]);
  const [block, setBlock] = useState(1);
  const [page, setPage] = useState(1);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMoreInBlock, setHasMoreInBlock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const abortControllerRef = useRef(null);
  const refreshCounterRef = useRef(0);

  const fetchProducts = useCallback(
    async (targetBlock, targetPage, append = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      try {
        const params = {
          block: targetBlock,
          page: targetPage,
          pageSize: 20,
        };
        if (categoryId) params.categoryId = categoryId;
        if (search) params.search = search;
        if (includePending) params.includePending = true;
        if (sellerId) params.sellerId = sellerId;
        if (sortBy) params.sortBy = sortBy;

        const res = await axios.get(`${API_URL}/Product/paginated`, {
          params,
          signal: abortControllerRef.current.signal,
        });

        const data = res.data;

        setProducts((prev) => (append ? [...prev, ...data.items] : data.items));
        setTotalBlocks(data.totalBlocks);
        setTotalCount(data.totalCount);
        setHasMoreInBlock(data.hasMoreInBlock);
        setBlock(data.currentBlock);
        setPage(data.currentPage);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Ürünler yüklenirken hata:", err);
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [categoryId, search, includePending, sellerId, sortBy]
  );

  useEffect(() => {
    setProducts([]);
    setBlock(1);
    setPage(1);
    setInitialLoading(true);
    fetchProducts(1, 1, false);
  }, [categoryId, search, includePending, sellerId, sortBy, fetchProducts]);

  const loadMoreInBlock = useCallback(() => {
    if (loading || !hasMoreInBlock) return;
    const nextPage = page + 1;
    fetchProducts(block, nextPage, true);
  }, [loading, hasMoreInBlock, page, block, fetchProducts]);

  const goToBlock = useCallback(
    (targetBlock) => {
      if (targetBlock < 1 || targetBlock > totalBlocks || targetBlock === block)
        return;
      setProducts([]);
      setPage(1);
      setInitialLoading(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      fetchProducts(targetBlock, 1, false);
    },
    [totalBlocks, block, fetchProducts]
  );

  const refresh = useCallback(() => {
    refreshCounterRef.current += 1;
    setProducts([]);
    setPage(1);
    setInitialLoading(true);
    fetchProducts(block, 1, false);
  }, [block, fetchProducts]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!hasMoreInBlock || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreInBlock && !loading) {
          loadMoreInBlock();
        }
      },
      { rootMargin: "200px" }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observerRef.current.observe(sentinel);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMoreInBlock, loading, loadMoreInBlock]);

  return {
    products,
    block,
    page,
    totalBlocks,
    totalCount,
    hasMoreInBlock,
    loading,
    initialLoading,
    sentinelRef,
    goToBlock,
    refresh,
  };
}
