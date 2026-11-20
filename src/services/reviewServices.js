
const API_URL = import.meta.env.VITE_API_URL;

// Get all reviews for a particular product
export async function getProductReviews(productId) {
  const response = await fetch(
    `${API_URL}/reviews?productId=${encodeURIComponent(productId)}`
  );

  if (!response.ok) {
    throw new Error("Unable to fetch product reviews.");
  }

  return response.json();
}

// Get all reviews submitted by a particular customer
export async function getUserReviews(userId) {
  const response = await fetch(
    `${API_URL}/reviews?userId=${encodeURIComponent(userId)}`
  );

  if (!response.ok) {
    throw new Error("Unable to fetch your reviews.");
  }

  return response.json();
}

// Submit a new review
export async function createReview(review) {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(review),
  });

  if (!response.ok) {
    throw new Error("Unable to submit your review.");
  }

  return response.json();
}
export async function getAllProductReviews() {
  const response = await fetch(`${API_URL}/reviews`);

  if (!response.ok) {
    throw new Error("Unable to fetch product reviews.");
  }

  return response.json();
}