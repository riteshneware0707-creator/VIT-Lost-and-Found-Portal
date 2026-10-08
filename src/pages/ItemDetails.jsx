import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import defaultItems from "../data/items";

function ItemDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [claimSent, setClaimSent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lostFoundItems");

    const items = stored
      ? JSON.parse(stored)
      : defaultItems;

    const found = items.find(
      (currentItem) =>
        String(currentItem.id) === String(id)
    );

    setItem(found);
  }, [id]);

  function handleClaim() {
    setClaimSent(true);
  }

  if (!item) {
    return (
      <main className="page">
        <div className="empty-state">
          <h2>Item not found</h2>
          <Link to="/">Return Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page narrow-page">
      <Link className="back-link" to="/">
        ← Back to items
      </Link>

      <article className="details-card">
        <div className="item-card-top">
          <span className={`badge ${item.type.toLowerCase()}`}>
            {item.type}
          </span>

          <span className="category-badge">
            {item.category}
          </span>
        </div>

        <h1>{item.title}</h1>

        <p className="details-description">
          {item.description}
        </p>

        <div className="details-info">
          <div>
            <strong>Location</strong>
            <span>📍 {item.location}</span>
          </div>

          <div>
            <strong>Date</strong>
            <span>📅 {item.date}</span>
          </div>

          <div>
            <strong>Status</strong>
            <span>{item.status}</span>
          </div>
        </div>

        {item.type === "FOUND" && !claimSent && (
          <button
            className="primary-button"
            onClick={handleClaim}
          >
            This is My Item
          </button>
        )}

        {claimSent && (
          <div className="success-box">
            <h3>Claim request submitted</h3>
            <p>
              Your claim has been recorded. The finder can
              verify the ownership details before arranging
              a handoff.
            </p>
          </div>
        )}

        {item.type === "LOST" && (
          <div className="info-box">
            If you found this item, please contact the
            student through the appropriate campus
            recovery process.
          </div>
        )}
      </article>
    </main>
  );
}

export default ItemDetails;