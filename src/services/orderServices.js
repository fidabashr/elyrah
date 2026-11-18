
const API_URL = import.meta.env.VITE_API_URL;

// Create a new order
export async function createOrder(order) {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error("Failed to place order");
  }

  return response.json();
}

// Get orders for a particular user
export async function getOrders(userId) {
  const response = await fetch(
    `${API_URL}/orders?userId=${encodeURIComponent(String(userId))}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}


// Update order details
export async function updateOrderStatus(orderId, updates) {
  const response = await fetch(
    `${API_URL}/orders/${orderId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update order status");
  }

  return response.json();
}
