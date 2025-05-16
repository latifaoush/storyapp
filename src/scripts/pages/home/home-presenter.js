export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showStoriesListMap() {
    this.#view.showMapLoading();
    try {
      const response = await this.#model.getAllStories(1, 50, 1);

      if (!response.ok) {
        console.error("showStorieslistMap: response:", response);
        return;
      }

      await this.#view.initialMap(response.data);
      
    } catch (error) {
      console.error("showStoriesListMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialGalleryAndMap() {
    this.#view.showLoading();
    try {
      this.showStoriesListMap();

      const response = await this.#model.getAllStories();

      if (!response.ok) {
        console.error("initialGalleryAndMap: response:", response);
        this.#view.populateStoriesListError(response.message);
        return;
      }

      this.#view.populateStoriesList(response.message, response.data);
    } catch (error) {
      console.error("initialGalleryAndMap: error:", error);
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
