import axios from "axios";
//import {authenticationInterceptor} from "@/app/iam/services/auth.interceptor.js";

const API_BASE_URL = "http://localhost:8080/api/v1"; //Should be moved to environment variables

const http = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
});

//Add authentication interceptor
//http.interceptors.request.use(authenticationInterceptor);

// Export the http object
export default http;