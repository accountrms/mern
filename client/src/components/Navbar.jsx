import React from "react";
import { NavLink, withRouter, Link } from "react-router-dom";
import fakeAuth from "../helpers/fakeAuth";

var Navbar = props => {
  return (
    <nav>
      <div className="nav-wrapper container">
        <Link to="/" className="brand-logo">
          <img src="logo.png" alt="logo" />
          <span className="right">IMS Request App</span>
        </Link>
        {props.location.pathname !== "/login" ? (
          <ul className="right">
            <li>
              <NavLink exact={true} to="/">
                Home
              </NavLink>
            </li>
            {props.data.id === "admin" ||
            props.data.id === "operator" ? null : (
              <React.Fragment>
                <li>
                  <NavLink to="/ims_new">Request:New</NavLink>
                </li>
                <li>
                  <NavLink to="/ims_change">Request:Change</NavLink>
                </li>
                <li>
                  <NavLink to="/ims_delete">Request:Delete</NavLink>
                </li>
              </React.Fragment>
            )}

            <li>
              {fakeAuth.isAuthenticated ? (
                <span
                  onClick={() => {
                    fakeAuth.signout(() => props.history.push("/"));
                  }}
                >
                  Sign out ({props.data.user})
                </span>
              ) : null}
            </li>
          </ul>
        ) : null}
      </div>
    </nav>
  );
};

export default withRouter(Navbar);
