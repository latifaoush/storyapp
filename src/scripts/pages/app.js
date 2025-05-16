// src\scripts\pages\app.js
import { getActiveRoute } from "../routes/url-parser";
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateUnsubscribeButtonTemplate,
} from "../templates";
import {
  setupSkipToContent,
  transitionHelper,
  isServiceWorkerAvailable,
  registerServiceWorker,
} from "../utils";
import { getAccessToken, getLogout } from "../utils/auth";
import { routes, getPagenotFoundRoute } from "../routes/routes";

import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();

    registerServiceWorker();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#drawerNavigation.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(
        event.target
      );
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#drawerNavigation.classList.remove("open");
      }

      this.#drawerNavigation.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove("open");
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain =
      this.#drawerNavigation.children.namedItem("navlist-main");
    const navList = this.#drawerNavigation.children.namedItem("navlist");

    // User not log in
    if (!isLogin) {
      navListMain.innerHTML = "";
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (confirm("Apakah Anda yakin ingin keluar?")) {
        getLogout();

        // Redirect
        location.hash = "/login";
      }
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById(
      "push-notification-tools"
    );
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document
        .getElementById("unsubscribe-button")
        .addEventListener("click", () => {
          unsubscribe().finally(() => {
            this.#setupPushNotification();
          });
        });

      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document
      .getElementById("subscribe-button")
      .addEventListener("click", () => {
        subscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
  }

  async renderPage() {
    try {
      const url = getActiveRoute();
      const route = routes[url];

      // If route is not found, display the 404 page
      if (!route) {
        console.log(`Route not found for URL: ${url}`);
        const notFoundPage = getPagenotFoundRoute();

        const transition = transitionHelper({
          updateDOM: async () => {
            this.#content.innerHTML = await notFoundPage.render();
            if (typeof notFoundPage.afterRender === "function") {
              notFoundPage.afterRender();
            }
          },
        });

        transition.ready.catch(console.error);
        transition.updateCallbackDone.then(() => {
          scrollTo({ top: 0, behavior: "instant" });
          this.#setupNavigationList();

          if (isServiceWorkerAvailable()) {
            this.#setupPushNotification();
          }
        });

        return;
      }

      // Get page instance
      const page = route();

      if (!page || typeof page.render !== "function") {
        console.error("Invalid page object returned from route:", page);
        const notFoundPage = getPagenotFoundRoute();

        const transition = transitionHelper({
          updateDOM: async () => {
            this.#content.innerHTML = await notFoundPage.render();
            if (typeof notFoundPage.afterRender === "function") {
              notFoundPage.afterRender();
            }
          },
        });

        transition.ready.catch(console.error);
        transition.updateCallbackDone.then(() => {
          scrollTo({ top: 0, behavior: "instant" });
          this.#setupNavigationList();

          if (isServiceWorkerAvailable()) {
            this.#setupPushNotification();
          }
        });

        return;
      }

      // This is where the missing variable definition was
      const transition = transitionHelper({
        updateDOM: async () => {
          this.#content.innerHTML = await page.render();
          if (typeof page.afterRender === "function") {
            page.afterRender();
          }
        },
      });

      transition.ready.catch(console.error);
      transition.updateCallbackDone.then(() => {
        scrollTo({ top: 0, behavior: "instant" });
        this.#setupNavigationList();

        if (isServiceWorkerAvailable()) {
          this.#setupPushNotification();
        }
      });
    } catch (error) {
      console.error("Render page error:", error);

      // Show error page when an exception occurs
      const notFoundPage = getPagenotFoundRoute();
      this.#content.innerHTML = await notFoundPage.render();
      if (typeof notFoundPage.afterRender === "function") {
        notFoundPage.afterRender();
      }
    }
  }
}
