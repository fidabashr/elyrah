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
export async function loginUser(email,password) {
  const users=await getUsers()
  const user=users.find((item)=>item.email.toLowerCase()===email.toLowerCase() && item.password === password)
  if(!user){
    throw new Error("Invalid email or password")
  }return user
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