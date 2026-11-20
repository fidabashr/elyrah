import { useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";

import {
  getAdminProducts,
  addAdminProduct as addAdminProductService,
  updateAdminProduct as updateAdminProductService,
  deleteAdminProduct as deleteAdminProductService,
} from "../../services/adminProductServices";

import {
  setAdminProducts,
  addAdminProduct as addAdminProductAction,
  updateAdminProduct as updateAdminProductAction,
  deleteAdminProduct as deleteAdminProductAction,
} from "../../redux/slices/admin/adminProductSlice";

import { getProductImage } from "../../utils/getProductImage";

import {
  Plus,
  X,
  Search,
  Package,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

const initialFormData = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  image: "",
  sizes: "",
  colors: "",
};

function AdminProducts() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const products = useSelector(
    (state) => state.adminProducts.items
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const [deleteError, setDeleteError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 8;

  // Fetch products
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: getAdminProducts,
  });

  // Update Redux when products are fetched
  useEffect(() => {
    if (data) {
      dispatch(setAdminProducts(data));
    }
  }, [data, dispatch]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // Refresh product query
  function refreshProducts() {
    queryClient.invalidateQueries({
      queryKey: ["adminProducts"],
    });
  }

  // Close and reset form
  function closeForm() {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
  }

  // Add product
  const addMutation = useMutation({
    mutationFn: addAdminProductService,

    onSuccess: (newProduct) => {
      dispatch(addAdminProductAction(newProduct));
      refreshProducts();
      closeForm();
    },
  });

  // Update product
  const updateMutation = useMutation({
    mutationFn: ({ id, product }) =>
      updateAdminProductService(id, product),

    onSuccess: (updatedProduct) => {
      dispatch(updateAdminProductAction(updatedProduct));
      refreshProducts();
      closeForm();
    },
  });

  // Delete product
  const deleteMutation = useMutation({
    mutationFn: deleteAdminProductService,

    onSuccess: (deletedId) => {
      dispatch(deleteAdminProductAction(deletedId));
      refreshProducts();
      setDeleteError("");
    },

    onError: (error) => {
      setDeleteError(error.message);
    },
  });

  // Handle form input changes
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Open edit form
  function handleEdit(product) {
    setEditingId(product.id);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      description: product.description || "",
      image: product.image || "",
      sizes: (product.sizes || []).join(", "),
      colors: (product.colors || []).join(", "),
    });

    setShowForm(true);
    setDeleteError("");
  }

  // Submit product form
  function handleSubmit(e) {
    e.preventDefault();

    const product = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description.trim(),
      image: formData.image.trim(),

      sizes: formData.sizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean),

      colors: formData.colors
        .split(",")
        .map((color) => color.trim())
        .filter(Boolean),
    };

    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        product,
      });
    } else {
      addMutation.mutate(product);
    }
  }

  // Delete confirmation
  function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (confirmed) {
      setDeleteError("");
      deleteMutation.mutate(product.id);
    }
  }

  const isSaving =
    addMutation.isPending || updateMutation.isPending;

  const saveError =
    addMutation.error || updateMutation.error;

  // Loading state
  if (isPending) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw
            size={25}
            className="animate-spin text-[#796858]"
          />
          <p className="text-sm text-[#796858]">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-8 text-center">
        <p className="text-sm text-red-700">
          {error.message}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-[#342820] px-5 py-2.5 text-sm font-medium text-[#FAF7F1] hover:bg-[#796858]"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Categories
  const categories = [
    ...new Set(
      products.map((product) => product.category).filter(Boolean)
    ),
  ];

 // Search, category filtering and newest products first
const filteredProducts = [...products]
  .filter((product) => {
    const matchesSearch = String(product.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  })
  .reverse();

  // Pagination
  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      {/* Page Heading */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A49380]">
            Inventory Management
          </p>

          <h1 className="mt-1 font-display text-3xl font-semibold text-[#342820] md:text-4xl">
            Products
          </h1>

          <p className="mt-1 text-sm text-[#796858]">
            Manage your collections, product details and stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh products"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D8C8B5] bg-[#FAF7F1] text-[#796858] transition hover:bg-[#E5D9C9] disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={isFetching ? "animate-spin" : ""}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              if (showForm) {
                closeForm();
              } else {
                setEditingId(null);
                setFormData(initialFormData);
                setShowForm(true);
                setDeleteError("");
              }
            }}
            className="flex items-center gap-2 rounded-xl bg-[#342820] px-5 py-3 text-sm font-medium text-[#FAF7F1] shadow-sm transition hover:bg-[#796858]"
          >
            {showForm ? <X size={17} /> : <Plus size={17} />}
            {showForm ? "Close Form" : "Add Product"}
          </button>
        </div>
      </div>

      {/* Product Form */}
      {showForm && (
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] shadow-sm">
          <div className="border-b border-[#E5D9C9] px-5 py-5 md:px-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A49380]">
              Product Information
            </p>

            <h2 className="mt-1 font-display text-2xl font-semibold text-[#342820]">
              {editingId !== null ? "Edit Product" : "Add New Product"}
            </h2>

            <p className="mt-1 text-sm text-[#796858]">
              Enter the product details below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-7">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Product Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#514236]">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#B7A48D] focus:border-[#796858] focus:ring-2 focus:ring-[#B7A48D]/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#514236]">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  list="product-categories"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  placeholder="Select or enter category"
                  className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#B7A48D] focus:border-[#796858] focus:ring-2 focus:ring-[#B7A48D]/20"
                />

                <datalist id="product-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#514236]">
                  Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Enter price"
                  className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#B7A48D] focus:border-[#796858] focus:ring-2 focus:ring-[#B7A48D]/20"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#514236]">
                  Available Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                  placeholder="Enter stock quantity"
                  className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#B7A48D] focus:border-[#796858] focus:ring-2 focus:ring-[#B7A48D]/20"
                />
              </div>

              {/* Image Path */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#514236]">
                  Image Path
                </label>

                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  placeholder="src/assets/images/product.webp"
                  className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#B7A48D] focus:border-[#796858] focus:ring-2 focus:ring-[#B7A48D]/20"
                />

                <p className="mt-2 text-xs text-[#8B7A68]">
                  Enter the image path from your project's assets folder.
                </p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#514236]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="Write a description for this product..."
                  className="w-full resize-y rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#B7A48D] focus:border-[#796858] focus:ring-2 focus:ring-[#B7A48D]/20"
                />
              </div>

              {/* Sizes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#514236]">
                  Available Sizes
                </label>

                <input
                  type="text"
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleChange}
                  placeholder="S, M, L, XL"
                  className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#B7A48D] focus:border-[#796858] focus:ring-2 focus:ring-[#B7A48D]/20"
                />

                <p className="mt-2 text-xs text-[#8B7A68]">
                  Separate each size with a comma.
                </p>
              </div>

              {/* Colors */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#514236]">
                  Available Colors
                </label>

                <input
                  type="text"
                  name="colors"
                  value={formData.colors}
                  onChange={handleChange}
                  placeholder="Black, Beige, Brown"
                  className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none transition placeholder:text-[#B7A48D] focus:border-[#796858] focus:ring-2 focus:ring-[#B7A48D]/20"
                />

                <p className="mt-2 text-xs text-[#8B7A68]">
                  Separate each color with a comma.
                </p>
              </div>
            </div>

            {/* Save Error */}
            {saveError && (
              <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {saveError.message}
              </p>
            )}

            {/* Form Actions */}
            <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-[#E5D9C9] pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-[#D8C8B5] px-5 py-3 text-sm font-medium text-[#796858] transition hover:bg-[#F3EEE5]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#342820] px-6 py-3 text-sm font-medium text-[#FAF7F1] transition hover:bg-[#796858] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Product"
                    : "Add Product"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Product Overview */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E5D9C9] text-[#796858]">
            <Package size={22} />
          </div>

          <div>
            <p className="text-xs text-[#8B7A68]">
              Total Products
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#342820]">
              {products.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E5D9C9] text-[#796858]">
            <ImageIcon size={22} />
          </div>

          <div>
            <p className="text-xs text-[#8B7A68]">
              Categories
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-[#342820]">
              {categories.length}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <section className="mb-5 rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A49380]"
            />

            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[#D8C8B5] bg-white py-3 pl-11 pr-4 text-sm text-[#342820] outline-none transition placeholder:text-[#B7A48D] focus:border-[#796858] focus:ring-2 focus:ring-[#B7A48D]/20"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-[#D8C8B5] bg-white px-4 py-3 text-sm text-[#342820] outline-none focus:border-[#796858] sm:w-56"
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[#796858]">
            Showing{" "}
            <span className="font-semibold text-[#342820]">
              {filteredProducts.length === 0
                ? 0
                : startIndex + 1}
              {" - "}
              {Math.min(
                startIndex + productsPerPage,
                filteredProducts.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#342820]">
              {filteredProducts.length}
            </span>{" "}
            products
          </p>

          {(searchTerm || selectedCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="text-xs font-semibold text-[#796858] underline underline-offset-4 hover:text-[#342820]"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Delete Error */}
      {deleteError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {deleteError}
        </p>
      )}

      {/* Products Table */}
      <section className="overflow-hidden rounded-2xl border border-[#E5D9C9] bg-[#FAF7F1] shadow-sm">
        <div className="border-b border-[#E5D9C9] px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-[#342820]">
            Product Inventory
          </h2>
          <p className="mt-1 text-xs text-[#8B7A68]">
            View and manage your store products.
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5D9C9] text-[#796858]">
              <Package size={25} />
            </div>

            <h3 className="mt-4 font-display text-xl font-semibold text-[#342820]">
              No products found
            </h3>

            <p className="mt-1 text-sm text-[#8B7A68]">
              Try changing your search or category filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-[#F3EEE5] text-xs uppercase tracking-wider text-[#796858]">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Product
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Category
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Price
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Stock
                  </th>
                  <th className="px-5 py-4 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E5D9C9]">
                {currentProducts.map((product) => {
                  const imageUrl = getProductImage(product.image);

                  return (
                    <tr
                      key={product.id}
                      className="transition hover:bg-[#F3EEE5]/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-[#E5D9C9]">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[#A49380]">
                                <ImageIcon size={19} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-56 truncate font-semibold text-[#342820]">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-[#A49380]">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#E5D9C9] px-3 py-1.5 text-xs font-medium text-[#796858]">
                          {product.category}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-medium text-[#514236]">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium ${
                            Number(product.stock) === 0
                              ? "bg-red-100 text-red-700"
                              : Number(product.stock) <= 5
                                ? "bg-amber-100 text-amber-800"
                                : "bg-[#E5E9DF] text-[#536348]"
                          }`}
                        >
                          {product.stock}{" "}
                          {Number(product.stock) === 1
                            ? "unit"
                            : "units"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="flex items-center gap-1.5 rounded-lg border border-[#D8C8B5] px-3 py-2 text-xs font-medium text-[#796858] transition hover:bg-[#E5D9C9] hover:text-[#342820]"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            disabled={
                              deleteMutation.isPending &&
                              String(deleteMutation.variables) ===
                                String(product.id)
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-[#E8C9C4] px-3 py-2 text-xs font-medium text-[#A34F45] transition hover:bg-[#F8E9E6] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            {deleteMutation.isPending &&
                            String(deleteMutation.variables) ===
                              String(product.id)
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentPage((previous) => previous - 1)
            }
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg border border-[#D8C8B5] bg-[#FAF7F1] px-3 py-2.5 text-sm font-medium text-[#796858] transition hover:bg-[#E5D9C9] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              type="button"
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-10 min-w-10 rounded-lg px-3 text-sm font-medium transition ${
                currentPage === page
                  ? "bg-[#342820] text-[#FAF7F1]"
                  : "border border-[#D8C8B5] bg-[#FAF7F1] text-[#796858] hover:bg-[#E5D9C9]"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              setCurrentPage((previous) => previous + 1)
            }
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg border border-[#D8C8B5] bg-[#FAF7F1] px-3 py-2.5 text-sm font-medium text-[#796858] transition hover:bg-[#E5D9C9] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;