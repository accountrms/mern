import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";

class Home extends Component {
  state = {
    trackingAll: [],
    deleteReqAll: [],
    search: "",
    searchStatus: "",
    id: "",
    searchError: ""
  };

  componentDidMount() {
    var data = {
      token: localStorage.getItem("token"),
      searchStatus: false
    };
    axios.post("/getposts", { data }).then(response => {
      this.setState({
        trackingAll: response.data.results,
        searchStatus: false,
        id: response.data.authData.data.id
      });
    });

    axios.post("/getdeleteposts", { data }).then(response => {
      this.setState({
        deleteReqAll: response.data.results,
        searchStatus: false,
        id: response.data.authData.data.id
      });
    });
  }

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    var data = {
      token: localStorage.getItem("token"),
      search: this.state.search,
      searchStatus: true
    };
    if (this.state.search.length === 11) {
      axios.post("getposts", { data }).then(res => {
        if (res.data.results.length !== 0) {
          this.setState({
            trackingAll: res.data.results,
            searchStatus: true,
            searchError: ""
          });
        } else if (res.data.msgStatus) {
          this.setState({
            searchError: res.data.msg
          });
        } else {
          this.setState({
            searchError: "Please enter correct request number."
          });
        }
      });
    } else {
      this.setState({
        searchError: "Please enter correct request number."
      });
    }
  };

  render() {
    var trackingList = this.state.trackingAll.map(tracking => {
      return (
        <tr key={tracking.id}>
          <td>{tracking.reqno}</td>
          {this.state.id === "admin" ? <td>{tracking.user}</td> : null}
          <td>{tracking.vendor}</td>
          <td>{tracking.orderno}</td>
          <td>{tracking.invoice}</td>
          <td>
            {tracking.date.substr(8, 2) +
              "/" +
              tracking.date.substr(5, 2) +
              "/" +
              tracking.date.substr(0, 4)}
          </td>
          <td>{tracking.amount}</td>
          <td>
            {tracking.type === "N" ? (
              this.state.id === "admin" ? (
                <Link to={"/generate/" + tracking.reqno} className="btn">
                  Add
                </Link>
              ) : (
                <React.Fragment>Not generated</React.Fragment>
              )
            ) : tracking.type === "D" ? (
              <React.Fragment>Not generated</React.Fragment>
            ) : (tracking.type === "T") & (tracking.processed === 1) ? (
              <strike>{tracking.tracking}</strike>
            ) : (
              tracking.tracking
            )}
          </td>
          <td>
            {this.state.id === "admin" &&
            tracking.type === "P" &&
            tracking.processed === 0 ? (
              <Link to={"/update/" + tracking.reqno} className="btn">
                Update
              </Link>
            ) : this.state.id === "admin" &&
              tracking.type === "T" &&
              tracking.processed === 0 ? (
              <React.Fragment>Completed</React.Fragment>
            ) : tracking.type === "N" ? (
              <React.Fragment>New Request</React.Fragment>
            ) : tracking.type === "D" ? (
              <React.Fragment>Deleted</React.Fragment>
            ) : (tracking.type === "T") & (tracking.processed === 0) ? (
              <React.Fragment>Deletion Requested</React.Fragment>
            ) : (tracking.type === "T") & (tracking.processed === 1) ? (
              <React.Fragment>Tr. No. deleted</React.Fragment>
            ) : (tracking.type === "P") & (tracking.processed === 0) ? (
              <React.Fragment>Data update in progress</React.Fragment>
            ) : (
              <React.Fragment>Completed</React.Fragment>
            )}
          </td>
        </tr>
      );
    });

    var deleteReqAllList = this.state.deleteReqAll.map(tracking => {
      return (
        <tr key={tracking.id}>
          <td>{tracking.delreqno}</td>
          {this.state.id === "admin" ? <td>{tracking.user}</td> : null}
          <td>{tracking.vendor}</td>
          <td>{tracking.orderno}</td>
          <td>{tracking.invoice}</td>
          <td>
            {tracking.date.substr(8, 2) +
              "/" +
              tracking.date.substr(5, 2) +
              "/" +
              tracking.date.substr(0, 4)}
          </td>
          <td>{tracking.amount}</td>
          <td>{tracking.tracking}</td>
          <td>
            {this.state.id === "admin" &&
            tracking.type === "P" &&
            tracking.processed === 0 ? (
              <Link to={"/update/" + tracking.reqno} className="btn">
                Update
              </Link>
            ) : this.state.id === "admin" && tracking.processed === 0 ? (
              <Link to={"/delete/" + tracking.delreqno} className="btn">
                DELETE
              </Link>
            ) : tracking.processed === 0 ? (
              <React.Fragment>Tr. No. deletion in progress</React.Fragment>
            ) : (tracking.type === "T") & (tracking.processed === 1) ? (
              <React.Fragment>Tr. No. deleted</React.Fragment>
            ) : (
              <React.Fragment>Completed</React.Fragment>
            )}
          </td>
        </tr>
      );
    });

    return (
      <div className="container">
        {this.state.trackingAll.length !== 0 ? (
          <React.Fragment>
            <SearchBar
              onSubmit={this.handleSubmit}
              onChange={this.handleChange}
              searchError={this.state.searchError}
            />
            <h5>Request: New</h5>
            <table className="highlight">
              <thead>
                <tr>
                  <th>Request No.</th>
                  {this.state.id === "admin" ? <th>CPF</th> : null}
                  <th>Vendor No.</th>
                  <th>Order No.</th>
                  <th>Invoice No.</th>
                  <th>Invoice Date</th>
                  <th>Invoice Amount</th>
                  <th>Tracking No.</th>
                  {this.state.id === "admin" ? (
                    <th>Process</th>
                  ) : (
                    <th>Status</th>
                  )}
                </tr>
              </thead>
              <tbody>{trackingList}</tbody>
            </table>
            <br />
            <h5>Request: Delete</h5>
            <table className="highlight">
              <thead>
                <tr>
                  <th>Request No.</th>
                  {this.state.id === "admin" ? <th>CPF</th> : null}
                  <th>Vendor No.</th>
                  <th>Order No.</th>
                  <th>Invoice No.</th>
                  <th>Invoice Date</th>
                  <th>Invoice Amount</th>
                  <th>Tracking No.</th>
                  {this.state.id === "admin" ? (
                    <th>Process</th>
                  ) : (
                    <th>Status</th>
                  )}
                </tr>
              </thead>
              <tbody>{deleteReqAllList}</tbody>
            </table>
          </React.Fragment>
        ) : this.state.searchStatus ? (
          <React.Fragment>
            <SearchBar
              onSubmit={this.handleSubmit}
              onChange={this.handleChange}
            />
            <h5>Nothing found! Try again with correct request number </h5>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <h4>No request yet! </h4>
            <h5>
              Go to <Link to="/ims_new">Request</Link> to create new request
            </h5>
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default Home;
