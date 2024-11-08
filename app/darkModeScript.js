// This script runs before the React app loads
(function () {
  function getInitialColorMode() {
    const persistedColorPreference = window.localStorage.getItem("color-mode");
    const hasPersistedPreference = typeof persistedColorPreference === "string";

    if (hasPersistedPreference) {
      return persistedColorPreference;
    }

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const hasMediaQueryPreference = typeof mql.matches === "boolean";

    if (hasMediaQueryPreference) {
      return mql.matches ? "dark" : "light";
    }

    return "light";
  }

  const colorMode = getInitialColorMode();
  document.documentElement.classList.toggle("dark", colorMode === "dark");
})();
