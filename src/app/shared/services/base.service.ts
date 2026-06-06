import axios from "axios";
import { authenticationInterceptor } from "@/app/auth/services/authentication.interceptor";

// Default to http://localhost:5155 for local .NET development
// Update this to match your backend URL in environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5155/api/v1";

const http = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Add authentication interceptor to automatically include token in requests
http.interceptors.request.use(authenticationInterceptor);

// Export the http object
export default http;