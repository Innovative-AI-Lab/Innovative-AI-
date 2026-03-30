import axios from "axios";

// Standard API instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4001",
  timeout: 10000,
});

// Interceptor function to add auth token and handle 401 errors
const addAuthInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("ai_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Do not logout if the failed request was the login attempt itself
        if (!error.config.url.includes("/users/login")) {
          localStorage.removeItem("ai_token");
          localStorage.removeItem("ai_user");
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    },
  );
};

// Apply interceptors to the main instance
addAuthInterceptors(instance);

// Separate instance for AI requests which may have a longer timeout
export const aiApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4001",
  timeout: 60000, // Longer timeout for potentially long-running AI tasks
});

// Apply the same interceptors to the AI instance
addAuthInterceptors(aiApi);

export default instance;
