const API_URL = import.meta.env.VITE_API_URL;

export async function getUsers() {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
}

export async function registerUser(user) {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("Failed to register user");
  }

  return response.json();
}

export async function loginUser(email, password) {
  const users = await getUsers();

  const user = users.find(
    (item) =>
      item.email.toLowerCase() === email.trim().toLowerCase() &&
      item.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.blocked === true) {
    throw new Error(
      "Your account has been blocked. Please contact support."
    );
  }

  // Remove password before returning user data
  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

// Update existing user details
export async function updateUser(userId, updatedData) {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
}

// Get a single user by ID
export async function getUserById(userId) {
  const response = await fetch(
    `${API_URL}/users/${encodeURIComponent(userId)}`
  );

  // User no longer exists
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to verify account status.");
  }

  const user = await response.json();

  // Return only the information needed for verification.
  // Do not put the password in the query cache.
  return {
    id: user.id,
    blocked: user.blocked === true,
  };
}
