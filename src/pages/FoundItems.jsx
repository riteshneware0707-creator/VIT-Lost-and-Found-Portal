import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import { getItems } from "../utils/api";

function FoundItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await getItems("?type=FOUND");
        setItems(data.items);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">VIT CAMPUS</p>
          <h1>Found Items</h1>
          <p>
            Browse belongings found across campus.
          </p>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <p>Loading found items...</p>
        </div>
      )}

      {error && (
        <div className="empty-state">
          <h2>Unable to load items</h2>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <h2>No found items</h2>
          <p>
            There are currently no active found-item reports.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <section className="items-grid">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
            />
          ))}
        </section>
      )}
    </main>
  );
}

export default FoundItems;