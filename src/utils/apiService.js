import axios from "axios";
import { getToken, readSession } from "./session";

const API_BASE_URL = "http://localhost/api";

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for auth token
    this.api.interceptors.request.use((config) => {
      const sessionToken = getToken();
      const token = sessionToken || localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.api.post("/login", credentials);
    return response.data;
  }

  async register(userData) {
    const response = await this.api.post("/register", userData);
    return response.data;
  }

  // Resources methods
  async getResources(params = {}) {
    const response = await this.api.get("/resources", { params });
    return response.data;
  }

  async uploadResource(formData) {
    const response = await this.api.post("/resources", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async getResource(id) {
    const response = await this.api.get(`/resources/${id}`);
    return response.data;
  }

  async deleteResource(id) {
    const response = await this.api.delete(`/resources/${id}`);
    return response.data;
  }

  // Assignments methods (to be implemented)
  async getAssignments(params = {}) {
    // This will need a backend endpoint
    const response = await this.api.get("/assignments", { params });
    return response.data;
  }

  async createAssignment(assignmentData) {
    const response = await this.api.post("/assignments", assignmentData);
    return response.data;
  }

  async updateAssignment(id, assignmentData) {
    const response = await this.api.put("/assignments", {
      id,
      ...assignmentData,
    });
    return response.data;
  }

  async deleteAssignment(id) {
    const response = await this.api.delete(`/assignments/${id}`);
    return response.data;
  }

  // Gradebook methods (to be implemented)
  async getGrades(params = {}) {
    const response = await this.api.get("/grades", { params });
    return response.data;
  }

  async updateGrade(gradeData) {
    const response = await this.api.post("/grades", gradeData);
    return response.data;
  }

  // Students methods (to be implemented)
  async getStudents(params = {}) {
    const response = await this.api.get("/students", { params });
    return response.data;
  }

  // Classes methods (to be implemented)
  async getClasses() {
    const response = await this.api.get("/classes");
    return response.data;
  }

  // Generic GET method
  async get(endpoint, params = {}) {
    const response = await this.api.get(endpoint, { params });
    return response.data;
  }

  // Generic POST method
  async post(endpoint, data) {
    const response = await this.api.post(endpoint, data);
    return response.data;
  }

  // Generic PUT method
  async put(endpoint, data) {
    const response = await this.api.put(endpoint, data);
    return response.data;
  }

  // Generic DELETE method
  async delete(endpoint) {
    const response = await this.api.delete(endpoint);
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
