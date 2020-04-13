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

  // Import data
  let dataset;
  const countryDropdown = document.querySelector('#country-dropdown');
  const categoryDropdown = document.querySelector('#category-dropdown');

  d3.csv('data/country-programme-results-2019.csv').then(data => {
    dataset = data

    // Populate Country dropdown
    const countries = getDistinctValuesForField(dataset, 'Country');
    populateDropdown(countryDropdown, countries.sort());

    // Populate Category dropdown
    const categories = getDistinctValuesForField(dataset, 'Thematic Area Category');
    populateDropdown(categoryDropdown, categories.sort(), (cat) => categoryNames[cat] || cat);

    drawMap();

    // Create table
    table("#table", dataset);
  });

  // Initialize choropleth map https://d3-geomap.github.io/map/choropleth/world/ 
  let map = d3.choropleth()
    .geofile('lib/d3-geomap/topojson/world/countries.json')
    .column('Initiative Count') // column to represent on heatmap
    .format(d => d)
    .unitId('name'); // column that identifies each country (must match the property name in countries.json) 

  // Link dropdowns to map
  let dispatch = d3.dispatch("change-category", "change-country", "zooming-map", "country-selected");
  categoryDropdown.addEventListener("change", () => { dispatch.call("change-category") });
  countryDropdown.addEventListener("change", (e) => { dispatch.call("change-country", {}, e.target.value) })
  dispatch.on("change-category", drawMap);
  dispatch.on("change-country", dropdownToMap);
  dispatch.on("zooming-map", mapToDropdown);
  dispatch.on("country-selected", countrySelected);

//meeting point after the dropdown and map agree
function countrySelected(country) {
  path = document.querySelector(".unit.unit-" + country)
  path.getAttribute("class")
  g = document.querySelector("g")
  g.appendChild(path)
  //TODO pop up modal with data for selected country
}

//the map was just clicked, so change the dropdown to reflect this
function mapToDropdown(country) {
  countryDropdown.value = country 
  dispatch.call("country-selected", {}, country) 
}

//the dropdown was just changed, so change the map to reflect this
function dropdownToMap(countryName) {
  path = document.querySelector(".unit.unit-" + countryName)
  title = path.querySelector("title")
  path.dispatchEvent(new Event("click"))
}
//take whatever function is at map.clicked and put zoomMap there instead
map.clicked = zoomMap

  function zoomMap(d) {

  //tell dispatch that the map was clicked
  dispatch.call("zooming-map", {}, d.properties.name)  

  //this code is the body of the function that was at map.clicked
  //BEFORE we changed it, so it still does the zooming like before

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
      const category = categoryDropdown[categoryDropdown.selectedIndex].value;
      const categoryData = getDataForCategory(dataset, category);

      map.colors(categoryColors[category] || d3.schemeBlues[9]);

      // Draw map
      d3.select('#map').select('svg').remove();
      map.draw(d3.select("#map").datum(categoryData));
    }
  }
})());

/**
 * Populates given dropdown with given option values.
 * 
 * @param {HTMLElement} dropdown       HTML dropdown element
 * @param {array}       options        Values to populate dropdown options with
 * @param {Function}    getDisplayText Optional function to get option display text
 */
function populateDropdown(dropdown, options, getDisplayText) {
  options.forEach(option => {
    let el = document.createElement("option");
    el.text = getDisplayText ? getDisplayText(option) : option;
    el.value = option;

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

// Modal creation
let modal = document.getElementById('initiative-modal');
let closeModalBtn = document.querySelector('.modal__close-btn');
let modalBody = document.getElementById('modal_body');

// Close the modal by button or outside of modal option

closeModalBtn.onclick = () => {
  modal.style.display = "none";
}

window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};



// Creates table
function table(selector, data) {
  let ourBrush = null,
    selectableElements = d3.select(null),
    dispatcher;

  function chart(selector, data) {
    let table = d3.select(selector)
      .append("table")
      .classed("my-table", true)

    // Filters the dataset to only get certain columns
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
      .on("mouseover", function (d) {
        d3.select(this)
          .style("background-color", "#bcc0c0");
      })
      .on("mouseout", function (d) {
        d3.select(this)
          .style("background-color", "transparent");
      })
      .on("click", function (d) {
        modal.style.display = "block";
        document.getElementById('modal-text1').innerHTML=d['Country']+"            -          "+d['Content Area'];
        document.getElementById('modal-text2').innerHTML=d['Narrative'];
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
  };

  return chart(selector, data);
}
