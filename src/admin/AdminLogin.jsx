import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; // You can use any icon library
import { toast } from "react-toastify";


const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const submitHandler = async (e) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const res = await axios.post(`${BACKEND_URL}/api/admin/login`, {
      email,
      password,
    });

    login(res.data.token); // 🔑 SAVE TOKEN

    toast.success("✅ Admin login successful!");
    navigate("/admin/menu");
  } catch (err) {
    const msg = err.response?.data?.message || "Invalid email or password";

    setError(msg); // keep red box also if you want
    toast.error(`❌ ${msg}`);
  } finally {
    setIsLoading(false);
  }
};


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access the admin panel
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
  <label htmlFor="password" className="sr-only">
    Password
  </label>

  <input
    id="password"
    name="password"
    type={showPassword ? "text" : "password"}
    autoComplete="current-password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 
               placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none 
               focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm
               pr-14"   // ✅ more space for icon
    placeholder="Password"
  />

  <button
    type="button"
    onClick={togglePasswordVisibility}
    className="absolute right-2 top-1/2 -translate-y-1/2
               p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
               active:scale-95 transition z-20"   // ✅ clickable always
  >
    {showPassword ? (
      <EyeOff className="h-5 w-5" />
    ) : (
      <Eye className="h-5 w-5" />
    )}
  </button>
</div>

              
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;