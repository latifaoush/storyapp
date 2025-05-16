import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from "../../templates";
import HomePresenter from "./home-presenter";
import * as StoryAppAPI from "../../data/api";
import Map from "../../utils/map";

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="stories-list__map__container">
          <div id="map" class="stories-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Cerita</h1>

        <div class="stories-list__container">
          <div id="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAppAPI,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  populateStoriesList(message, stories) {
    if (!stories || stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      // Add marker to map only if location exists and is valid
      if (this.#map && story.location) {
        try {
          const coordinate = [
            story.location.latitude,
            story.location.longitude,
          ];
          const markerOptions = { alt: story.name };
          const popupOptions = { content: story.name };
          this.#map.addMarker(coordinate, markerOptions, popupOptions);
        } catch (error) {
          console.error("Failed to add marker:", error, story);
        }
      }
      const locationObj = story.location
        ? {
            coordinates: `${story.location.latitude}, ${story.location.longitude}`,
          }
        : { coordinates: "No location data" };

      return accumulator.concat(
        generateStoryItemTemplate({
          ...story,
          location: locationObj,
          writer: story.writer ? story.writer.name : "",
        })
      );
    }, "");

    document.getElementById("stories-list").innerHTML = `
    <div class="stories-list">${html}</div>
  `;
  }

  populateStoriesListEmpty() {
    document.getElementById("stories-list").innerHTML =
      generateStoriesListEmptyTemplate();
  }

  populateStoriesListError(message) {
    document.getElementById("stories-list").innerHTML =
      generateStoriesListErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 10,
      locate: true,
    });
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showLoading() {
    document.getElementById("stories-list-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById("stories-list-loading-container").innerHTML = "";
  }
}
