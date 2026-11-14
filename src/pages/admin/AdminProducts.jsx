
import { useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";

import {  getAdminProducts, addAdminProduct as addAdminProductService,
  updateAdminProduct as updateAdminProductService,
  deleteAdminProduct as deleteAdminProductService,} from "../../services/adminProductServices";

import { setAdminProducts, addAdminProduct as addAdminProductAction,
    updateAdminProduct as updateAdminProductAction,
  deleteAdminProduct as deleteAdminProductAction,} from "../../redux/slices/admin/adminProductSlice";

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
  } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: getAdminProducts,
  });

useEffect(() => {
    if (data) {
      dispatch(setAdminProducts(data));
    }
  }, [data, dispatch]);

useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, selectedCategory]);

  // Refresh product query
  function refreshProducts() {
    queryClient.invalidateQueries({
      queryKey: ["adminProducts"],
    });
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

  // Handle input changes
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Reset and close form
  function closeForm() {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
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

  // Submit form
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

  // Confirm delete
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

  if (isPending) {
    return (
      <p className="py-10 text-center text-stone-500">
        Loading products...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="py-10 text-center text-red-600">
        {error.message}
      </p>
    );
  }

  const categories = [
    ...new Set(
      products.map((product) => product.category).filter(Boolean)
    ),
  ];
 // Search and category filtering
const filteredProducts = products.filter((product) => {
  const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory =selectedCategory === "All" ||product.category === selectedCategory;
  return matchesSearch && matchesCategory;
});

// Pagination
const totalPages = Math.ceil( filteredProducts.length / productsPerPage);
const startIndex = (currentPage - 1) * productsPerPage;
const currentProducts = filteredProducts.slice( startIndex,startIndex + productsPerPage);


  return (
    <div>
      {/* Heading */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Manage your store products.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              closeForm();
            } else {
              setEditingId(null);
              setFormData(initialFormData);
              setShowForm(true);
            }
          }}
          className="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
        >
          {showForm ? "Close Form" : "+ Add Product"}
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-stone-900">
            {editingId !== null ? "Edit Product" : "Add New Product"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-stone-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  list="product-categories"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-stone-700"
                />

                <datalist id="product-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
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
                  className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-stone-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                  className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-stone-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Image Path
                </label>

                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  placeholder="src/assets/images/product.webp"
                  className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-stone-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  required
                  className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-stone-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Sizes
                </label>

                <input
                  type="text"
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleChange}
                  placeholder="S, M, L, XL"
                  className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-stone-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Colors
                </label>

                <input
                  type="text"
                  name="colors"
                  value={formData.colors}
                  onChange={handleChange}
                  placeholder="Black, Beige, Brown"
                  className="w-full rounded-lg border border-stone-300 px-4 py-3 outline-none focus:border-stone-700"
                />
              </div>
            </div>

            {saveError && (
              <p className="mt-4 text-sm text-red-600">
                {saveError.message}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-stone-300 px-5 py-3 text-sm text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Product"
                    : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
<div className="mb-5 flex flex-col gap-4 sm:flex-row">

  {/* Search */}
  <input
    type="text"
    placeholder="Search products..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700 sm:flex-1"
  />

  {/* Category Filter */}
  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700 sm:w-56"
  >
    <option value="All">All Categories</option>

    {categories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>

</div>

{/* Product Count */}
<p className="mb-4 text-sm text-stone-500">
  Showing {filteredProducts.length === 0 ? 0 : startIndex + 1}
  {" - "}
  {Math.min(startIndex + productsPerPage, filteredProducts.length)}
  {" of "}
  <span className="font-semibold text-stone-900">
    {filteredProducts.length}
  </span>
  {" products"}
</p>

      {deleteError && (
        <p className="mb-4 text-sm text-red-600">
          {deleteError}
        </p>
      )}

      {/* Products Table */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-stone-500">
            No products found.
          </div>
        ) : (
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 text-center font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {currentProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 font-medium text-stone-900">
                    {product.name}
                  </td>

                  <td className="px-6 py-4 text-stone-600">
                    {product.category}
                  </td>

                  <td className="px-6 py-4 text-stone-600">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </td>

                  <td className="px-6 py-4 text-stone-600">
                    {product.stock}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-sm font-medium text-blue-700 hover:text-blue-900"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(product)}
                        disabled={
                          deleteMutation.isPending &&
                          String(deleteMutation.variables) ===
                            String(product.id)
                        }
                        className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deleteMutation.isPending &&
                        String(deleteMutation.variables) ===
                          String(product.id)
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination */}
{totalPages > 1 && (
  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">

    {/* Previous */}
    <button
      onClick={() =>
        setCurrentPage((previous) => previous - 1)
      }
      disabled={currentPage === 1}
      className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Previous
    </button>

    {/* Page Numbers
    {Array.from(
      { length: totalPages },
      (_, index) => index + 1
    ).map((page) => (
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`rounded-lg px-4 py-2 text-sm ${
          currentPage === page
            ? "bg-stone-900 text-white"
            : "border border-stone-300 text-stone-700 hover:bg-stone-100"
        }`}
      >
        {page}
      </button>
    ))} */}

    {/* Next */}
    <button
      onClick={() =>
        setCurrentPage((previous) => previous + 1)
      }
      disabled={currentPage === totalPages}
      className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Next
    </button>

  </div>
)}
    </div>
  );
}

export default AdminProducts;
