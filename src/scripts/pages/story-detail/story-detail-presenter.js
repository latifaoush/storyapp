import { storyMapper } from "../../data/api-mapper";

export default class StoryDetailPresenter {
  #storyId;
  #view;
  #apiModel;
  #dbModel;

  constructor(storyId, { view, apiModel, dbModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async showStoryDetailMap() {
    this.#view.showMapLoading();

    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showStoryDetailMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showStoryDetailLoading();

    try {
      const response = await this.#apiModel.getStoryById(this.#storyId);

      if (!response.ok) {
        console.error("showStoryDetailAndMap: response:", response);
        this.#view.populateStoryDetailError(response.message);
        return;
      }

      const story = await storyMapper(response.data);
      console.log(story);

      this.#view.populateStoryDetailAndInitialMap(response.message, story);
    } catch (error) {
      console.error("showStoryDetailAndMap: error:", error);
      this.#view.populateStoryDetailError(error.message);
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }

  async saveStory() {
    try {
      const response = await this.#apiModel.getStoryById(this.#storyId);

      if (!response.ok) {
        throw new Error(response.message || "Failed to fetch story data");
      }

      // Make sure the story object has an id property before saving
      const storyToSave = response.data;
      if (!storyToSave.id) {
        storyToSave.id = this.#storyId;
      }

      await this.#dbModel.putStory(storyToSave);

      this.#view.saveToBookmarkSuccessfully("Success to save to bookmark");
    } catch (error) {
      console.error("saveStory: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStory(this.#storyId);
      
      this.#view.removeFromBookmarkSuccessfully(
        "Success to remove from bookmark"
      );
    } catch (error) {
      console.error("removeStory: error:", error);
      this.#view.removeFromBookmarkFailed(error.message);
    }
  }

  async showSaveButton() {
    if (await this.#isStorySaved()) {
      this.#view.renderRemoveButton();
      return;
    }

    this.#view.renderSaveButton();
  }

  async #isStorySaved() {
    return !!(await this.#dbModel.getStoryById(this.#storyId));
  }
}
