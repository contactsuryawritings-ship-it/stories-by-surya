# Pixel Perfect Portfolio

clone https://github.com/contactsuryawritings-ship-it/pixel-perfect.git and 
Continue the existing Stories by Surya project from its current state. Do not rebuild, redesign, or replace working architecture.

First inspect the current implementation and preserve everything that already satisfies the original specification.

PRIORITY 1 — Restore a clean build

Before implementing any new feature:

1. Find and fix all current TypeScript/link/route errors.
2. Run the existing build/typecheck.
3. Resolve all errors introduced by the previous implementation.
4. Confirm the public application compiles successfully.
5. Do not suppress errors with any, @ts-ignore, unsafe casts, or by disabling type checking.

Do not proceed to feature expansion until the existing application has a clean compile.

⸻

PRIORITY 2 — Audit architecture against the original specification

Verify that:

* User-editable public content is not hardcoded in React components.
* data.json remains the single source of truth for editable website content.
* The JSON schema validates all mutations.
* Previous valid JSON is backed up before replacement.
* Firebase Storage is the intended persistence layer for portfolio images and the production data.json.
* Firebase Authentication is used for admin authentication.
* Firestore has NOT been introduced as a general database.

Important:

The original architecture intentionally does not use Firestore.

If the current enquiry implementation introduced Firestore, do not continue building around that assumption.

Identify it and refactor the enquiry persistence architecture so the project remains consistent with the original Firebase Auth + Firebase Storage + data.json architecture, or isolate the enquiry submission interface behind an adapter until an appropriate persistence mechanism is configured.

Do not fake successful enquiry submissions.

⸻

PRIORITY 3 — Do not require Firebase credentials yet

Do not block local development on missing Firebase credentials.

Firebase configuration must use environment variables and gracefully support a local/unconfigured development state.

Create or maintain:

.env.example

with placeholders for:

* Firebase API key
* Auth domain
* Project ID
* Storage bucket
* Messaging sender ID
* App ID
* Admin email if required by the chosen authorization architecture

Do not place real Firebase credentials in source files.

Do not invent credentials.

Continue implementing everything that can be implemented and tested without a live Firebase project.

⸻

COMPLETE THE ADMIN DASHBOARD

Finish the protected photographer dashboard.

Required areas:

Dashboard

Show useful content-derived information such as:

* Number of published galleries
* Number of draft galleries
* Number of portfolio images
* Number of films
* Recent content

Do not invent analytics that do not exist.

Galleries

Implement:

* Create gallery
* Edit gallery
* Delete gallery
* Publish/unpublish
* Category
* Slug
* Date/year
* Location
* Optional description
* Cover image
* Gallery ordering
* Preview

All mutations must update the central content model.

Images

Implement:

* Bulk upload
* Client-side resize/compression
* Per-file progress
* Upload failure state
* Multi-select
* Delete
* Hide/show
* Reorder
* Set cover
* Reuse existing image metadata where appropriate

Do not require captions.

Do not invent captions.

Editorial Story Builder

Allow the photographer to construct gallery presentation using predefined luxury editorial blocks.

Support at minimum:

* Hero
* Full width
* Pair
* Portrait pair
* Landscape pair
* Editorial/asymmetric composition
* Image + text

Do not build an unrestricted page builder.

The photographer selects curated layouts while the design system retains control of typography, spacing and responsive behavior.

Films

Implement management for:

* Instagram Reel URL
* YouTube URL
* Title
* Optional cover image
* Published state
* Ordering

Do not upload video files.

Homepage

Allow management of:

* Hero eyebrow
* Hero title
* CTA
* Featured stories
* Section ordering
* Section visibility
* About preview
* Contact CTA

Do NOT require manual Drift Wall image selection.

The Drift Wall continues automatically sourcing images from published portfolio content.

About

Allow editing all About page content represented in the schema.

Do not invent photographer biography.

Contact

Allow editing:

* Contact headings/copy
* Configured form fields
* Contact details
* Social links

Enquiries

Provide the dashboard UI for enquiry records only if a real persistence adapter exists.

Do not display fake enquiries.

SEO

Allow editing:

* Default title
* Title template
* Description
* Keywords
* OG image

And gallery-specific SEO where supported by the schema.

Settings

Expose appropriate site configuration.

Do NOT expose dangerous low-level Drift Wall parameters to the photographer unless they are clearly separated as advanced/developer settings.

⸻

COMPLETE PUBLIC PAGES

Finish:

* /about
* /films
* /contact

All content must come from the central content model.

Do not invent copy merely to make the page appear populated.

Gracefully handle empty states.

⸻

DRIFT WALL REGRESSION CHECK

Do not redesign the existing Drift Wall if it already satisfies the requirements.

Verify:

* All available published portfolio images are eligible.
* No manually hardcoded image list exists.
* 1 image repeats to fill the wall.
* 2 images repeat/distribute to fill the wall.
* Few images are distributed without obvious identical rows where practical.
* Many images use the available collection.
* No empty tiles.
* No exposed background corners.
* Overscan survives perspective/rotation.
* Desktop layout works.
* Tablet layout works.
* Mobile layout works.
* Reduced-motion works.
* Pointer parallax remains restrained.
* Image loading does not require every duplicated tile to independently download the same resource.

Do not replace Drift Wall with a carousel, masonry grid or static collage.

⸻

DATA.JSON REGRESSION CHECK

Audit the current React components for editable content accidentally hardcoded during the previous build.

Navigation labels, titles, descriptions, gallery content, film content, About copy, contact copy, social URLs, SEO values and footer content must originate from the content model.

Application logic and component design remain in code.

Do not confuse application UI labels such as “Save”, “Delete”, “Upload” with website content. Dashboard interface labels can remain part of the application.

⸻

DESIGN QUALITY

Preserve the existing luxury editorial direction.

Public site:

* Warm ivory
* Near-black
* Editorial serif
* Restrained sans-serif
* Large photography
* Sharp image edges
* Generous whitespace
* Minimal navigation
* Restrained motion

Do not introduce:

* SaaS cards
* excessive rounded corners
* glassmorphism
* gradients everywhere
* bright accent colors
* generic dashboard styling on the public website
* excessive animation

The admin dashboard may be more functional and information-dense.

⸻

RESPONSIVE QA

Test at representative widths for:

* Large desktop
* Laptop
* Tablet
* Mobile

Pay particular attention to:

* Drift Wall
* Navigation/menu
* Hero typography
* Editorial gallery layouts
* Image pairs
* Story pages
* Dashboard tables/grids
* Upload interface
* Story builder
* Forms

No horizontal overflow should exist at normal viewport sizes.

⸻

FINAL VERIFICATION

Before reporting completion:

1. Run typecheck.
2. Run build.
3. Run available tests.
4. Fix failures caused by this implementation.
5. Verify no real Firebase credentials were committed.
6. Verify .env.example exists.
7. Verify no accidental Firestore dependency exists unless explicitly justified and approved.
8. Verify editable public content is data-driven.
9. Verify empty states.
10. Verify public routes.
11. Verify dashboard routes.
12. Verify Drift Wall edge cases with 0, 1, 2 and many images.

Then provide a concise report containing:

* What was fixed
* What was completed
* Routes implemented
* Firebase integration points awaiting credentials
* Tests/build/typecheck results
* Any remaining blockers

Do not claim Firebase functionality was tested against production until actual Firebase credentials have been supplied and live integration has been verified.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e5257579-7705-4cc2-b50c-1e8570c1b3ea).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
