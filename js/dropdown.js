// Modified from https://codepen.io/emmawedekind/pen/eXNppG

const SPACEBAR_KEY_CODE = [0, 32];
const ENTER_KEY_CODE = 13;
const ESCAPE_KEY_CODE = 27;

const dropdownSelectedNodes = document.querySelectorAll(
  ".dropdown__selected"
);
const listItems = document.querySelectorAll(
  ".dropdown__list-item"
);

dropdownSelectedNodes.forEach(item => {
  item.addEventListener("click", e =>
    toggleListVisibility(e)
  );
  item.addEventListener("keydown", e =>
    toggleListVisibility(e)
  );
})

listItems.forEach(item => {
  item.addEventListener("click", e => {
    setSelectedListItem(e);
    closeList(e);
  })
});

function setSelectedListItem(e) {
  const parentDropdown = e.target.closest(".dropdown");
  const dropdownSelectedNode = parentDropdown.querySelector('.dropdown__selected');

  let selectedTextToAppend = document.createTextNode(e.target.innerText);
  dropdownSelectedNode.innerHTML = null;
  dropdownSelectedNode.setAttribute("value", e.target.getAttribute("value"))
  dropdownSelectedNode.appendChild(selectedTextToAppend);
}

function closeList(e) {
  const dropdown = e.target.closest(".dropdown");
  const list = dropdown.querySelector(".dropdown__list");
  const listContainer = dropdown.querySelector(".dropdown__list-container");
  const dropdownArrow = dropdown.querySelector(".dropdown__arrow");

  list.classList.remove("open");
  dropdownArrow.classList.remove("expanded");
  listContainer.setAttribute("aria-expanded", false);
}

function toggleListVisibility(e) {
  const dropdown = e.target.closest(".dropdown");
  const list = dropdown.querySelector(".dropdown__list");
  const listContainer = dropdown.querySelector(".dropdown__list-container");
  const dropdownArrow = dropdown.querySelector(".dropdown__arrow");

  let openDropDown =
    SPACEBAR_KEY_CODE.includes(e.keyCode) || e.keyCode === ENTER_KEY_CODE;

  if (e.keyCode === ESCAPE_KEY_CODE) {
    closeList(e);
  }

  if (e.type === "click" || openDropDown) {
    list.classList.toggle("open");
    dropdownArrow.classList.toggle("expanded");
    listContainer.setAttribute(
      "aria-expanded",
      list.classList.contains("open")
    );
  }
}
