import React from "react";
import { Redirect } from "react-router-dom";
import fakeAuth from "../helpers/fakeAuth";
import axios from "axios";

class Login extends React.Component {
  state = {
    redirectToReferrer: false,
    username: "",
    password: "",
    usernameError: "",
    passwordError: "",
    error: ""
  };

  componentWillMount() {
    var data = {
      token: localStorage.getItem("token")
    };
    if (typeof data.token !== "undefined") {
      axios.post("/authenticateUser", { data }).then(res => {
        if (res.data.status) {
          this.props.onUser(res.data.data);
          this.relogin();
        }
      });
    } else {
      console.log("Token expired!");
    }
  }

  login = () => {
    fakeAuth.authenticate(() => {
      this.setState({ redirectToReferrer: true });
    });
  };

  relogin = () => {
    fakeAuth.reauthenticate(() => {
      this.setState({ redirectToReferrer: true });
    });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleSubmit = e => {
    var data = {
      username: this.state.username,
      password: this.state.password
    };
    e.preventDefault();
    if (data.username.replace(/\s+/, "").length < 1) {
      this.setState({ usernameError: "Please enter username" });
    } else {
      this.setState({ usernameError: "", error: "" });
    }
    if (data.password.length < 1) {
      this.setState({ passwordError: "Please enter password" });
    } else {
      this.setState({ passwordError: "", error: "" });
    }
    if (data.username.length > 0 && data.password.length > 0) {
      axios.post("http://localhost:3001/login", { data }).then(res => {
        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          this.props.onUser(res.data.data);
          this.login();
        } else {
          this.setState({ error: "Invalid Username / password" });
        }
      });
    }
  };

  render() {
    let { from } = this.props.location.state || { from: { pathname: "/" } };
    let { redirectToReferrer } = this.state;

    if (redirectToReferrer) return <Redirect to={from} />;

    return (
      <div className="container">
        <div className="row">
          <div className="col s12 m6">
            <form onSubmit={this.handleSubmit}>
              <div className="card">
                <div className="card-content">
                  <span className="card-title">
                    Login with your domain credentials
                  </span>
                  <div>
                    <label htmlFor="username">Username</label>
                    <input
                      onChange={this.handleChange}
                      type="text"
                      name="username"
                      id="username"
                    />
                    <span className="helper-text red-text">
                      {this.state.usernameError}
                    </span>
                  </div>
                  <div>
                    <label htmlFor="password">Password</label>
                    <input
                      onChange={this.handleChange}
                      type="password"
                      name="password"
                      id="password"
                    />
                    <span className="helper-text red-text">
                      {this.state.passwordError}
                    </span>
                  </div>
                </div>
                <div className="card-action">
                  <button className="btn btn-large">Log in</button>
                  <span className="red-text warning">{this.state.error}</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
