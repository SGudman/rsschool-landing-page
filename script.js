const themeButton = document.querySelector("[data-theme-toggle]");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.documentElement.dataset.theme = "dark";
} else {
  document.documentElement.dataset.theme = "light";
}

function updateThemeButton() {
  const currentTheme = document.documentElement.dataset.theme;

  if (currentTheme === "dark") {
    themeButton.setAttribute("aria-pressed", "true");
    themeButton.setAttribute("aria-label", "Switch to light theme");
  } else {
    themeButton.setAttribute("aria-pressed", "false");
    themeButton.setAttribute("aria-label", "Switch to dark theme");
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme;
  let nextTheme;

  if (currentTheme === "dark") {
    nextTheme = "light";
  } else {
    nextTheme = "dark";
  }

  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
  updateThemeButton();
}

updateThemeButton();
themeButton.addEventListener("click", toggleTheme);
