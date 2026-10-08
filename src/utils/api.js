const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
}

export async function registerUser(userData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getCurrentUser() {
  return apiRequest("/auth/me");
}

export async function getItems(params = "") {
  return apiRequest(`/items${params}`);
}

export async function getItem(id) {
  return apiRequest(`/items/${id}`);
}

export async function createItem(itemData) {
  return apiRequest("/items", {
    method: "POST",
    body: JSON.stringify(itemData),
  });
}

export async function createClaim(itemId, message) {
  return apiRequest(`/items/${itemId}/claims`, {
    method: "POST",
    body: JSON.stringify({
      message,
    }),
  });
}