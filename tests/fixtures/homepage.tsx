import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "../../src/router";
import { parseContent } from "../../src/lib/content/schema";
import "../../src/styles.css";

import { photoDimensions } from "./photo-dimensions";

const router = getRouter();
const count = Number(new URLSearchParams(location.search).get("photos")) || 85;
const photos = Array.from({ length: count }, (_, index) => ({
  id: `photo-${index}`,
  src: `/__photos/${index}.svg`,
  alt: `Photograph ${index + 1}`,
  // Include legacy uploads with no stored dimensions.
  width: index % 4 === 1 ? null : photoDimensions(index).width,
  height: index % 4 === 1 ? null : photoDimensions(index).height,
  order: index,
}));
router.options.context!.queryClient.setQueryData(["site-content"], {
  source: "remote",
  content: parseContent({
    photos,
    brand: {},
    hero: { title: "Stories by Surya" },
    homepage: { topPickImageIds: photos.slice(0, 10).map((photo) => photo.id) },
    about: {},
    contact: {},
    seo: {},
    footer: {},
  }),
});
createRoot(document).render(<RouterProvider router={router} />);
