import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <a className="brand" href="/" onClick={() => setOpen(false)}>
          Gary Bishop, REALTOR®
          <span>Coldwell Banker Ben Bates, Inc., REALTORS®</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close Menu" : "Menu"}
        </button>
        <nav id="primary-nav" className={`nav${open ? " is-open" : ""}`} aria-label="Primary">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
            onClick={() => setOpen(false)}
          >
            Selling a Home
          </NavLink>
          <NavLink
            to="/buyers"
            className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
            onClick={() => setOpen(false)}
          >
            Buying a Home
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
