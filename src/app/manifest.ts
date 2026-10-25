import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Unser Kochbuch",
    short_name: "Kochbuch",
    description: "Die Rezepte von Benny und Lisa.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f0",
    theme_color: "#fbf7f0",
    icons: [
      ...(process.env.FAVICON_URL ? [{ src: process.env.FAVICON_URL, sizes: "512x512", type: "image/png" }] : []),
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
