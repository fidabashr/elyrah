const API_URL = import.meta.env.VITE_API_URL;

// Get all orders
export async function getAdminOrders() {
  const response = await fetch(`${API_URL}/orders`);

  if (!response.ok) {
    throw new Error("Unable to fetch orders.");
  }

  return response.json();
}