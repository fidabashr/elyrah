
const API_URL = import.meta.env.VITE_API_URL;


export async function loginAdmin(email, password) {

  const response = await fetch(
    `${API_URL}/admins?email=${encodeURIComponent(email.trim())}`
  );

 
  if (!response.ok) {
    throw new Error("Unable to connect to the server.");
  }


  const admins = await response.json();

  const matchedAdmin = admins.find(
    (admin) => admin.password === password
  );


  if (!matchedAdmin) {
    throw new Error("Invalid email or password.");
  }
  return {
    id: matchedAdmin.id,
    name: matchedAdmin.name,
    email: matchedAdmin.email,
  };
}
