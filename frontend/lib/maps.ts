export const loadGoogleMaps = async () => {
  const loader = new google.maps.plugins.loader.Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    version: "weekly",
  });

  return loader.importLibrary("maps");
};
