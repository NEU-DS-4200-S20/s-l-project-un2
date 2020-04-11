((() => {
  // Import data
  let dataset;
  d3.csv('data/country-programme-results-2019.csv').then(data => {
    dataset = data

    // Populate Country dropdown
    const countries = getDistinctValuesForField(dataset, 'Country');
    populateDropdown(countryDropdown, countries.sort());

    drawMap();

    // Creates table
    table()
    ("#table", dataset);
  });

  // Initialize choropleth map https://d3-geomap.github.io/map/choropleth/world/ 
  let map = d3.choropleth()
    .geofile('lib/d3-geomap/topojson/world/countries.json')
    .colors(d3.schemeYlGnBu[9])
    .column('Initiative Count') // column to represent on heatmap
    .format(d => d)
    .unitId('name'); // column that identifies each country (must match the property name in countries.json) 

  // Link dropdowns to map
  const countryDropdown = document.querySelector('#country-dropdown');
  const categoryDropdown = document.querySelector('#category-dropdown');
  let dispatch = d3.dispatch("change-category");
  categoryDropdown.addEventListener("change", () => { dispatch.call("change-category") });
  dispatch.on("change-category", drawMap);


  // Draws map 
  function drawMap() {
    if (dataset) {
      const category = categoryDropdown[categoryDropdown.selectedIndex].text;
      const categoryData = getDataForCategory(dataset, category);

      // Draw map
      d3.select('#map').select('svg').remove();
      map.draw(d3.select("#map").datum(categoryData));
    }
  }
})());

/**
 * Populates given dropdown with given option values.
 * 
 * @param {HTMLElement} dropdown HTML dropdown element
 * @param {array}       options  Values to populate dropdown options with
 */
function populateDropdown(dropdown, options) {
  options.forEach(option => {
    let el = document.createElement("option");
    el.text = option;
    el.valye = option;

    dropdown.add(el);
  })
}

/**
 * Gets the unique values for the given field of the given dataset.
 * 
 * @param {array}  data  Dataset
 * @param {string} field Data field (column) name
 * 
 * @returns {array} 
 */
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

/**
 * Constructs data to use for a heatmap of the given category.
 * 
 * @param {array}  data     Dataset
 * @param {string} category Thematic area category name
 * 
 * @returns {array}
 */
function getDataForCategory(data, category) {
  let entriesForCategory = data.filter(entry => entry['Thematic Area Category'].toLowerCase() == category.toLowerCase());

  // Array of objects that look like this:
  // {name: "Bangladesh", Thematic Area Category: "Sexual reproductive health", Category Count: 13}
  let countryCategoryCount = entriesForCategory.reduce((result, entry) => {
    let country = entry['Country'];

    // Add to count if country has aleady been seen
    for (let i = 0; i < result.length; i++) {
      if (result[i]['name'] == country) {
        result[i]['Initiative Count'] += 1;
        return result;
      }
    }
    // Push new object to array if country hasn't been seen yet
    result.push({ 'name': country, 'Thematic Area Category': category, 'Initiative Count': 1 });
    return result;
  }, []);

  return countryCategoryCount;
}

// Modal 

var modal = document.getElementById('myModal');
var svg = $("#mysvg");

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

svg.on("click", function(d){
  $("#myModal").show();
});

// Creates table
function table(data) {
  let ourBrush = null,
    selectableElements = d3.select(null),
    dispatcher;
  function chart(selector, data) {
    let table = d3.select(selector)
      .append("table")
        .classed("my-table", true)

    // Filters the dataset to only get certain columns
    let tableHeaders = Object.keys(data[0]).filter(key => {return key == "Country" 
      || key == "Thematic Area" || key == "Thematic Area Category";
    });

    var header = table.append("thead").append("tr")
      .selectAll("th")
      .data(tableHeaders)
      .enter()
      .append("th")
        .text(d => {return d;})

    var rows = table.append("tbody")
      .selectAll("tr")
      .data(data)
      .enter()
      .append("tr")
      .on("mouseover", function(d){
      d3.select(this)
        .style("background-color", "#bcc0c0");
      })
      .on("mouseout", function(d){
      d3.select(this)
        .style("background-color", "transparent");
      });

    var cells = rows.selectAll("td")
      .data(row => {return tableHeaders.map((d, i) =>
        {return {i: d, value: row[d]};
      });
    })
    .enter()
    .append("td")
    .html(d => {return d.value;});
};
return chart;
}
