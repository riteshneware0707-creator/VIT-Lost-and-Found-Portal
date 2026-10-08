import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import { getItems } from "../utils/api";

function LostItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await getItems("?type=LOST");
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
          <h1>Lost Items</h1>
          <p>
            Find belongings reported lost across campus.
          </p>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <p>Loading lost items...</p>
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
          <h2>No lost items found</h2>
          <p>
            There are currently no active lost-item reports.
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

export default LostItems;