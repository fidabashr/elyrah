
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";

import { getProducts } from "../services/ProductServices";
import { setProducts } from "../redux/slices/productSlices";
import ProductGrid from "../components/ProductGrid";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const products = useSelector(
    (state) => state.products.products
  );

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 8;
  const category = searchParams.get("category") || "All";

  const {
    isPending,
    isError,
    error,
    data,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  useEffect(() => {
    if (data) {
      dispatch(setProducts(data));
    }
  }, [data, dispatch]);

  // Get categories dynamically from products
  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sort]);

  function handleCategoryChange(value) {
    if (value === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: value });
    }
  }

  // Filter products
  let filteredProducts = products.filter((product) => {
    const productName = product.name?.toLowerCase() || "";
    const productCategory = product.category?.toLowerCase() || "";

    const matchesSearch = productName.includes(
      search.toLowerCase()
    );

    const selectedCategory = category.toLowerCase();

    const matchesCategory =
      category === "All" ||
      productCategory.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Sort products
  if (sort === "low-high") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => Number(a.price) - Number(b.price)
    );
  }

  if (sort === "high-low") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  }

  // Pagination
  const totalPages = Math.ceil(
    filteredProducts.length / perPage
  );

  const start = (currentPage - 1) * perPage;

  const currentProducts = filteredProducts.slice(
    start,
    start + perPage
  );

  function changePage(page) {
    setCurrentPage(page);
  }

  if (isPending) {
    return <Loading message="Curating your collection..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F3EEE5]">

      {/* Page Heading */}
      <section className="border-b border-[#D8CBBB] bg-[#EAE1D5] px-5 py-12 md:py-16">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#796858]">
            ELYRAH / THE COLLECTION
          </p>

          <h1 className="font-display text-5xl font-medium text-[#342820] md:text-6xl">
            Modest Fashion
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#796858] md:text-base">
            Timeless silhouettes, thoughtful details and
            effortless elegance. Discover pieces made to
            complement your everyday style.
          </p>

          <div className="mx-auto mt-6 h-px w-16 bg-[#B7A48D]" />
        </div>
      </section>

      {/* Products Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">

        {/* Filters */}
        <div className="mb-8 rounded-xl border border-[#DED2C3] bg-[#FAF7F1] p-4 md:p-5">

          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={17} className="text-[#796858]" />

            <h2 className="text-sm font-semibold tracking-wide text-[#342820]">
              Refine Your Selection
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#967F6A]"
              />

              <input
                type="text"
                placeholder="Search by product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#D8CBBB] bg-[#F3EEE5] py-3 pl-11 pr-10 text-sm text-[#342820] outline-none transition placeholder:text-[#A08E7D] focus:border-[#796858] focus:ring-1 focus:ring-[#796858]"
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#796858] hover:text-[#342820]"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) =>
                handleCategoryChange(e.target.value)
              }
              className="w-full cursor-pointer rounded-lg border border-[#D8CBBB] bg-[#F3EEE5] px-4 py-3 text-sm text-[#342820] outline-none transition focus:border-[#796858]"
            >
              <option value="All">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-[#D8CBBB] bg-[#F3EEE5] px-4 py-3 text-sm text-[#342820] outline-none transition focus:border-[#796858]"
            >
              <option value="default">Default Sorting</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>

          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CBBB] pb-4">

          <div>
            <h2 className="font-display text-3xl font-semibold text-[#342820]">
              {category === "All" ? "All Pieces" : category}
            </h2>

            <p className="mt-1 text-xs text-[#796858]">
              Thoughtfully selected for you
            </p>
          </div>

          <p className="text-sm text-[#796858]">
            <span className="font-semibold text-[#342820]">
              {filteredProducts.length}
            </span>{" "}
            {filteredProducts.length === 1 ? "piece" : "pieces"} found
          </p>

        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-[#DED2C3] bg-[#FAF7F1] py-12">
            <EmptyState
              title="No pieces found"
              message="Try another search or explore a different category."
            />

            <div className="mt-5 flex justify-center">
              <button
                onClick={() => {
                  setSearch("");
                  setSort("default");
                  setSearchParams({});
                }}
                className="rounded-md bg-[#342820] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#FAF7F1] transition hover:bg-[#59483B]"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          <ProductGrid products={currentProducts} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">

            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 rounded-md border border-[#B7A48D] bg-[#FAF7F1] px-4 py-2.5 text-sm font-medium text-[#342820] transition hover:bg-[#E5D9C9] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="text-sm text-[#796858]">
              <span className="font-semibold text-[#342820]">
                {currentPage}
              </span>
              {" / "}
              {totalPages}
            </span>

            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 rounded-md border border-[#B7A48D] bg-[#FAF7F1] px-4 py-2.5 text-sm font-medium text-[#342820] transition hover:bg-[#E5D9C9] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} />
            </button>

          </div>
        )}

      </section>
    </main>
  );
}

export default Products;
