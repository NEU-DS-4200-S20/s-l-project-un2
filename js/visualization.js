((() => {
  const categoryNames = {
    "Sexual reproductive health": "Sexual Reproductive Health",
    "GBV": "Gender-based Violence",
    "Youth": "Youth",
    "OEE": "Organizational Effectiveness and Efficiency",
    "Population data": "Population Data",
    "Harmful practices": "Harmful Practices"
  }

  const categoryColors = {
    "Sexual reproductive health": d3.schemeBlues[9],
    "GBV": d3.schemeGreens[9],
    "Youth": d3.schemeOranges[9],
    "OEE": d3.schemePurples[9],
    "Population data": d3.schemeReds[9],
    "Harmful practices": d3.schemeBuGn[9]
  }

  // Initialize values
  let dataset;
  let filters = {};

  // Initialize dropdown filters
  const countryDropdown = document.querySelector('#country-dropdown');
  const categoryDropdown = document.querySelector('#category-dropdown');

  // Import data
  d3.csv('data/country-programme-results-2019.csv').then(data => {
    dataset = data

    // Populate Country dropdown
    const countries = getDistinctValuesForField(dataset, 'Country');
    populateDropdown(countryDropdown, countries.sort());

    // Populate Category dropdown
    const categories = getDistinctValuesForField(dataset, 'Thematic Area Category');
    populateDropdown(categoryDropdown, categories.sort(), (cat) => categoryNames[cat] || cat);

    drawMap();
    createTable("#table", dataset);
  });

  // Initialize choropleth map https://d3-geomap.github.io/map/choropleth/world/ 
  let map = d3.choropleth()
    .geofile('lib/d3-geomap/topojson/world/countries.json')
    .column('Initiative Count') // column to represent on heatmap
    .format(d => d)
    .unitId('name'); // column that identifies each country (must match the property name in countries.json) 

  // Link dropdowns to map
  let dispatch = d3.dispatch("map-changed");
  dispatch.on("map-changed", updateDropdownFromMap);
  countryDropdown.addEventListener("change", onChangeCountry);
  categoryDropdown.addEventListener("change", onChangeCategory);

  // Update table and map when category changes
  function onChangeCategory() {
    const category = categoryDropdown.value;

    if (category) {
      filters["Thematic Area Category"] = categoryDropdown.value;
    } else {
      delete filters["Thematic Area Category"];
    }

    updateTable("#table", dataset, filters);
    drawMap();
  }

  // Update table and map when country changes
  function onChangeCountry() {
    const country = countryDropdown.value;

    if (country) {
      filters["Country"] = country;
    } else {
      delete filters["Country"];
    }

    updateTable("#table", dataset, filters);
    updateMapFromDropdown(country);
  }

  // Update dropdown selection when user selects a country on map
  function updateDropdownFromMap(country) {
    countryDropdown.value = country;

    filters["Country"] = country;
    updateTable("#table", dataset, filters);
  }

  // Update map selection when user selects a country from dropdown
  function updateMapFromDropdown(country) {
    if (country) {
      let path = document.querySelector(".unit.unit-" + country)
      path.dispatchEvent(new Event("click"));
    } else {
      // TODO: Zoom out of map somehow
    }
  }

  // Set map click callback to zoomMap
  map.clicked = zoomMap

  function zoomMap(d) {
    // Tell dispatch that map changed
    dispatch.call("map-changed", {}, d.properties.name)

    // Original zooming implementation from d3-geomap libary 
    let k = 1,
      x0 = this.properties.width / 2,
      y0 = this.properties.height / 2,
      x = x0,
      y = y0;

    if (d && d.hasOwnProperty('geometry') && this._.centered !== d) {
      let centroid = this.path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = this.properties.zoomFactor;
      this._.centered = d;
    } else {
      this._.centered = null;
    }

    this.svg.selectAll('path.unit')
      .classed('active', this._.centered && ((_) => _ === this._.centered));

    this.svg.selectAll('g.zoom')
      .transition()
      .duration(750)
      .attr('transform', `translate(${x0}, ${y0})scale(${k})translate(-${x}, -${y})`);
  }

  // Draws map 
  function drawMap() {
    if (dataset) {
      const category = categoryDropdown.value;
      const country = countryDropdown.value;
      const categoryData = getDataForCategory(dataset, category);

      // Set colors according to category
      map.colors(categoryColors[category] || d3.schemeBlues[9]);

      // Draw map
      d3.select('#map').select('svg').remove();
      map.draw(d3.select("#map").datum(categoryData));

      if (country) {
        updateMapFromDropdown(country);
      }
    }
  }
})());

// ============================ TABLE ============================

// Creates table
function createTable(selector, data) {
  let table = d3.select(selector)
    .append("table")
    .classed("my-table", true)

  // Columns to display
  let tableHeaders = ["Country", "Thematic Area", "Thematic Area Category"];

  let header = table
    .append("thead")
    .append("tr")
    .selectAll("th")
    .data(tableHeaders)
    .enter()
    .append("th")
    .text(d => { return d; })

  let rows = table
    .append("tbody")
    .selectAll("tr")
    .data(data)
    .enter()
    .append("tr")
    .on("click", function (d) {
      modal.style.display = "block";
      document.getElementById('modal-text1').innerHTML = d['Country'] + "            -          " + d['Content Area'];
      document.getElementById('modal-text2').innerHTML = d['Narrative'];
    });

  let cells = rows
    .selectAll("td")
    .data(row => {
      return tableHeaders.map((d, i) => {
        return { i: d, value: row[d] };
      });
    })
    .enter()
    .append("td")
    .html(d => { return d.value; });
}

// Updates table with filters
function updateTable(selector, data, filters = {}) {
  let table = d3.select(selector);
  let tableHeaders = ["Country", "Thematic Area", "Thematic Area Category"];

  // Remove existing rows
  table.select('tbody').selectAll('tr').remove();

  // Filter function
  const shouldDisplayRow = (row) => {
    for (let [col, val] of Object.entries(filters)) {
      if (row[col] != val) {
        return false;
      }
    }

    return true;
  }

  // Update rows
  let rows = table.select('tbody')
    .selectAll("tr")
    .data(data.filter(shouldDisplayRow))
    .enter()
    .append("tr")
    .on("click", function (d) {
      modal.style.display = "block";
      document.getElementById('modal-text1').innerHTML = d['Country'] + "            -          " + d['Content Area'];
      document.getElementById('modal-text2').innerHTML = d['Narrative'];
    });

  let cells = rows
    .selectAll("td")
    .data(row => {
      return tableHeaders.map((d, i) => {
        return { i: d, value: row[d] };
      });
    })
    .enter()
    .append("td")
    .html(d => { return d.value; });
}

// ============================ MODAL ============================
let modal = document.getElementById('initiative-modal');
let closeModalBtn = document.querySelector('.modal__close-btn');

// Close modal when user clicks close button
closeModalBtn.onclick = () => {
  modal.style.display = "none";
}

// Close modal when user clicks outside of it
window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// ============================ UTILITIES ============================

// Gets the unique values for the given field of the given dataset
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

// Populates given dropdown with given option values
function populateDropdown(dropdown, options, getDisplayText) {
  options.forEach(option => {
    let el = document.createElement("option");
    el.text = getDisplayText ? getDisplayText(option) : option;
    el.value = option;

    dropdown.add(el);
  })
}

// Constructs data to use for a heatmap of the given category
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