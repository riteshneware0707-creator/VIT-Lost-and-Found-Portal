import { useEffect, useState } from "react";
import {
  getItem,
  getVerificationQuestions,
  createClaim,
  submitClaimAnswers,
} from "../utils/api";
import {
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

function FoundItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [questions, setQuestions] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [answers, setAnswers] =
    useState({});

  const [claimId, setClaimId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadItem();
  }, [id]);

  async function loadItem() {
    setLoading(true);
    setError("");

    try {
      const itemData =
        await getItem(id);

      setItem(itemData.item);

      if (
        itemData.item.type ===
        "FOUND"
      ) {
        try {
          const questionData =
            await getVerificationQuestions(
              id
            );

          setQuestions(
            questionData.questions || []
          );
        } catch {
          setQuestions([]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(
    questionId,
    value
  ) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  }

  async function handleClaim() {
    setError("");
    setSuccess("");

    if (!item) {
      return;
    }

    if (questions.length === 0) {
      setError(
        "The finder has not added verification questions yet."
      );

      return;
    }

    const unanswered =
      questions.some(
        (question) =>
          !answers[question.id] ||
          !answers[question.id].trim()
      );

    if (unanswered) {
      setError(
        "Please answer every verification question."
      );

      return;
    }

    setSubmitting(true);

    try {
      const claimData =
        await createClaim(
          item.id,
          message
        );

      const newClaimId =
        claimData.claimId;

      const formattedAnswers =
        questions.map(
          (question) => ({
            question_id:
              question.id,

            answer:
              answers[
                question.id
              ].trim(),
          })
        );

      await submitClaimAnswers(
        newClaimId,
        formattedAnswers
      );

      setClaimId(
        newClaimId
      );

      setSuccess(
        "Your claim has been submitted successfully. The finder will review your answers."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="form-container">
          <p>
            Loading item...
          </p>
        </div>
      </main>
    );
  }

  if (error && !item) {
    return (
      <main className="page">
        <div className="form-container">

          <div className="form-error">
            {error}
          </div>

          <Link
            to="/found"
            className="secondary-button"
          >
            Back to Found Items
          </Link>

        </div>
      </main>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <main className="page">
      <div className="form-container">

        <Link
          to="/found"
          className="back-link"
        >
          ← Back to Found Items
        </Link>

        <div className="page-header">
          <div>

            <p className="eyebrow">
              FOUND ITEM
            </p>

            <h1>
              {item.title}
            </h1>

            <p>
              {item.category} ·{" "}
              {item.location}
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

        {/* ITEM DETAILS */}

        <section className="item-details-card">

          <div className="item-card-header">

            <span className="item-type-badge">
              FOUND
            </span>

            <span className="status-badge">
              {item.status}
            </span>

          </div>

          <h2>
            Item Details
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
                Found At
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

        </section>

        {/* CLAIM SUCCESS */}

        {claimId ? (
          <section className="claim-success-card">

            <div className="success-icon">
              ✓
            </div>

            <h2>
              Claim Submitted
            </h2>

            <p>
              Your ownership verification
              answers have been sent to the
              finder.
            </p>

            <p>
              The finder will review your
              answers and decide whether to
              approve the claim.
            </p>

            <Link
              to="/found"
              className="primary-button"
            >
              Browse Found Items
            </Link>

          </section>
        ) : (
          /* CLAIM FORM */

          <section className="claim-form-section">

            <div className="section-heading">

              <div>
                <p className="eyebrow">
                  OWNERSHIP VERIFICATION
                </p>

                <h2>
                  Claim This Item
                </h2>

                <p>
                  Answer the questions set by
                  the finder to prove that this
                  item belongs to you.
                </p>
              </div>

            </div>

            {questions.length === 0 ? (
              <div className="empty-state">

                <h3>
                  Verification questions
                  not available
                </h3>

                <p>
                  The finder has not created
                  verification questions for
                  this item yet.
                </p>

              </div>
            ) : (
              <>
                <div className="verification-info">

                  <p>
                    🔒 Your answers are only
                    shared with the finder.
                  </p>

                  <p>
                    The finder's personal
                    information is not shown to
                    you.
                  </p>

                </div>

                <div className="questions-list">

                  {questions.map(
                    (
                      question,
                      index
                    ) => (
                      <div
                        className="form-group"
                        key={
                          question.id
                        }
                      >

                        <label>
                          {index + 1}.{" "}
                          {
                            question.question
                          }
                        </label>

                        <textarea
                          rows="3"
                          placeholder="Enter your answer..."
                          value={
                            answers[
                              question.id
                            ] || ""
                          }
                          onChange={(
                            event
                          ) =>
                            handleAnswerChange(
                              question.id,
                              event.target
                                .value
                            )
                          }
                        />

                      </div>
                    )
                  )}

                </div>

                <div className="form-group">

                  <label>
                    Additional Message
                    <span>
                      {" "}
                      (optional)
                    </span>
                  </label>

                  <textarea
                    rows="4"
                    placeholder="Add any additional information that may help the finder verify your ownership..."
                    value={message}
                    onChange={(event) =>
                      setMessage(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="claim-warning">

                  <strong>
                    Before submitting
                  </strong>

                  <p>
                    Only submit a claim if you
                    genuinely believe this item
                    belongs to you. False claims
                    may prevent the actual owner
                    from recovering their item.
                  </p>

                </div>

                <button
                  type="button"
                  className="primary-button"
                  disabled={submitting}
                  onClick={
                    handleClaim
                  }
                >
                  {submitting
                    ? "Submitting Claim..."
                    : "Submit Ownership Claim"}
                </button>

              </>
            )}

          </section>
        )}

      </div>
    </main>
  );
}

export default FoundItemDetails;