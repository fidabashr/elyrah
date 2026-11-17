const API_URL = import.meta.env.VITE_API_URL;

// Get all orders
export async function getAdminOrders() {
  const response = await fetch(`${API_URL}/orders`);

  if (!response.ok) {
    throw new Error("Unable to fetch orders.");
  }

  return response.json();
}

// Update order status
export async function updateAdminOrderStatus(id, updates) {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Unable to update order status.");
  }

  return response.json();
}
