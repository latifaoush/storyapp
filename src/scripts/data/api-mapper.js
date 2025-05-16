import Map from "../utils/map";

export async function storyMapper(story) {
  if (
    !story.location ||
    !story.location.latitude ||
    !story.location.longitude
  ) {
    const defaultLocation = {
      latitude: 0,
      longitude: 0,
      placeName: "Unknown location",
    };

    return {
      ...story,
      location: story.location
        ? { ...story.location, ...defaultLocation }
        : defaultLocation,
    };
  }
  return {
    ...story,
    location: {
      ...story.location,
      placeName: await Map.getPlaceNameByCoordinate(
        story.location.latitude,
        story.location.longitude
      ),
    },
  };
}
