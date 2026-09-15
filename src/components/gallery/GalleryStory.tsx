import type { ContentImage, Gallery } from "@/lib/content/schema";
import { galleryImageMap, gallerySections, visibleImages } from "@/lib/content/selectors";
import { EditorialImage } from "@/components/public/EditorialImage";
import { Reveal } from "@/components/public/Reveal";

/** Reusable renderers for editorial gallery section types. */
function SectionRenderer({
  type,
  images,
  text,
  first,
}: {
  type: string;
  images: ContentImage[];
  text: string;
  first: boolean;
}) {
  switch (type) {
    case "hero":
      return images[0] ? (
        <EditorialImage
          image={images[0]}
          ratio="16 / 9"
          priority={first}
          sizes="100vw"
          className="w-full"
        />
      ) : null;

    case "full":
      return images[0] ? (
        <div className="shell">
          <EditorialImage image={images[0]} sizes="100vw" />
        </div>
      ) : null;

    case "pair":
      return (
        <div className="shell grid gap-4 md:grid-cols-2 md:gap-6">
          {images.slice(0, 2).map((image) => (
            <EditorialImage key={image.id} image={image} ratio="3 / 2" />
          ))}
        </div>
      );

    case "portrait-pair":
      return (
        <div className="shell grid gap-4 md:grid-cols-2 md:gap-6">
          {images.slice(0, 2).map((image) => (
            <EditorialImage key={image.id} image={image} ratio="4 / 5" />
          ))}
        </div>
      );

    case "asymmetric":
      return (
        <div className="shell grid gap-4 md:grid-cols-12 md:gap-6">
          {images[0] ? (
            <EditorialImage image={images[0]} ratio="4 / 5" className="md:col-span-7" />
          ) : null}
          <div className="grid gap-4 md:col-span-5 md:gap-6 md:pt-16">
            {images.slice(1, 3).map((image) => (
              <EditorialImage key={image.id} image={image} ratio="3 / 2" />
            ))}
          </div>
        </div>
      );

    case "image-text":
      return (
        <div className="shell grid items-center gap-8 md:grid-cols-12 md:gap-16">
          {images[0] ? (
            <EditorialImage image={images[0]} ratio="4 / 5" className="md:col-span-6" />
          ) : null}
          {text ? (
            <p className="body-lead md:col-span-5 md:col-start-8 md:text-lg">{text}</p>
          ) : null}
        </div>
      );

    case "whitespace":
      return text ? (
        <div className="shell py-6 md:py-16">
          <p className="display-md mx-auto max-w-3xl text-center">{text}</p>
        </div>
      ) : (
        <div className="py-10 md:py-24" />
      );

    default:
      return null;
  }
}

export function GalleryStory({ gallery }: { gallery: Gallery }) {
  const map = galleryImageMap(gallery);
  const sections = gallerySections(gallery);
  const hasImages = visibleImages(gallery).length > 0;

  if (!hasImages) {
    return (
      <div className="shell py-24">
        <p className="body-lead">This story has no photographs yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-16">
      {sections.map((section, index) => {
        const images = section.images
          .map((id) => map.get(id))
          .filter((image): image is ContentImage => Boolean(image) && image!.visible);
        if (!images.length && section.type !== "whitespace" && section.type !== "image-text") {
          return null;
        }
        return (
          <Reveal key={section.id} as="figure" delay={index === 0 ? 0 : 60}>
            <SectionRenderer
              type={section.type}
              images={images}
              text={section.text}
              first={index === 0}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
