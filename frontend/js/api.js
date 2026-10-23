const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("campusCareToken");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function saveSession(data) {
  localStorage.setItem("campusCareToken", data.token);
  localStorage.setItem("campusCareUser", JSON.stringify(data.user));
}

function clearSession() {
  localStorage.removeItem("campusCareToken");
  localStorage.removeItem("campusCareUser");
}

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("campusCareUser") || "null");
  } catch {
    return null;
  }
}