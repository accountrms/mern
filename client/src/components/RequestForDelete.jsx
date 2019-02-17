import React, { Component } from "react";
import axios from "axios";
import SearchBar from "./SearchBar";

class RequestForDelete extends Component {
  state = {
    trackingAll: [],
    search: "",
    searchStatus: "",
    justification: "",
    searchError: ""
  };

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
            searchStatus: true
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

  handleCancel = e => {
    this.setState({
      trackingAll: [],
      search: "",
      searchStatus: "",
      error: ""
    });
  };

  handleDeleteSubmit = e => {
    var data = {
      token: localStorage.getItem("token"),
      details: this.state.trackingAll,
      justification: this.state.justification
    };
    axios.post("requestfordelete", { data }).then(response => {
      console.log(response.data.data);
      if (response.data.data) {
        this.props.history.push("/reqdeletesuccess");
      } else {
        this.setState({
          error: "Some error occurred, Try again"
        });
      }
    });
  };

  render() {
    var trackingList = this.state.trackingAll.map(tracking => {
      return (
        <div key={tracking.id}>
          <h6>
            You searched for <b>Request No. {tracking.reqno}</b>
          </h6>
          <table className="highlight">
            <thead>
              <tr>
                <th>Vendor No.</th>
                <th>Order No.</th>
                <th>Invoice No.</th>
                <th>Invoice Date</th>
                <th>Invoice Amount</th>
                <th>Tracking No.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
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
              </tr>
            </tbody>
          </table>
          <div className="row">
            <form className="col s12">
              {tracking.tracking === "absent" ? (
                <div className="input-field col s12">
                  <div className="col s3">
                    <input
                      onClick={this.handleDeleteSubmit}
                      type="button"
                      className="btn red"
                      value="DELETE REQUEST"
                    />
                  </div>
                  <div className="col s3">
                    <input
                      onClick={this.handleCancel}
                      type="button"
                      className="btn green"
                      value="Cancel"
                    />
                  </div>
                </div>
              ) : (
                <React.Fragment>
                  <div className="input-field col s9">
                    <label htmlFor="justification">
                      Enter the reason for deletion and click Submit
                    </label>
                    <input
                      onChange={this.handleChange}
                      name="justification"
                      id="justification"
                      type="text"
                      className="validate"
                    />
                  </div>

                  <div className="input-field col s3">
                    <div className="col s6">
                      <input
                        onClick={this.handleDeleteSubmit}
                        type="button"
                        className="btn green"
                        value="Submit"
                      />
                    </div>
                    <div className="col s6">
                      <input
                        onClick={this.handleCancel}
                        type="button"
                        className="btn red"
                        value="Cancel"
                      />
                    </div>
                  </div>
                </React.Fragment>
              )}
            </form>
          </div>
        </div>
      );
    });

    return (
      <div className="container">
        <h5>
          <u>Request: Delete</u>
        </h5>
        {this.state.trackingAll.length === 0 ? (
          <React.Fragment>
            <SearchBar
              onSubmit={this.handleSubmit}
              onChange={this.handleChange}
              searchError={this.state.searchError}
            />
          </React.Fragment>
        ) : (
          <React.Fragment>{trackingList}</React.Fragment>
        )}
      </div>
    );
  }
}

export default RequestForDelete;
