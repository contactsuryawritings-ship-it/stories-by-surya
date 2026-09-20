These JavaScript/Tailwind components are adapted from the React Bits source supplied in the homepage sections brief. The adjacent declarations define the subset of props used by the TypeScript adapters in `InteractiveSections.tsx`.

The adapters lazy-load each effect near the viewport, reserve its height, and provide image navigation when reduced motion is requested or WebGL fails. Top Picks uses the supplied ripple shader; Depth uses GSAP and CSS perspective; Morph and Circular use OGL.

Local adaptations include scoped pointer listeners, horizontal-only wheel navigation, touch and keyboard controls, context-loss recovery, cleanup, offscreen rendering pauses, and loading only nearby Morph textures. Keep these behaviors when updating the upstream effects.

Run `npm test` for allocation and legacy-content coverage, and `npm run test:browser` for desktop/mobile rendering, touch navigation, scroll stability, reduced motion, and WebGL recovery. Browser tests use Google Chrome and isolated test content; they never write to Firebase.
