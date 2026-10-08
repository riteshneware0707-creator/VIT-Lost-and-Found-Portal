import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    reg_no: "",
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
      const data = await registerUser(formData);

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
            <h1>Create Account</h1>
            <p>
              Register using your VIT student credentials.
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
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg_no">
              Registration Number
            </label>

            <input
              id="reg_no"
              name="reg_no"
              type="text"
              placeholder="Example: 24BCE0000"
              value={formData.reg_no}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

          <p className="form-footer">
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Register;