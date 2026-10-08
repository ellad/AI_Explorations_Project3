export const ROUTES = Object.freeze({
  home: "#/",
  about: "#/about",
});

export function routeFromHash(hash = "") {
  return hash === ROUTES.about ? "about" : "home";
}

export function renderRoute(route, root = document) {
  const activeRoute = route === "about" ? "about" : "home";

  for (const screen of root.querySelectorAll("[data-route]")) {
    screen.hidden = screen.dataset.route !== activeRoute;
  }

  const aboutLink = root.querySelector('[aria-label="About Cloud Closet"]');
  if (aboutLink) aboutLink.hidden = activeRoute === "about";

  document.title = activeRoute === "about" ? "About | Cloud Closet" : "Cloud Closet";
  return activeRoute;
}
