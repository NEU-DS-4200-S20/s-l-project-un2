((() => {
  let countries;
  const countryDropdown = document.querySelector('#country-dropdown');


  // Initialize choropleth map https://d3-geomap.github.io/map/choropleth/world/ 
  var map = d3.choropleth()
    .geofile('lib/d3-geomap/topojson/world/countries.json')
    .colors(d3.schemeYlGnBu[9])
    .column('Category Count') // column to represent on heatmap
    .format(d => d)
    .unitId('name'); // column that identifies each country (must match the property name in countries.json) 

  // Import data
  d3.csv('/data/country-programme-results-2019.csv').then(data => {
    let countries = getDistinctValuesForField(data, 'Country');
    populateDropdown(countryDropdown, countries);

    // TODO: make this based on dropdown value
    const category = "Youth";
    const categoryData = getCountForCategory(data, category);
    map.draw(d3.select('#map').datum(categoryData));
  });


})());

function populateDropdown(dropdown, options) {
  options.forEach(option => {
    let el = document.createElement("option");
    el.text = option;
    el.valye = option;

    dropdown.add(el);
  })
}

function getDistinctValuesForField(data, field) {
  let distinctValues = {};

  for (let i = 0; i < data.length; i++) {
    const value = data[i][field];

    if (distinctValues[value]) {
      distinctValues[value]++;
    } else if (value !== '') {
      distinctValues[value] = 1;
    }
  }

  return Object.keys(distinctValues);
}

function getCountForCategory(data, category) {
  let entriesForCategory = data.filter(entry => entry['Thematic Area Category'].toLowerCase() == category.toLowerCase());

  // Array of objects that look like this:
  // {name: "Bangladesh", Thematic Area Category: "Sexual reproductive health", Category Count: 13}
  let countryCategoryCount = entriesForCategory.reduce((result, entry) => {
    const country = entry['Country'];

    // Add to count if country has aleady been seen
    for (let i = 0; i < result.length; i++) {
      if (result[i]['name'] == country) {
        result[i]['Category Count'] += 1;
        return result;
      }
    }
    // Push new object to array if country hasn't been seen yet
    result.push({ 'name': country, 'Thematic Area Category': category, 'Category Count': 1 });
    return result;
  }, []);

  return countryCategoryCount;
}
