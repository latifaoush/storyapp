import { notifyStoryCreated } from "../../utils/notification-helper";

export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showNewFormMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory({ description, photo, latitude, longitude }) {
    this.#view.showSubmitLoadingButton();
    try {
      if (!description) {
        this.#view.storeFailed("Cerita harus diisi!");
        return;
      }

      if (!photo || photo.length === 0) {
        this.#view.storeFailed("Foto harus disertakan!");
        return;
      }

      let photoFile;
      if (photo[0] instanceof Blob && !(photo[0] instanceof File)) {
        photoFile = new File([photo[0]], `photo-${Date.now()}.jpg`, {
          type: photo[0].type || "image/jpeg",
        });
      } else {
        photoFile = photo[0];
      }

      const data = {
        description: description,
        photo: photoFile,
        latitude: latitude,
        longitude: longitude,
      };

      const response = await this.#model.storeNewStory(data);
      if (!response.ok) {
        console.error("postNewStory: response:", response);
        this.#view.storeFailed(response.message || "Gagal menyimpan cerita");
        return;
      }

      try {
        await notifyStoryCreated(description);
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
      }

      this.#view.storeSuccessfully(
        response.message || "Cerita berhasil disimpan"
      );
    } catch (error) {
      console.error("postNewStory: error:", error);
      this.#view.storeFailed(
        error.message || "Terjadi kesalahan saat menyimpan cerita"
      );
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
