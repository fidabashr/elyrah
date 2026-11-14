const API_URL = import.meta.env.VITE_API_URL;

// Get all users
export async function getAdminUsers() {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("Unable to fetch users.");
  }

  return response.json();
}

// Block or unblock a user
export async function updateUserStatus(id, blocked) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ blocked }),
  });

  if (!response.ok) {
    throw new Error("Unable to update user status.");
  }

  return response.json();
}