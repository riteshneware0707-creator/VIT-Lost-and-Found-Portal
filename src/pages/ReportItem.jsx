import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../utils/api";
import { useAuth } from "../context/AuthContext";

function ReportItem() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    type: "LOST",
    title: "",
    description: "",
    category: "ID Cards",
    location: "SJT",
    date: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <main className="page">
        <div className="empty-state">
          <h2>Login required</h2>

          <p>
            You must be logged in with your VIT
            student account to report an item.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </main>
    );
  }

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
    setSuccess("");
    setLoading(true);

    try {
      await createItem(formData);

      setSuccess(
        "Item reported successfully."
      );

      setFormData({
        type: "LOST",
        title: "",
        description: "",
        category: "ID Cards",
        location: "SJT",
        date: "",
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">VIT CAMPUS</p>

          <h1>Report an Item</h1>

          <p>
            Report something you lost or found
            on campus.
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

        {success && (
          <div className="form-success">
            {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="type">
            Report Type
          </label>

          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="LOST">
              I lost something
            </option>

            <option value="FOUND">
              I found something
            </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">
            Item Name
          </label>

          <input
            id="title"
            name="title"
            type="text"
            placeholder="Example: Black Casio Calculator"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            placeholder="Describe the item..."
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">
            Category
          </label>

          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="ID Cards">
              ID Cards
            </option>

            <option value="Room Keys">
              Room Keys
            </option>

            <option value="Calculators">
              Calculators
            </option>

            <option value="Lab Equipment">
              Lab Equipment
            </option>

            <option value="Earphones">
              Earphones
            </option>

            <option value="Wallets">
              Wallets
            </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">
            Location
          </label>

          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          >
            <option value="SJT">SJT</option>
            <option value="TT">TT</option>
            <option value="PRP">PRP</option>
            <option value="SMV">SMV</option>
            <option value="MB">MB</option>
            <option value="GDN">GDN</option>
            <option value="CDMM">CDMM</option>

            <option value="MH-A">MH-A</option>
            <option value="MH-B">MH-B</option>
            <option value="MH-C">MH-C</option>
            <option value="MH-D">MH-D</option>
            <option value="MH-E">MH-E</option>
            <option value="MH-F">MH-F</option>
            <option value="MH-G">MH-G</option>
            <option value="MH-H">MH-H</option>
            <option value="MH-I">MH-I</option>
            <option value="MH-J">MH-J</option>
            <option value="MH-K">MH-K</option>
            <option value="MH-L">MH-L</option>
            <option value="MH-M">MH-M</option>
            <option value="MH-N">MH-N</option>
            <option value="MH-O">MH-O</option>
            <option value="MH-P">MH-P</option>
            <option value="MH-Q">MH-Q</option>
            <option value="MH-R">MH-R</option>
            <option value="MH-S">MH-S</option>
            <option value="MH-T">MH-T</option>

            <option value="LH-A">LH-A</option>
            <option value="LH-B">LH-B</option>
            <option value="LH-C">LH-C</option>
            <option value="LH-D">LH-D</option>
            <option value="LH-E">LH-E</option>
            <option value="LH-F">LH-F</option>
            <option value="LH-G">LH-G</option>
            <option value="LH-H">LH-H</option>
            <option value="LH-I">LH-I</option>
            <option value="LH-J">LH-J</option>

            <option value="Gazebo">
              Gazebo
            </option>

            <option value="Food Mall">
              Food Mall
            </option>

            <option value="DC">
              DC
            </option>

            <option value="Central Library">
              Central Library
            </option>

            <option value="Sports Complex">
              Sports Complex
            </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">
            Date
          </label>

          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={loading}
        >
          {loading
            ? "Submitting..."
            : "Report Item"}
        </button>
      </form>
    </main>
  );
}

export default ReportItem;