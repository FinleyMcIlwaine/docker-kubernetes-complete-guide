import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
  state = {
    seenIndices: [],
    values: {},
    index: ''
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndices();
  }

  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({ values: values.data });
  }

  async fetchIndices() {
    const seenIndices = await axios.get('api/values/all');
    this.setState({
      seenIndices: seenIndices.data
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    await axios.post('/api/values', {
      index: this.state.index
    });
    this.setState({ index: '' });
  }

  renderSeenIndices() {
    return this.state.seenIndices.map(({ number }) => number).join(', ');
  }

  renderCalculatedValues() {
    const entries = [];
    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key}, I calculated {this.state.values[key]}
        </div>
      )
    }
    return entries;
  }

  render() {
    return (
      <div>
        <form onSubmit={ this.handleSubmit }>
          <label>Enter your index:</label><br></br>
          <input
            value={this.state.index}
            onChange={event => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>
        <br></br>
        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndices()}
        <h3>Calculated values:</h3>
        {this.renderCalculatedValues()}
      </div>
    )
  }
}

export default Fib;