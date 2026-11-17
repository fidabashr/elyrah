const API_URL = import.meta.env.VITE_API_URL;

export async function getAdminDashboardData() {
  const [productsResponse, usersResponse, ordersResponse] =
    await Promise.all([
      fetch(`${API_URL}/products`),
      fetch(`${API_URL}/users`),
      fetch(`${API_URL}/orders`),
    ]);

  if (
    !productsResponse.ok ||
    !usersResponse.ok ||
    !ordersResponse.ok
  ) {
    throw new Error("Unable to fetch dashboard data.");
  }

  const [products, users, orders] = await Promise.all([
    productsResponse.json(),
    usersResponse.json(),
    ordersResponse.json(),
  ]);

  return {
    products,
    users,
    orders,
  };
}