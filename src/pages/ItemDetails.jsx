import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createClaim,
  getItem,
} from "../utils/api";

import { useAuth } from "../context/AuthContext";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [claimMessage, setClaimMessage] =
    useState("");

  const [claimSent, setClaimSent] =
    useState(false);

  const [error, setError] = useState("");
  const [claimError, setClaimError] =
    useState("");

  const [claimLoading, setClaimLoading] =
    useState(false);

  useEffect(() => {
    async function loadItem() {
      try {
        const data = await getItem(id);

        setItem(data.item);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  async function handleClaim() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setClaimError("");
    setClaimLoading(true);

    try {
      await createClaim(
        id,
        claimMessage
      );

      setClaimSent(true);
    } catch (error) {
      setClaimError(error.message);
    } finally {
      setClaimLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="empty-state">
          <p>Loading item...</p>
        </div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="page">
        <div className="empty-state">
          <h2>Item not found</h2>

          <p>
            {error ||
              "This item does not exist."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="details-container">
        <div className="details-header">
          <span
            className={`item-badge ${
              item.type === "LOST"
                ? "lost"
                : "found"
            }`}
          >
            {item.type}
          </span>

          <h1>{item.title}</h1>

          <p>
            {item.description}
          </p>
        </div>

        <div className="details-grid">
          <div className="detail-card">
            <span>Category</span>
            <strong>
              {item.category}
            </strong>
          </div>

          <div className="detail-card">
            <span>Location</span>
            <strong>
              {item.location}
            </strong>
          </div>

          <div className="detail-card">
            <span>Date</span>
            <strong>
              {item.date}
            </strong>
          </div>

          <div className="detail-card">
            <span>Reported By</span>
            <strong>
              {item.reporter_name}
            </strong>
          </div>
        </div>

        {item.type === "FOUND" && (
          <div className="claim-section">
            <h2>
              Is this your item?
            </h2>

            <p>
              Submit a claim with some
              information that can help the
              finder verify ownership.
            </p>

            {claimSent ? (
              <div className="form-success">
                Claim submitted successfully.
                The finder can review your
                claim.
              </div>
            ) : (
              <>
                {claimError && (
                  <div className="form-error">
                    {claimError}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="claimMessage">
                    Claim Message
                  </label>

                  <textarea
                    id="claimMessage"
                    rows="5"
                    placeholder="Describe something about the item that only the owner would know..."
                    value={claimMessage}
                    onChange={(event) =>
                      setClaimMessage(
                        event.target.value
                      )
                    }
                  />
                </div>

                <button
                  className="primary-button"
                  onClick={handleClaim}
                  disabled={claimLoading}
                >
                  {claimLoading
                    ? "Submitting..."
                    : isAuthenticated
                    ? "Submit Claim"
                    : "Login to Claim"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default ItemDetails;