
const API_URL = import.meta.env.VITE_API_URL;

// Fetch all products
export async function getAdminProducts() {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Unable to fetch products.");
  }

  return response.json();
}
export async function addAdminProduct(product) {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error("Unable to add product.");
  }

  return response.json();
}
export async function updateAdminProduct(id, product) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    throw new Error("Unable to update product.");
  }

  return response.json();
}

export async function deleteAdminProduct(id) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Unable to delete product.");
  }

  return id;
}