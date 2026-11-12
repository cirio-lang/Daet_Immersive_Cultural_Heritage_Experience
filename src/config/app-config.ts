import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Daet Heritage",
  version: packageJson.version,
  copyright: `© ${currentYear}, Daet Immersive Cultural Heritage Experience.`,
  meta: {
    title: "Daet Heritage - Immersive Cultural Heritage Experience",
    description:
      "Explore and experience the rich historical, religious, architectural, and cultural heritage of Daet, Camarines Norte through 360° virtual tours, interactive archives, and on-site QR code discovery.",
  },
};
