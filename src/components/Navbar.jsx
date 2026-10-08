import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link className="logo" to="/">
        VIT <span>Lost & Found</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/lost">Lost</Link>
        <Link to="/found">Found</Link>

        <Link
          className="nav-report"
          to="/report"
        >
          Report Item
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;