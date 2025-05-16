// src\scripts\data\api.js
import { getAccessToken } from "../utils/auth";
import { BASE_URL } from "../config";

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  MY_USER_INFO: `${BASE_URL}/users/me`,

  // Stories
  STORIES_LIST: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  STORE_NEW_STORY: `${BASE_URL}/stories`,

  // Comments
  COMMENTS_LIST: (storyId) => `${BASE_URL}/stories/${storyId}/comments`,
  STORE_NEW_COMMENT: (storyId) => `${BASE_URL}/stories/${storyId}/comments`,

  // Story Comment
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  SEND_STORY_TO_ME: (storyId) => `${BASE_URL}/stories/${storyId}/notify-me`,
  SEND_STORY_TO_USER: (storyId) => `${BASE_URL}/stories/${storyId}/notify`,
  SEND_STORY_TO_ALL_USER: (storyId) =>
    `${BASE_URL}/stories/${storyId}/notify-all`,
  SEND_COMMENT_TO_STORY_OWNER: (storyId, commentId) =>
    `${BASE_URL}/stories/${storyId}/comments/${commentId}/notify`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getMyUserInfo() {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.MY_USER_INFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories(page = 1, size = 10, location = 0) {
  const accessToken = getAccessToken();

  const url = new URL(ENDPOINTS.STORIES_LIST);
  url.searchParams.append("page", page);
  url.searchParams.append("size", size);
  url.searchParams.append("location", location);

  const fetchResponse = await fetch(ENDPOINTS.STORIES_LIST, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  console.log("API Response:", json);

  const tranformedData = json.listStory
    ? json.listStory.map((story) => {
        const hasValidLocation =
          typeof story.lat === "number" && typeof story.lon === "number";

        return {
          ...story,
          location: hasValidLocation
            ? {
                latitude: story.lat,
                longitude: story.lon,
              }
            : null,
        };
      })
    : [];

  return {
    ...json,
    ok: fetchResponse.ok,
    data: tranformedData,
  };
}

export async function getStoryById(id) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  let transformedStory = null;
  if (json.story) {
    const hasValidLocation =
      typeof json.story.lat === "number" && typeof json.story.lon === "number";

    transformedStory = {
      ...json.story,
      location: hasValidLocation
        ? {
            latitude: json.story.lat,
            longitude: json.story.lon,
          }
        : null,
    };
  }

  return {
    ...json,
    ok: fetchResponse.ok,
    data: transformedStory,
  };
}

export async function storeNewStory({
  description,
  photo,
  latitude,
  longitude,
}) {
  const accessToken = getAccessToken();

  const formData = new FormData();

  formData.set("description", description);
  formData.set("photo", photo);
  if (latitude && longitude) {
    formData.set("lat", latitude);
    formData.set("lon", longitude);
  }

  const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_STORY, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function subscribePushNotification({
  endpoint,
  keys: { p256dh, auth },
}) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({
    endpoint,
  });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendStoryToAllUserViaNotification(storyId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.SEND_STORY_TO_ALL_USER(storyId), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function sendCommentToStoryOwnerViaNotification(
  storyId,
  commentId
) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(
    ENDPOINTS.SEND_COMMENT_TO_STORY_OWNER(storyId, commentId),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}




