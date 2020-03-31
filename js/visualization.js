((() => {
  // Load the data from a CSV file
  d3.csv("/data/country-programme-results-2019.csv", (data) => {
    console.log(data);
  });

  var map = d3.geomap()
    .geofile('lib/d3-geomap/topojson/world/countries.json')
    .draw(d3.select('#map'));
})());