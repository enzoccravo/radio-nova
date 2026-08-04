/**
 * Simple SPA Router for Radio Nova
 */
export class Router {
  constructor(routes) {
    this.routes = routes;
    this.currentRoute = null;

    window.addEventListener('popstate', () => this.resolve());

    // Intercept link clicks for SPA navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.getAttribute('href'));
      }
    });
  }

  navigate(path) {
    if (path === window.location.pathname) return;
    window.history.pushState(null, '', path);
    this.resolve();
  }

  resolve() {
    const path = window.location.pathname;

    // Try to match routes
    let match = null;
    let params = {};

    for (const route of this.routes) {
      const result = this.matchRoute(route.path, path);
      if (result) {
        match = route;
        params = result.params;
        break;
      }
    }

    // Fallback to home
    if (!match) {
      match = this.routes.find(r => r.path === '/') || this.routes[0];
    }

    this.currentRoute = match;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Render
    if (match.render) {
      match.render(params);
    }
  }

  matchRoute(pattern, path) {
    // Exact match
    if (pattern === path) {
      return { params: {} };
    }

    // Pattern matching (e.g., /noticia/:slug)
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return { params };
  }
}
