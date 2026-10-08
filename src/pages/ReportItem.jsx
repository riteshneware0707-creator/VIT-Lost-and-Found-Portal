import { useState } from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  "ID Cards",
  "Room Keys",
  "Calculators",
  "Lab Equipment",
  "Earphones",
  "Wallets",
];

const locations = [
  "SJT",
  "TT",
  "PRP",
  "SMV",
  "MB",
  "GDN",
  "CDMM",
  "MH-A",
  "MH-B",
  "MH-C",
  "MH-D",
  "MH-E",
  "MH-F",
  "MH-G",
  "MH-H",
  "MH-I",
  "MH-J",
  "MH-K",
  "MH-L",
  "MH-M",
  "MH-N",
  "MH-O",
  "MH-P",
  "MH-Q",
  "MH-R",
  "MH-S",
  "MH-T",
  "LH-A",
  "LH-B",
  "LH-C",
  "LH-D",
  "LH-E",
  "LH-F",
  "LH-G",
  "LH-H",
  "LH-I",
  "LH-J",
  "Gazebo",
  "Food Mall",
  "DC",
  "Central Library",
  "Sports Complex",
];

function ReportItem() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "LOST",
    title: "",
    description: "",
    category: "ID Cards",
    location: "SJT",
    date: new Date().toISOString().split("T")[0],
  });

  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const existing = JSON.parse(
      localStorage.getItem("lostFoundItems") || "[]"
    );

    const newItem = {
      ...form,
      id: Date.now(),
      title: form.title.trim(),
      description: form.description.trim(),
      status: "ACTIVE",
    };

    const updatedItems = [newItem, ...existing];

    localStorage.setItem(
      "lostFoundItems",
      JSON.stringify(updatedItems)
    );

    setMessage("Item reported successfully!");

    setTimeout(() => {
      navigate(
        form.type === "LOST"
          ? "/lost"
          : "/found"
      );
    }, 700);
  }

  return (
    <main className="page narrow-page">
      <div className="form-header">
        <p className="eyebrow">VIT CAMPUS</p>
        <h1>Report an Item</h1>
        <p>
          Help another student recover their lost belongings.
        </p>
      </div>

      <form className="report-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Report Type</label>

          <div className="type-selector">
            <label className="radio-card">
              <input
                type="radio"
                name="type"
                value="LOST"
                checked={form.type === "LOST"}
                onChange={handleChange}
              />
              <span>🔍 Lost Item</span>
            </label>

            <label className="radio-card">
              <input
                type="radio"
                name="type"
                value="FOUND"
                checked={form.type === "FOUND"}
                onChange={handleChange}
              />
              <span>📦 Found Item</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="title">Item Title *</label>

          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Black Casio Calculator"
            value={form.title}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description *
          </label>

          <textarea
            id="description"
            name="description"
            rows="5"
            placeholder="Describe the item and any useful identifying details..."
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>

            <select
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>

          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>

        {message && (
          <div className="form-message">
            {message}
          </div>
        )}

        <button className="primary-button" type="submit">
          Submit Report
        </button>
      </form>
    </main>
  );
}

export default ReportItem;