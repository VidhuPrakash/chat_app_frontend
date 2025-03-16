import { api } from "@/lib/api";
import { AuthResponse } from "@/lib/types";
import axios from "axios";
import { useState } from "react";

/**
 * Hook for authenticating a user with the provided credentials.
 *
 * @returns An object containing `loading` and `login` properties.
 *   - `loading` is a boolean indicating whether a login request is in progress.
 *   - `login` is a function that takes the login credentials and returns a promise resolving to an `AuthResponse` object.
 */
export default function useLoginService() {
  const [loading, setLoading] = useState(false);
  /**
   * Authenticates a user with the provided credentials.
   *
   * If the request is successful, the response will contain the user's authentication token and user details.
   * If the request fails, the response will contain an error message and a status code.
   *
   * @param credentials - The login credentials, containing the user's email and password.
   * @returns A promise resolving to an AuthResponse object containing the user's authentication token and user details, or an error message and status code on failure.
   */
  const login = async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Return the error response from the backend
        return {
          status: error.response.status,
          message: error.response.data.message || "Login failed",
          data: null!,
          error: error.response.data.error || [
            { field: "general", message: "Unknown error" },
          ],
        };
      }
      // Fallback for non-Axios errors (e.g., network issues)
      console.error("Login error:", error);
      return {
        status: 500,
        message: "Internal error",
        data: null!,
        error: [{ field: "general", message: "Network error" }],
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs out the current user by clearing authentication state and sending a logout request to the server.
   *
   * If the request is successful, the response will contain the user's authentication token and user details.
   * If the request fails, the response will contain an error message and a status code.
   *
   * @returns A promise resolving to an AuthResponse object containing the user's authentication token and user details, or an error message and status code on failure.
   */
  const logout = async (): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Return the error response from the backend
        return {
          status: error.response.status,
          message: error.response.data.message || "Logout failed",
          data: null!,
          error: error.response.data.error || [
            { field: "general", message: "Unknown error" },
          ],
        };
      }
      // Fallback for non-Axios errors (e.g., network issues)
      console.error("logout error:", error);
      return {
        status: 500,
        message: "Internal error",
        data: null!,
        error: [{ field: "general", message: "Network error" }],
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    login,
    logout,
  };
}
