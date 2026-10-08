import { useEffect, useState } from "react";
import { getItems } from "../utils/api";
import { Link } from "react-router-dom";

function FoundItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFoundItems();
  }, []);

  async function loadFoundItems() {
    setLoading(true);
    setError("");

    try {
      const data = await getItems(
        "?type=FOUND"
      );

      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="form-container">

        <div className="page-header">
          <div>
            <p className="eyebrow">
              VIT CAMPUS
            </p>

            <h1>
              Found Items
            </h1>

            <p>
              Browse items found around the
              VIT campus.
            </p>
          </div>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <p>
              Loading found items...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <h3>
              No found items
            </h3>

            <p>
              No active found items have
              been reported yet.
            </p>
          </div>
        ) : (
          <div className="items-grid">

            {items.map((item) => (
              <article
                className="item-card"
                key={item.id}
              >

                <div className="item-card-header">

                  <span className="item-type-badge">
                    FOUND
                  </span>

                  <span className="status-badge">
                    {item.status}
                  </span>

                </div>

                <h2>
                  {item.title}
                </h2>

                <p className="item-description">
                  {item.description}
                </p>

                <div className="item-meta">

                  <div>
                    <strong>
                      Category
                    </strong>

                    <span>
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <strong>
                      Location
                    </strong>

                    <span>
                      {item.location}
                    </span>
                  </div>

                  <div>
                    <strong>
                      Date
                    </strong>

                    <span>
                      {item.date}
                    </span>
                  </div>

                </div>

                <Link
                  to={`/found/${item.id}`}
                  className="primary-button"
                >
                  View Item
                </Link>

              </article>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

export default FoundItems;