import { Link } from "react-router-dom";

function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">VIT CAMPUS</p>

          <h1>
            Lost something?
            <br />
            Let's get it back.
          </h1>

          <p className="hero-text">
            A dedicated campus platform to report,
            discover and recover belongings across VIT.
          </p>

          <div className="hero-actions">
            <Link
              className="primary-button"
              to="/report"
            >
              Report an Item
            </Link>

            <Link
              className="secondary-button"
              to="/lost"
            >
              Browse Lost Items
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <p className="eyebrow">RECOVERY</p>
          <h2>How it works</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span>01</span>
            <h3>Report</h3>
            <p>
              Report a lost or found belonging with
              its location and description.
            </p>
          </div>

          <div className="step-card">
            <span>02</span>
            <h3>Discover</h3>
            <p>
              Browse campus reports and find items
              matching your belongings.
            </p>
          </div>

          <div className="step-card">
            <span>03</span>
            <h3>Recover</h3>
            <p>
              Submit a claim and coordinate a safe
              handoff.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <p className="eyebrow">CATEGORIES</p>
          <h2>What are you looking for?</h2>
        </div>

        <div className="category-grid">
          <div>ID Cards</div>
          <div>Room Keys</div>
          <div>Calculators</div>
          <div>Lab Equipment</div>
          <div>Earphones</div>
          <div>Wallets</div>
        </div>
      </section>
    </main>
  );
}

export default Home;