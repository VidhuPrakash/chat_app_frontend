"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import useRegisterService from "../../services/registerService";

export default function RegisterPage() {
  const [username, setUsername] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { register, loading } = useRegisterService();

  /**
   * Handles the form submission for registering a user.
   *
   * - Prevents the default form submission behavior.
   * - Clears any previous errors.
   * - Checks if the passwords match and sets a validation error if not.
   * - Attempts to register a user using the provided username, email, and password.
   *   - If there is an error, sets the validation errors for the respective fields.
   *   - If registration is successful, sets the authentication state and navigates to the chat page.
   * - Catches any unexpected errors and sets a general registration failure error.
   *
   * @param e - The form event triggered by the submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }
      const { data, error } = await register({ username, email, password });

      if (error) {
        // Set validation errors
        error.forEach(
          (e) => e.field === "username" && setUsernameError(e.message)
        );
        error.forEach((e) => e.field === "email" && setEmailError(e.message));
        error.forEach(
          (e) => e.field === "password" && setPasswordError(e.message)
        );
      } else {
        // Handle successful registration
        const { token, user } = data;
        setAuth(token, user?._id!, user?.username!);
        router.push("/");
      }
    } catch (err) {
      // Handle unexpected errors
      console.log(err, "Failed to register user");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Register
        </h1>
        {usernameError && (
          <p className="text-red-500 text-sm mb-2">{usernameError}</p>
        )}
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setUsernameError("");
          }}
          placeholder="Username"
          className="w-full p-3 text-black mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          required
        />
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
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setPasswordError("");
          }}
          placeholder="Confirm Password"
          className="w-full text-black p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-[#20b858] transition duration-300"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-green-950 font-bold hover:underline"
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
