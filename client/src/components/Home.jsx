import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";

class Home extends Component {
  state = {
    trackingAll: [],
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
    if (this.state.search.length === 12) {
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
            {tracking.tracking === "absent" ? (
              this.state.id === "admin" ? (
                <Link to={"/generate/" + tracking.reqno} className="btn">
                  Add
                </Link>
              ) : (
                <b>Not generated</b>
              )
            ) : (
              tracking.tracking
            )}
          </td>
          <td>
            {tracking.type === "N" ? (
              <React.Fragment>New Request</React.Fragment>
            ) : tracking.type === "T" ? (
              <React.Fragment>Tr. No. deletion in progress</React.Fragment>
            ) : (tracking.type === "P") & (tracking.processed === 0) ? (
              <React.Fragment>Data update in progress</React.Fragment>
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

            <table className="highlight">
              <thead>
                <tr>
                  <th>Request No.</th>
                  <th>Vendor No.</th>
                  <th>Order No.</th>
                  <th>Invoice No.</th>
                  <th>Invoice Date</th>
                  <th>Invoice Amount</th>
                  <th>Tracking No.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>{trackingList}</tbody>
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
