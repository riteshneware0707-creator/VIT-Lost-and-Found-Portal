import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData);

      login(data.token, data.user);

      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="form-container">
        <div className="page-header">
          <div>
            <p className="eyebrow">VIT CAMPUS</p>
            <h1>Login</h1>
            <p>
              Login with your VIT student account.
            </p>
          </div>
        </div>

        <form
          className="report-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              VIT Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="yourname@vitstudent.ac.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="form-footer">
            Don't have an account?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Login;