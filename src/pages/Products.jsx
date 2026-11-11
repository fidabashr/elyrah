import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

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

  // Read selected category from URL
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

  // Store fetched products in Redux
  useEffect(() => {
    if (data) {
      dispatch(setProducts(data));
    }
  }, [data, dispatch]);

  // Get categories from products
  const categories = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  
const allCategories = categories;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sort]);

  // Update category in URL
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
    return <Loading message="Loading products..." />;
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
    <main className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Page Heading */}
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-widest text-gray-500">
            Our Collection
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Modest Fashion
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Discover elegant and comfortable pieces designed
            for your everyday style.
          </p>
        </div>

        {/* Search, Category and Sorting */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white px-4 py-3 outline-none focus:border-stone-700"
          />

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) =>
              handleCategoryChange(e.target.value)
            }
            className="w-full rounded-md border border-stone-300 bg-white px-4 py-3"
          >
            <option value="All">All Categories</option>

            {allCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* Sorting */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white px-4 py-3"
          >
            <option value="default">Default Sorting</option>
            <option value="low-high">
              Price: Low to High
            </option>
            <option value="high-low">
              Price: High to Low
            </option>
          </select>
        </div>

        {/* Product Count */}
        <p className="mb-5 text-sm text-gray-600">
          Showing {currentProducts.length} of{" "}
          {filteredProducts.length} products
        </p>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            message="Try changing your search or category filter."
          />
        ) : (
          <ProductGrid products={currentProducts} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">

           
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {/* {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => changePage(page)}
                className={`rounded-md px-4 py-2 text-sm ${
                  currentPage === page
                    ? "bg-stone-900 text-white"
                    : "border border-stone-300 bg-white"
                }`}
              >
                {page}
              </button>
            ))} */}

            {/* Next */}
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>

          </div>
        )}

      </div>
    </main>
  );
}

export default Products;
