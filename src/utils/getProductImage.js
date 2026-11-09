
const images = import.meta.glob("../assets/images/**/*", {
  eager: true,
  query: "?url",
  import: "default",
});

export function getProductImage(imagePath) {
  if (!imagePath) return null;

  // Get filename from database path
  const fileName = imagePath
    .split("/")
    .pop()
    .trim()
    .toLowerCase();

  // Find matching filename
  const matchedImage = Object.entries(images).find(([path]) => {
    const actualFileName = path
      .split("/")
      .pop()
      .toLowerCase();

    return actualFileName === fileName;
  });

  if (!matchedImage) {
    console.warn("Image not found:", imagePath);
    console.log("Available images:", Object.keys(images));

    return null;
  }

  return matchedImage[1];
}

