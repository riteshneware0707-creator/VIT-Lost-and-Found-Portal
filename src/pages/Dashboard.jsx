import { useEffect, useState } from "react";
import {
  createVerificationQuestions,
  getMyFoundItemClaims,
  getItems,
  reviewClaim,
} from "../utils/api";

function Dashboard() {
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [questions, setQuestions] = useState([""]);

  const [loading, setLoading] = useState(true);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [itemsData, claimsData] = await Promise.all([
        getItems("?type=FOUND&mine=true"),
        getMyFoundItemClaims(),
      ]);

      setFoundItems(itemsData.items || []);
      setClaims(claimsData.claims || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function handleQuestionChange(index, value) {
    setQuestions((previous) =>
      previous.map((question, i) =>
        i === index ? value : question
      )
    );
  }

  function addQuestion() {
    if (questions.length >= 3) return;

    setQuestions((previous) => [
      ...previous,
      "",
    ]);
  }

  function removeQuestion(index) {
    if (questions.length <= 1) return;

    setQuestions((previous) =>
      previous.filter((_, i) => i !== index)
    );
  }

  async function handleSaveQuestions() {
    if (!selectedItem) return;

    const cleanedQuestions = questions
      .map((question) => question.trim())
      .filter(Boolean);

    if (
      cleanedQuestions.length < 1 ||
      cleanedQuestions.length > 3
    ) {
      setError(
        "Add between 1 and 3 verification questions."
      );
      return;
    }

    setSavingQuestions(true);
    setError("");
    setSuccess("");

    try {
      await createVerificationQuestions(
        selectedItem.id,
        cleanedQuestions
      );

      setSuccess(
        "Verification questions saved successfully."
      );

      setSelectedItem(null);
      setQuestions([""]);

      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingQuestions(false);
    }
  }

  async function handleReviewClaim(claimId, status) {
    setError("");
    setSuccess("");

    try {
      await reviewClaim(
        claimId,
        status
      );

      setSuccess(
        status === "APPROVED"
          ? "Claim approved successfully."
          : "Claim rejected."
      );

      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  }

  function getClaimsForItem(itemId) {
    return claims.filter(
      (claim) => claim.item_id === itemId
    );
  }

  if (loading) {
    return (
      <main className="page">
        <div className="form-container">
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
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
              My Dashboard
            </h1>

            <p>
              Manage your found items and review
              ownership claims.
            </p>
          </div>
        </div>

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

        {/* =====================================================
            FOUND ITEMS
        ====================================================== */}

        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <h2>
                My Found Items
              </h2>

              <p>
                Add private verification questions
                that only the genuine owner should
                be able to answer.
              </p>
            </div>
          </div>

          {foundItems.length === 0 ? (
            <div className="empty-state">
              <h3>
                No found items yet
              </h3>

              <p>
                Items that you report as found will
                appear here.
              </p>
            </div>
          ) : (
            <div className="dashboard-list">

              {foundItems.map((item) => {
                const itemClaims =
                  getClaimsForItem(item.id);

                return (
                  <div
                    className="dashboard-card"
                    key={item.id}
                  >

                    <div className="dashboard-card-header">

                      <div>
                        <span className="item-type-badge">
                          FOUND
                        </span>

                        <h3>
                          {item.title}
                        </h3>

                        <p>
                          {item.category} ·{" "}
                          {item.location}
                        </p>
                      </div>

                      <span className="status-badge">
                        {item.status}
                      </span>

                    </div>

                    <p className="item-description">
                      {item.description}
                    </p>

                    <div className="dashboard-actions">

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setSelectedItem(item);
                          setQuestions([""]);
                          setError("");
                          setSuccess("");
                        }}
                      >
                        Add Verification Questions
                      </button>

                    </div>

                    {/* Claims belonging to this item */}

                    {itemClaims.length > 0 && (
                      <div className="claims-section">

                        <h4>
                          Ownership Claims
                        </h4>

                        {itemClaims.map((claim) => (
                          <div
                            className="claim-card"
                            key={claim.id}
                          >

                            <div className="claim-header">
                              <div>
                                <strong>
                                  {claim.claimant_name}
                                </strong>

                                <p>
                                  {claim.claimant_reg_no}
                                </p>
                              </div>

                              <span
                                className={`claim-status ${claim.status.toLowerCase()}`}
                              >
                                {claim.status}
                              </span>
                            </div>

                            {claim.message && (
                              <div className="claim-message">
                                <strong>
                                  Claimant's message
                                </strong>

                                <p>
                                  {claim.message}
                                </p>
                              </div>
                            )}

                            {claim.answers &&
                              claim.answers.length > 0 && (
                                <div className="claim-answers">

                                  <strong>
                                    Verification Answers
                                  </strong>

                                  {claim.answers.map(
                                    (answer) => (
                                      <div
                                        className="answer-row"
                                        key={
                                          answer.question_id
                                        }
                                      >
                                        <p className="question">
                                          {answer.question}
                                        </p>

                                        <p className="answer">
                                          {answer.answer}
                                        </p>
                                      </div>
                                    )
                                  )}

                                </div>
                              )}

                            {claim.status ===
                              "PENDING" && (
                              <div className="claim-actions">

                                <button
                                  type="button"
                                  className="primary-button"
                                  onClick={() =>
                                    handleReviewClaim(
                                      claim.id,
                                      "APPROVED"
                                    )
                                  }
                                >
                                  Approve Claim
                                </button>

                                <button
                                  type="button"
                                  className="danger-button"
                                  onClick={() =>
                                    handleReviewClaim(
                                      claim.id,
                                      "REJECTED"
                                    )
                                  }
                                >
                                  Reject Claim
                                </button>

                              </div>
                            )}

                          </div>
                        ))}

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* =====================================================
            VERIFICATION QUESTION MODAL
        ====================================================== */}

        {selectedItem && (
          <div className="modal-overlay">

            <div className="modal">

              <div className="modal-header">

                <div>
                  <p className="eyebrow">
                    OWNERSHIP VERIFICATION
                  </p>

                  <h2>
                    Add Verification Questions
                  </h2>

                  <p>
                    {selectedItem.title}
                  </p>
                </div>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() =>
                    setSelectedItem(null)
                  }
                >
                  ×
                </button>

              </div>

              <div className="verification-info">
                <p>
                  Create questions that only the
                  genuine owner is likely to know.
                </p>

                <p>
                  Example: "What name is written
                  on the ID card?"
                </p>
              </div>

              <div className="questions-list">

                {questions.map(
                  (question, index) => (
                    <div
                      className="question-input-row"
                      key={index}
                    >

                      <div className="form-group">
                        <label>
                          Question {index + 1}
                        </label>

                        <input
                          type="text"
                          value={question}
                          placeholder={
                            index === 0
                              ? "What name or branch is written on the item?"
                              : "Ask another detail only the owner would know"
                          }
                          onChange={(event) =>
                            handleQuestionChange(
                              index,
                              event.target.value
                            )
                          }
                        />
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          className="remove-question"
                          onClick={() =>
                            removeQuestion(index)
                          }
                        >
                          Remove
                        </button>
                      )}

                    </div>
                  )
                )}

              </div>

              {questions.length < 3 && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={addQuestion}
                >
                  + Add Another Question
                </button>
              )}

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setSelectedItem(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="primary-button"
                  disabled={savingQuestions}
                  onClick={handleSaveQuestions}
                >
                  {savingQuestions
                    ? "Saving..."
                    : "Save Questions"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}

export default Dashboard;