var SearchResultsContainer = React.createClass({
  propTypes: {
    searchText: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      results: [],
      count: 0,
      topPickID: 0,
      completed: false
    };
  },

  componentDidMount: function () {
    this.performSearch(this.props.searchText);
  },

  performSearch: function (searchText) {
    $.ajax({
      type: "GET",
      url: "/tvdb/search",
      data: {
        "search_text": searchText,
      },
      success: function(msg) {
        if (msg.hasOwnProperty('data')) {
          this.setState({
            count: msg.data.length
          });
          var bestMatch;
          for (let item of msg.data) {
            if (item.seriesName.toLowerCase() == searchText.toLowerCase()) {
              bestMatch = item;
              break;
            }
            for (let otherName of item.aliases) {
              if (otherName.toLowerCase() == searchText.toLowerCase()) {
                bestMatch = item;
                break;
              }
            }
          }
          if (bestMatch) {
            this.getSeriesInfo(bestMatch);
            this.setState({
              topPickID: bestMatch.id
            });
          }

          for (let item of msg.data) {
            if (item.id != this.state.topPickID) {
              this.getSeriesInfo(item);
            }
          }
        } else {
          this.setState({
            completed: true
          });
        }
      }.bind(this),
      error: function() {
        alert("Error: failed to perform search on page load.");
      }
    });
  },

  getSeriesInfo: function (item) {
    $.ajax({
      type: "GET",
      url: "/tvdb/series",
      data: {
        "series_id": item.id,
      },
      success: function(msg) {
        if (msg.hasOwnProperty('data')) {
          this.insertIntoResults(msg.data);
        }
      }.bind(this),
      error: function() {
        alert("Error: failed to get poster.");
      }
    });
  },

  insertIntoResults: function(data) {
    for (var i = 0; i < this.state.results.length; i++) {
      var series = this.state.results[i];
      var inserted = false;
      if ((series.posters.length == 0 && data.posters.length > 0) ||
          (((series.posters.length == 0 && data.posters.length == 0) ||
          (series.posters.length > 0 && data.posters.length > 0)) &&
          series.siteRatingCount < data.siteRatingCount)) {
        var newResults = this.state.results.slice(0, i);
        newResults.append(data);
        newResults.append(this.state.results.slice(i, this.state.results.length));
        this.setState({
          results: newResults
        });
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      this.setState({
        results: this.state.results.append(data)
      });
    }
  },

  render: function () {
    return (
      <div>
        <SearchResults searchText={this.props.searchText}
            results={this.state.results}
            count={this.state.count}
            topPickID={this.state.topPickID}
            completed={this.state.completed} />
      </div>
    );
  }
});