((() => {
  // Load the data from a CSV file
  d3.csv("/data/country-programme-results-2019.csv", (data) => {
    console.log(data);
  });
})());