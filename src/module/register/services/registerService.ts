import { api } from "@/lib/api";
import { AuthResponse } from "@/lib/types";
import axios from "axios";
import { useState } from "react";

  /**
   * Hook for registering a new user with the given credentials.
   *
   * The hook returns an object containing `loading` and `register` properties.
   *   - `loading` is a boolean indicating whether a registration request is in progress.
   *   - `register` is a function that takes the registration data and returns a promise resolving to an AuthResponse object containing the user's authentication token and user ID, or an error message and status code on failure.
   *
   * @returns An object containing `loading` and `register` properties.
   */
export default function useRegisterService() {
  const [loading, setLoading] = useState(false);
  /**
   * Registers a new user with the given credentials.
   *
   * If the request is successful, the response will contain the user's authentication token and user ID.
   * If the request fails, the response will contain an error message and a status code.
   *
   * @param data The registration data, containing the user's username, email, and password.
   * @returns A promise resolving to an AuthResponse object containing the user's authentication token and user ID, or an error message and status code on failure.
   */
  const register = async (data: {
    username: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return {
          status: error.response.status,
          message: error.response.data.message || "Registration failed",
          data: null!,
          error: error.response.data.error || [
            { field: "general", message: "Unknown error" },
          ],
        };
      }
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    register,
  };
}
