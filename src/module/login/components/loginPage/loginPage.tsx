"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import useLoginService from "../../services/loginService";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { login, loading } = useLoginService();

  /**
   * Handles the form submission for logging in a user.
   *
   * - Prevents the default form submission behavior.
   * - Clears any previous errors.
   * - Attempts to log in using the provided email and password.
   *   - If there is an error, sets the validation errors for email and password fields.
   *   - If login is successful, sets the authentication state and navigates to the chat page.
   * - Catches any unexpected errors and sets a general login failure error.
   *
   * @param e - The form event triggered by the submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await login({ email, password });

      if (error) {
        // Set validation errors
        error.forEach((e) => e.field === "email" && setEmailError(e.message));
        error.forEach(
          (e) => e.field === "password" && setPasswordError(e.message)
        );
      } else if (data) {
        // Handle successful login
        const { token, user } = data;
        setAuth(token, user?._id!, user?.username!);
        router.push("/");
      }
    } catch (err) {
      // Handle unexpected errors
      console.info(err, "Error logging in");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Login
        </h1>
        {emailError && (
          <p className="text-red-500 text-sm mb-2">{emailError}</p>
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          placeholder="Email"
          className="w-full text-black p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          required
        />
        {passwordError && (
          <p className="text-red-500 text-sm mb-2">{passwordError}</p>
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError("");
          }}
          placeholder="Password"
          className="w-full text-black p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-[#20b858] transition duration-300"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <a
            href="/auth/register"
            className="text-green-950 font-bold hover:underline"
          >
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
