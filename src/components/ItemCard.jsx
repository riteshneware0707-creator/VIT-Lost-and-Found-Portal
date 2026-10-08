import { Link } from "react-router-dom";

function ItemCard({ item }) {
  return (
    <article className="item-card">
      <div className="item-card-top">
        <span className={`badge ${item.type.toLowerCase()}`}>
          {item.type}
        </span>

        <span className="category-badge">
          {item.category}
        </span>
      </div>

      <h3>{item.title}</h3>

      <p className="item-description">
        {item.description}
      </p>

      <div className="item-meta">
        <span>📍 {item.location}</span>
        <span>📅 {item.date}</span>
      </div>

      <Link
        className="details-button"
        to={`/items/${item.id}`}
      >
        View Details
      </Link>
    </article>
  );
}

export default ItemCard;