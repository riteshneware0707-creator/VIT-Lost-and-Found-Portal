import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import defaultItems from "../data/items";

function FoundItems() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("lostFoundItems");

    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      setItems(defaultItems);
    }
  }, []);

  const foundItems = items.filter(
    (item) => item.type === "FOUND" && item.status === "ACTIVE"
  );

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">VIT CAMPUS</p>
          <h1>Found Items</h1>
          <p>Browse belongings found across VIT campus.</p>
        </div>
      </div>

      {foundItems.length === 0 ? (
        <div className="empty-state">
          <h2>No found items</h2>
          <p>There are currently no active found-item reports.</p>
        </div>
      ) : (
        <section className="items-grid">
          {foundItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </section>
      )}
    </main>
  );
}

export default FoundItems;