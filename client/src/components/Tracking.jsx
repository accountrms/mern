import React, { Component } from "react";
import axios from "axios";

class Tracking extends Component {
  state = {
    id: null,
    tracking: [],
    trackingNo: ""
  };

  componentDidMount() {
    let id = this.props.match.params.ims_id;
    this.setState({ id });

    var data = {
      token: localStorage.getItem("token")
    };

    axios.post("/getposts/" + id, { data }).then(response => {
      this.setState({ tracking: response.data.data });
    });
  }

  handleChange = e => {
    this.setState({ trackingNo: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    const ims = {
      reqno: this.state.id,
      trackingNo: this.state.trackingNo
    };

    axios
      .put("/updatepost", { ims })
      .then(res => {
        if (res.data) {
          this.props.history.push("/gensuccess");
        } else {
          this.props.history.push("/");
        }
      })
      .catch(err => {
        throw err;
      });
  };

  render() {
    var trackingList = this.state.tracking.map(tracking => {
      return (
        <div className="row" key={tracking.id}>
          <div className="col s12 m6">
            <div className="card">
              <div className="card-content">
                <span className="card-title">Generate Tracking Number</span>
                <p>
                  Vendor Number:
                  <b> {tracking.vendor}</b>
                </p>
                <p>
                  Order Number:
                  <b> {tracking.orderno}</b>
                </p>
                <p>
                  Invoice Number:
                  <b> {tracking.invoice}</b>
                </p>
                <p>
                  Invoice Date:
                  <b>
                    {tracking.date.substr(8, 2) +
                      "/" +
                      tracking.date.substr(5, 2) +
                      "/" +
                      tracking.date.substr(0, 4)}
                  </b>
                </p>
                <p>
                  Invoice Amount:
                  <b> {tracking.amount}</b>
                </p>
              </div>
              <div className="card-action">
                {tracking.processed === 0 ? (
                  <form onSubmit={this.handleSubmit}>
                    <input
                      onChange={this.handleChange}
                      type="text"
                      name="tracking"
                      id="tracking"
                      placeholder="Enter the tracking number"
                    />
                    <button className="btn btn-small" type="submit">
                      Submit
                    </button>
                  </form>
                ) : (
                  <React.Fragment>
                    <p>Tracking Number</p>
                    <h4>{tracking.tracking}</h4>
                  </React.Fragment>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });
    return <div className="container">{trackingList}</div>;
  }
}

export default Tracking;
