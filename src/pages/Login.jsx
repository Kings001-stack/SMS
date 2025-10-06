import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [inputs, setInputs] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // {type:'success'|'error', text:string}
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const onSubmit = async (e) => {
    e?.preventDefault();
    setMessage(null);

    const email = inputs.email.trim();
    const password = inputs.password;

    // Basic validation
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in both email and password.' });
      return;
    }

    setLoading(true);
    try {
      // Point this to your PHP script that handles the POST method for login.
      // You can set VITE_API_LOGIN_URL in a .env file, e.g.:
      // VITE_API_LOGIN_URL=http://localhost/api/login
      const url = import.meta.env.VITE_API_LOGIN_URL || 'http://localhost/api/login';

      const payload = {
        email,
        password,
      };

      const { data } = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (data?.status === 'success') {
        setMessage({ type: 'success', text: data?.message || 'Login successful. Redirecting...' });
        
        // Save session data
        login(data);
        
        // Let DashboardRouter handle role-based routing
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setMessage({ type: 'error', text: data?.message || 'Invalid credentials.' });
      }
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err?.response?.data?.message || err.message || 'Network error. Please check if the server is running.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="mt-1 w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="you@example.com"
          name="email"
          autoComplete="email"
          value={inputs.email}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative mt-1">
          <input
            type={showPwd ? 'text' : 'password'}
            id="password"
            className="w-full border rounded-xl px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="••••••••"
            name="password"
            autoComplete="current-password"
            value={inputs.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-800"
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-3 rounded-xl ${
          loading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}