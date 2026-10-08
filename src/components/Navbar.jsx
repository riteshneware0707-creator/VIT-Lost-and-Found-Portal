import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link
          to="/"
          className="navbar-brand"
        >
          VIT Lost & Found
        </Link>

        <div className="navbar-links">
          <Link to="/">
            Home
          </Link>

          <Link to="/lost">
            Lost
          </Link>

          <Link to="/found">
            Found
          </Link>

          <Link to="/report">
            Report Item
          </Link>

          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                {user.name}
              </span>

              <button
                type="button"
                className="navbar-logout"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;