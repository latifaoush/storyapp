import {
  generateLoaderAbsoluteTemplate,
  generateRemoveStoryButtonTemplate,
  generateStoryDetailErrorTemplate,
  generateStoryDetailTemplate,
  generateSaveStoryButtonTemplate,
} from "../../templates";
import { createCarousel } from "../../utils";
import StoryDetailPresenter from "./story-detail-presenter";
import { parseActivePathname } from "../../routes/url-parser";
import Map from "../../utils/map";
import * as StoryAppAPI from "../../data/api";
import Database from "../../data/database";

export default class StoryDetailPage {
  #presenter = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="story-detail__container">
          <div id="story-detail" class="story-detail"></div>
          <div id="story-detail-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: StoryAppAPI,
      dbModel: Database,
    });

    this.#presenter.showStoryDetail();
  }

  async populateStoryDetailAndInitialMap(message, story) {
    document.getElementById("story-detail").innerHTML =
      generateStoryDetailTemplate({
        name: story.name,
        description: story.description,
        photoUrl: story.photoUrl,
        location: story.location || { latitude: null, longitude: null },
        latitudeLocation: story.location ? story.location.latitude : null,
        longitudeLocation: story.location ? story.location.longitude : null,
        createdAt: story.createdAt,
      });

    // Carousel images
    createCarousel(document.getElementById("images"));

    // Map
    await this.#presenter.showStoryDetailMap();
    if (this.#map) {
      const storyCoordinate = [
        story.location.latitude,
        story.location.longitude,
      ];
      const markerOptions = { alt: story.name };
      const popupOptions = { content: story.name };

      this.#map.changeCamera(storyCoordinate);
      this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
    }

    // Actions buttons
    this.#presenter.showSaveButton();
    this.addNotifyMeEventListener();
  }

  populateStoryDetailError(message) {
    document.getElementById("story-detail").innerHTML =
      generateStoryDetailErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build("#map", {
      zoom: 15,
    });
  }

  renderSaveButton() {
    document.getElementById("save-actions-container").innerHTML =
      generateSaveStoryButtonTemplate();

    document
      .getElementById("story-detail-save")
      .addEventListener("click", async () => {
        await this.#presenter.saveStory();
        await this.#presenter.showSaveButton();
      });
  }

  saveToBookmarkSuccessfully(message) {
    console.log(message);
  }

  saveToBookmarkFailed(message) {
    alert(message);
  }

  renderRemoveButton() {
    document.getElementById("save-actions-container").innerHTML =
      generateRemoveStoryButtonTemplate();

    document
      .getElementById("story-detail-remove")
      .addEventListener("click", async () => {
        await this.#presenter.removeStory();
        await this.#presenter.showSaveButton();
      });
  }

  removeFromBookmarkSuccessfully(message) {
    console.log(message);
  }
  removeFromBookmarkFailed(message) {
    alert(message);
  }

  addNotifyMeEventListener() {
    document
      .getElementById("story-detail-notify-me")
      .addEventListener("click", () => {
        alert("Fitur notifikasi cerita akan segera hadir!");
      });
  }

  showStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideStoryDetailLoading() {
    document.getElementById("story-detail-loading-container").innerHTML = "";
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showCommentsLoading() {
    document.getElementById("comments-list-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideCommentsLoading() {
    document.getElementById("comments-list-loading-container").innerHTML = "";
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled>
        <i class="fas fa-spinner loader-button"></i> Tanggapi
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Tanggapi</button>
    `;
  }
}
