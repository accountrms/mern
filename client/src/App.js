import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import NewRequest from "./components/NewRequest";
import RequestForChange from "./components/RequestForChange";
import RequestForDelete from "./components/RequestForDelete";
import Notfound from "./components/Notfound";
import Tracking from "./components/Tracking";
import RequestSuccess from "./components/RequestSuccess";
import GenerateSuccess from "./components/GenerateSuccess";
import RequestForChangeSuccess from "./components/RequestForChangeSuccess";
import RequestForDeleteSuccess from "./components/RequestForDeleteSuccess";
import UpdateProcessed from "./components/UpdateProcessed";
import DeleteProcessed from "./components/DeleteProcessed";

class App extends Component {
  state = {
    user: "",
    id: ""
  };

  handleUser = data => {
    this.setState({
      user: data.user,
      id: data.id
    });
  };

  render() {
    return (
      <Router>
        <div>
          <Navbar data={this.state} />
          <Switch>
            <PrivateRoute exact path="/" component={Home} />
            <Route
              path="/login"
              render={props => <Login {...props} onUser={this.handleUser} />}
            />
            <PrivateRoute path="/ims_new" component={NewRequest} />
            <PrivateRoute path="/ims_change" component={RequestForChange} />
            <PrivateRoute path="/ims_delete" component={RequestForDelete} />
            <PrivateRoute path="/generate/:id" component={Tracking} />
            <PrivateRoute path="/reqsuccess" component={RequestSuccess} />
            <PrivateRoute path="/gensuccess" component={GenerateSuccess} />
            <PrivateRoute
              path="/reqchangesuccess"
              component={RequestForChangeSuccess}
            />
            <PrivateRoute
              path="/reqdeletesuccess"
              component={RequestForDeleteSuccess}
            />
            <PrivateRoute path="/update/:id" component={UpdateProcessed} />
            <PrivateRoute path="/delete/:id" component={DeleteProcessed} />
            <Route component={Notfound} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
