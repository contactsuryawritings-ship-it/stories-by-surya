import { Btn, EmptyState, Field, SelectInput, TextArea } from "@/components/admin/ui";
import { moveItem } from "@/lib/admin/draft";
import {
  SECTION_LAYOUTS,
  type Gallery,
  type GallerySection,
  type GallerySectionType,
} from "@/lib/content/schema";
import { makeId } from "@/lib/images/optimize";
import { cn } from "@/lib/utils";

const layoutFor = (type: GallerySectionType) =>
  SECTION_LAYOUTS.find((layout) => layout.type === type) ?? SECTION_LAYOUTS[0]!;

/**
 * Curated editorial story builder: the photographer arranges predefined luxury
 * layouts and picks which photographs go in them. Typography, spacing and
 * responsive behaviour stay with the design system.
 */
export function StoryBuilder({
  gallery,
  onChange,
}: {
  gallery: Gallery;
  onChange: (recipe: (gallery: Gallery) => Gallery) => void;
}) {
  const sections = gallery.sections;
  const images = gallery.images;

  function setSections(next: (list: GallerySection[]) => GallerySection[]) {
    onChange((current) => ({ ...current, sections: next(current.sections) }));
  }

  function addSection(type: GallerySectionType) {
    setSections((list) => [...list, { id: makeId("sec"), type, images: [], text: "" }]);
  }

  function patch(id: string, changes: Partial<GallerySection>) {
    setSections((list) => list.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow opacity-55">Add a layout</span>
        {SECTION_LAYOUTS.map((layout) => (
          <Btn key={layout.type} onClick={() => addSection(layout.type)}>
            {layout.label}
          </Btn>
        ))}
      </div>

      {!images.length ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Add photographs on the Photographs tab first — layouts need images to hold.
        </p>
      ) : null}

      {sections.length ? (
        <ol className="mt-6 flex flex-col gap-4">
          {sections.map((section, index) => {
            const layout = layoutFor(section.type);
            return (
              <li key={section.id} className="border border-hairline bg-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="eyebrow opacity-40">{index + 1}</span>
                  <span className="min-w-44">
                    <SelectInput<GallerySectionType>
                      value={section.type}
                      onChange={(type) =>
                        patch(section.id, {
                          type,
                          images: section.images.slice(0, layoutFor(type).capacity),
                        })
                      }
                      options={SECTION_LAYOUTS.map((l) => ({ value: l.type, label: l.label }))}
                    />
                  </span>
                  <span className="ml-auto flex gap-1">
                    <Btn
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => setSections((list) => moveItem(list, index, index - 1))}
                    >
                      ↑
                    </Btn>
                    <Btn
                      variant="ghost"
                      disabled={index === sections.length - 1}
                      onClick={() => setSections((list) => moveItem(list, index, index + 1))}
                    >
                      ↓
                    </Btn>
                    <Btn
                      variant="danger"
                      onClick={() => setSections((list) => list.filter((s) => s.id !== section.id))}
                    >
                      Remove
                    </Btn>
                  </span>
                </div>

                {layout.capacity > 0 ? (
                  <div className="mt-4">
                    <p className="eyebrow opacity-55">
                      Photographs — {section.images.length} of {layout.capacity} chosen
                    </p>
                    {images.length ? (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {images.map((image) => {
                          const position = section.images.indexOf(image.id);
                          const chosen = position >= 0;
                          return (
                            <li key={image.id}>
                              <button
                                type="button"
                                aria-pressed={chosen}
                                onClick={() =>
                                  patch(section.id, {
                                    images: chosen
                                      ? section.images.filter((id) => id !== image.id)
                                      : section.images.length < layout.capacity
                                        ? [...section.images, image.id]
                                        : [...section.images.slice(1), image.id],
                                  })
                                }
                                className={cn(
                                  "relative block size-16 overflow-hidden border",
                                  chosen ? "border-foreground" : "border-hairline opacity-70",
                                )}
                              >
                                <img
                                  src={image.src}
                                  alt=""
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                                {chosen ? (
                                  <span className="eyebrow absolute bottom-0 right-0 bg-foreground px-1 text-background">
                                    {position + 1}
                                  </span>
                                ) : null}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                {layout.usesText ? (
                  <div className="mt-4">
                    <Field label="Words">
                      <TextArea
                        value={section.text}
                        rows={3}
                        onChange={(text) => patch(section.id, { text })}
                      />
                    </Field>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mt-6">
          <EmptyState>
            No layouts yet. Without a sequence the story falls back to an automatic editorial rhythm
            using every visible photograph.
          </EmptyState>
        </div>
      )}
    </div>
  );
}
