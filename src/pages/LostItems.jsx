import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import defaultItems from "../data/items";

function LostItems() {
  const [items, setItems] = useState(defaultItems);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lostFoundItems");

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Error loading lost items:", error);
      setItems(defaultItems);
    }
  }, []);

  const lostItems = items.filter(
    (item) =>
      item.type === "LOST" &&
      item.status === "ACTIVE"
  );

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

      {lostItems.length === 0 ? (
        <div className="empty-state">
          <h2>No lost items found</h2>
          <p>
            There are currently no active lost-item reports.
          </p>
        </div>
      ) : (
        <section className="items-grid">
          {lostItems.map((item) => (
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