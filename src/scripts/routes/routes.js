import RegisterPage from "../pages/auth/register/register-page";
import LoginPage from "../pages/auth/login/login-page";
import HomePage from "../pages/home/home-page";
import NewPage from "../pages/new/new-page";
import StoryDetailPage from "../pages/story-detail/story-detail-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";

import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";

export const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/new": () => checkAuthenticatedRoute(new NewPage()),
  "/stories/:id": () => checkAuthenticatedRoute(new StoryDetailPage()),
  "/bookmark": () => checkAuthenticatedRoute(new BookmarkPage()),
};

export const getPagenotFoundRoute = () => {
  return {
    render: () => {
      return `
        <div class="container">
          <div class="error-page">
            <h2>Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
            <a href="#/">Go to Home</a>
          </div>
        </div>
      `;
    },
    afterRender: () => {
    },
  };
};
