# 🗺 UNFPA Global Learning Map

## DS 4200 S20, Team UN2

### [Project Site](https://neu-ds-4200-s20.github.io/s-l-project-un2/) - documents the motivation behind our project, our design process, and includes a video demo

### [Visualization](https://neu-ds-4200-s20.github.io/s-l-project-un2/visualization.html) - the final visualization built with [d3](https://d3js.org/)

The UNFPA Global Learning Map is an interactive visualization that educates users on 2019 UNFPA initiatives by each member country. It was created by [Caitlin Wang](https://github.com/ctlnwng), [Drefnie R. Limprevil](https://github.com/drefnie), [Emily Colladay](https://github.com/ecolladay), and [Garret Kutzko](https://github.com/ktzktv) in partnership with [UNFPA](https://www.unfpa.org/).

## 🛠 Setup

Follow these steps to setup this project on your local machine:

1. Clone this repository: `git clone https://github.com/NEU-DS-4200-S20/s-l-project-un2.git`
2. `cd s-l-project-un2`
3. Start a simple python webserver. E.g., one of these commands:
   - `python -m http.server 8000`
   - `python3 -m http.server 8000`
   - `py -m http.server 8000`
4. Visit `http://localhost:8000`

## 📁 File Structure

```
.
├── data                      # CSV data files
├── favicons                  # Favicons for site
├── files                     # Project files such as the video demo
├── images                    # Images used
├── js                        # JavaScript files
├── index.html                # Home page/site entry point
├── visualization.html        # Standalone page for the visualization
├── style.css                 # CSS stylesheet
├── LICENSE                   # Source code license
└── README.md
```

### JavaScript Files

```
├── ...
├── js
|   ├── dropdown.js           # Logic for our custom dropdowns
|   ├── visualization.js      # Main code for visualization
├── ...
```
