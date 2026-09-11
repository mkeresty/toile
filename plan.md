# Illustrated Interface --- Master Product & Build Brief

> **Use this document as the authoritative product brief.** The attached
> reference images define the visual quality and art direction. Build
> the project from start to finish, making reasonable decisions
> autonomously where this brief leaves room for interpretation.

## 1. Vision

Build a new open-source React UI component library with the installation
and ownership model of **shadcn/ui**, but with a radically different
visual identity and interaction language.

The central thesis is:

> **Don't decorate the interface with illustrations. Make the interface
> part of the illustration.**

This should feel as though a world-class editorial design studio,
illustrator, motion designer, product designer, and frontend engineer
collaborated on an interactive component system.

The visual language should combine highly detailed
hand-illustrated/engraved artwork, sophisticated typography, flat
print-like color, generous negative space, and restrained motion.
References include vintage editorial illustration, architectural
engravings, botanical drawings, scientific plates, old books and
magazines, Mediterranean landscapes, classical objects, and printmaking
--- interpreted as a contemporary web design system, not a retro-themed
website.

The illustrations are a **first-class part of the product**, not
background decoration.

The project consists of two closely related products:

1.  **The component library** --- installable, reusable components,
    motion primitives, illustration primitives, and scene primitives.
2.  **The showcase/documentation site** --- an exceptionally
    art-directed interactive experience built primarily from those same
    installable primitives.

The showcase should prove what the system can do at its absolute limit
without forcing every ordinary application to use giant illustrations.

------------------------------------------------------------------------

## 2. Product Structure

Design the library in three conceptual tiers.

### Tier 1 --- Core Editorial Components

Production-quality replacements for common shadcn-style primitives:

-   Button
-   Input
-   Textarea
-   Checkbox
-   Radio Group
-   Switch
-   Select
-   Combobox
-   Card
-   Dialog
-   Sheet
-   Popover
-   Tooltip
-   Tabs
-   Accordion
-   Dropdown Menu
-   Command
-   Table
-   Badge
-   Alert
-   Toast/Sonner-style notification
-   Form primitives
-   Navigation primitives

These should be beautiful and recognizable as belonging to this library
even without illustrations.

They must remain practical for normal product interfaces.

### Tier 2 --- Illustrated Components

Installable components where illustration and interaction become one
object.

Examples:

-   `WindowDialog` --- an architectural window/shutters physically open
    to reveal a real Dialog.
-   `BranchSelect` --- a Select visually integrated with a botanical
    branch/tag.
-   `CelestialToggle` --- a Toggle alters an astronomical illustration.
-   `ArchTabs` --- tabs become part of architectural arches.
-   `CabinetAccordion` --- accordion sections behave like illustrated
    drawers.
-   `InstrumentSlider` --- a Slider is integrated into a
    scientific/astronomical instrument.
-   `BotanicalButton` --- a button is integrated into a branch, with
    nearby leaves/birds reacting to hover/focus.
-   Form states that cause nearby illustration details to change.

Do not treat these examples as mandatory APIs. Improve them where
necessary.

### Tier 3 --- Scenes

Scenes compose artwork, HTML components, depth, animation, and
interaction.

Conceptually:

``` tsx
<Scene>
  <Scene.Layer depth={0.1}>
    <Mountains />
  </Scene.Layer>

  <Scene.Layer depth={0.3}>
    <Village />
  </Scene.Layer>

  <Scene.Layer depth={0.6}>
    <Trees motion="wind" />
  </Scene.Layer>

  <Scene.Anchor target="villa-window">
    <WindowDialog />
  </Scene.Anchor>

  <Scene.Layer depth={1.2}>
    <ForegroundVines />
  </Scene.Layer>
</Scene>
```

Do not blindly implement this exact API. Design the best architecture
first.

The showcase website should effectively be the library's ultimate Scene.

------------------------------------------------------------------------

## 3. Core Interaction Principle

UI and illustration must feel physically related.

Do **not** simply place conventional cards on top of decorative SVG
backgrounds.

Examples of the desired relationship:

-   A window in a building is literally the Dialog trigger.
-   Opening the Dialog causes SVG shutters to open.
-   A branch bends subtly when its attached Button is hovered.
-   Selecting an option changes something in the surrounding drawing.
-   A slider moves a mechanism inside an illustrated instrument.
-   A foreground plant overlaps a real HTML card.
-   An SVG path grows toward a component as it enters the viewport.
-   Expanding an accordion changes the composition around it.
-   Form validation causes a flower, annotation, symbol, or nearby
    linework to react.

Component state should be able to control illustration state, and
illustration interactions should be able to control real components.

------------------------------------------------------------------------

## 4. Technical Philosophy

The actual interface must remain semantic HTML/React.

**Do not put the entire interface inside SVG merely to achieve the
aesthetic.**

Preserve:

-   semantic HTML
-   keyboard navigation
-   screen-reader behavior
-   focus management
-   Radix behavior where appropriate
-   browser-native input behavior
-   accessibility
-   responsive layout

Use a layered architecture:

1.  SVG/vector artwork layers
2.  real HTML interaction layer
3.  optional foreground SVG layers/masks above HTML
4.  motion/orchestration layer

The result may visually look like one illustration while technically
remaining a properly structured web interface.

------------------------------------------------------------------------

## 5. Technology Direction

Use modern, stable technologies appropriate for the current ecosystem.

Preferred foundation:

-   React
-   TypeScript
-   Next.js for documentation/showcase
-   Tailwind CSS
-   Radix primitives where appropriate
-   shadcn registry format/system where practical
-   CSS variables/design tokens
-   SVG for vector artwork
-   CSS animations and Web Animations API for cheap ambient animation
-   a mature React motion library where it materially simplifies
    state/scroll/timeline orchestration

Do not add large dependencies without clear value.

Research current shadcn registry capabilities before finalizing
distribution architecture rather than relying on assumptions.

------------------------------------------------------------------------

## 6. Distribution & Developer Experience

The installation philosophy should resemble shadcn:

``` bash
npx <library> add button
npx <library> add draw-in
npx <library> add window-dialog
npx <library> add mediterranean-scene
```

Users own the installed source code.

An illustrative registry item may include multiple assets:

``` text
component.tsx
artwork/
  villa.svg
  vines.svg
motion/
  wind.ts
  shutters.ts
styles/
  tokens.css
```

Design registry dependencies carefully so installing a Button does not
pull in an entire scene engine.

Core components, motion primitives, artwork, illustrated components, and
scenes should be independently composable.

------------------------------------------------------------------------

## 7. Art Direction

The supplied images are the visual quality benchmark.

Extract their underlying principles rather than literally copying their
artwork.

### Overall Character

The project should feel:

-   authored
-   editorial
-   cultured
-   tactile
-   quiet
-   sophisticated
-   artistic
-   slightly imperfect
-   print-inspired
-   contemporary despite historical influences

It should **not** feel like a SaaS template with beige colors.

### Illustration Language

Primary visual influences:

-   editorial engraving
-   etching
-   botanical plates
-   architectural sketches
-   scientific illustration
-   vintage book illustration
-   printmaking
-   Mediterranean/classical scenery

Rendering techniques may include:

-   fine ink contours
-   crosshatching
-   stippling
-   engraved textures
-   selective solid ink areas
-   imperfect organic contours
-   restrained flat fills
-   varying line density

### Line Hierarchy

Use a deliberate hierarchy:

-   primary structural contours --- strongest
-   secondary contours --- medium
-   texture/crosshatching --- fine
-   distant scenery --- lighter/lower density

Detail and contrast should generally decrease with visual distance.

### Palette

Prefer a restrained print palette:

-   warm paper/background
-   primary dark ink
-   faded/secondary ink
-   optional single accent
-   occasional contextual secondary flat color

Build this from semantic tokens rather than hard-coded values.

### Avoid

Do not drift into:

-   generic corporate vector illustration
-   generic SaaS landing pages
-   giant rounded cards everywhere
-   excessive pills
-   glassmorphism
-   arbitrary gradients
-   neon tech aesthetics
-   3D clay renders
-   stock iconography
-   generic AI fantasy artwork
-   emoji-like illustration
-   cartoonish animation
-   random blobs/geometric decorations
-   Lucide icons as the dominant visual language
-   excessive drop shadows
-   gratuitous animation

If the site could plausibly be mistaken for a normal component library
with a vintage color theme, the art direction has failed.

------------------------------------------------------------------------

## 8. Illustration Worlds

Develop several compatible visual worlds using the same underlying
artistic grammar:

1.  **Botanical** --- trees, flowers, vines, grass, insects, branches.
2.  **Architectural** --- villas, windows, arches, columns, stairs,
    cabinets, facades.
3.  **Mediterranean / Landscape** --- mountains, coastlines, water,
    cliffs, clouds, villages.
4.  **Scientific / Astronomical** --- diagrams, instruments,
    constellations, mechanisms.
5.  **Literary / Objects** --- books, letters, lamps, pottery, desks,
    statues.
6.  **Classical / Mythological** --- optional where tasteful.

These should feel like the same illustrator created them.

Do not create unrelated "themes" that fragment the brand.

------------------------------------------------------------------------

## 9. Artwork Architecture & Pipeline

One of the hardest problems is maintaining extraordinary illustration
quality while keeping artwork reusable, customizable, performant, and
animatable.

Do not solve this by shipping enormous opaque SVG blobs.

Design an artwork pipeline.

Conceptually:

``` text
reference/art direction
        ↓
original illustration
        ↓
vector construction/vectorization
        ↓
semantic decomposition
        ↓
optimization
        ↓
animation metadata
        ↓
scene integration
```

Artwork intended for interaction should be decomposed semantically.

Example:

``` text
villa
├── masonry
├── shutters-left
├── shutters-right
├── window
├── vines
├── shadows
└── foreground-leaves

tree
├── trunk
├── limb-primary
├── branches-near
├── branches-far
├── leaves-near
└── leaves-far
```

Evaluate the best combination of:

-   raw SVG
-   React SVG components
-   SVG symbols/sprites
-   reusable vector primitives
-   masks
-   clip paths
-   filters where safe
-   procedural SVG where appropriate
-   generated paths
-   external optimized SVG assets

Do not choose one technique dogmatically.

### Critical Requirement

Artwork must be designed **for animation and interaction from the
beginning**.

A flattened `hero.svg` containing thousands of anonymous paths is not an
acceptable foundation for interactive scenes.

### Reusability

Explore ways to make artwork customizable without making every site look
identical:

-   semantic color tokens
-   interchangeable foreground/background elements
-   composable illustration primitives
-   optional texture/detail levels
-   scene variants
-   swappable motifs
-   reusable environmental elements
-   transforms/cropping/composition
-   procedural variation where it maintains artistic quality

------------------------------------------------------------------------

## 10. Art-Direction Tokens

Go beyond normal UI color tokens.

Explore semantic tokens such as:

``` css
--paper:
--paper-muted:
--ink-primary:
--ink-secondary:
--ink-faded:
--accent:

--illustration-stroke-primary:
--illustration-stroke-detail:
--illustration-detail-opacity:

--motion-ambient:
--motion-wind:
--motion-parallax:
--motion-interaction:

--scene-depth-far:
--scene-depth-mid:
--scene-depth-near:
```

Where useful, expose high-level scene configuration conceptually like:

``` tsx
<Scene
  world="mediterranean"
  motion="subtle"
  detail="engraved"
/>
```

Again, design the API rather than copying this example literally.

------------------------------------------------------------------------

## 11. Typography

Typography is a major part of the visual identity.

Establish a deliberate system for:

-   display serif
-   body serif and/or complementary sans
-   UI sans where appropriate
-   monospace for code
-   editorial captions
-   labels
-   small caps
-   metadata
-   pull quotes
-   oversized display typography

Define:

-   scale
-   line height
-   measure
-   tracking
-   weight
-   responsive behavior
-   hierarchy

Avoid typography that merely imitates a newspaper. It should feel
editorial but modern and usable.

Typography and illustration should appear art-directed together.

------------------------------------------------------------------------

## 12. Motion Philosophy

Motion should make the illustrations feel **alive**, not animated for
animation's sake.

The default impression should almost be static. The viewer gradually
notices subtle movement.

Ambient movement may include:

-   trees gently moving in wind
-   smaller branches moving more than trunks
-   leaves responding with different timing
-   grass/vines shifting subtly
-   clouds drifting almost imperceptibly
-   water slowly rippling
-   hanging signs/tags moving slightly
-   birds occasionally crossing the scene
-   birds hopping between branches
-   subtle shadow movement
-   restrained texture/stipple changes

Architecture should remain mostly still.

Nothing should bounce simply because it can.

### Wind Hierarchy

Avoid rotating entire trees as one rigid object.

Conceptual hierarchy:

``` text
trunk        almost static
large limb   tiny motion
branch       small motion
twig         slightly greater motion
leaves       subtle independent motion
```

Adjacent elements should not move in perfect synchronization.

Use slightly mismatched timing/duration so the scene feels organic.

### Birds

Bird movement should feel event-based rather than like an obvious
repeating three-second GIF.

Use occasional, purposeful motion.

### UI Motion

UI motion should primarily communicate:

-   causality
-   hierarchy
-   state
-   relationship with surrounding artwork

Hovering a component can cause nearby illustration to respond, but
reactions should remain restrained.

------------------------------------------------------------------------

## 13. First-Load "Drawn Into Existence" Sequence

A signature part of the visual identity is the initial page load.

The experience should appear as if an illustrator is constructing the
page in front of the visitor.

This applies to **both artwork and real components**.

### SVG Artwork

Use techniques such as:

-   `stroke-dasharray`
-   `stroke-dashoffset`
-   `pathLength`
-   masks
-   clip paths
-   staggered groups

Build the image intentionally:

1.  important structural contours
2.  major secondary forms
3.  smaller detail
4.  crosshatching/stippling/texture
5.  restrained fills
6.  final accents

Do **not** individually animate thousands of tiny texture paths.

Dense texture should generally be revealed through masks/groups.

### HTML Components

Do not convert semantic HTML components into SVG to create the effect.

Develop a reusable Draw-In system.

Conceptually a component might appear:

``` text
corner begins
→ border traces around surface
→ surface is revealed
→ illustration connects to component
→ title appears
→ body copy appears
→ control outline traces
→ label appears
→ component becomes visually complete
```

Possible implementation techniques include:

-   pseudo-elements
-   SVG tracing overlays
-   masks/clip paths
-   border segments
-   measured geometry
-   opacity/transform for content
-   staged timelines

For important components, a temporary SVG outline may trace the
component geometry while the real HTML remains underneath.

Conceptually:

``` tsx
<DrawIn sequence="editorial">
  <Card />
</DrawIn>
```

Do not assume this exact API.

The goal is to develop a reusable primitive that can become one of the
library's signature features.

### Critical UX Requirement

The drawing sequence must never prevent the user from interacting with
the application for an excessive period.

Do not replay a long intro on every navigation.

Determine sensible behavior for first visit, repeat visit, route
transitions, reduced motion, and slower devices.

------------------------------------------------------------------------

## 14. Scroll & Spatial Depth

Scenes should have physical depth.

Conceptually:

``` text
sky
distant mountains
distant architecture
midground trees
primary architecture
UI
foreground plants/branches
```

Scroll can create restrained parallax:

-   far background: almost static
-   distant scenery: tiny movement
-   midground: moderate movement
-   foreground: slightly stronger movement

Avoid amusement-park parallax.

Some foreground artwork should be capable of overlapping HTML
components. Use appropriate layering, masking, pointer-event rules, and
accessibility behavior.

Support where appropriate:

-   layered SVG groups
-   z-indexed HTML anchors
-   foreground SVG overlays
-   scroll-linked transforms
-   viewport entrances
-   sticky scene sections
-   progressive illustration drawing
-   scene transitions

Prefer compositor-friendly transforms rather than layout-driven scroll
handlers.

------------------------------------------------------------------------

## 15. Motion Architecture

Treat these as related but distinct systems:

1.  **Intro motion** --- first-load construction/drawing.
2.  **Ambient motion** --- wind, water, birds, clouds.
3.  **Scroll motion** --- depth, parallax, reveals.
4.  **Interaction motion** --- component/illustration reactions.

Do not scatter all motion logic as arbitrary props across hundreds of
components.

Design a coherent orchestration architecture.

Prefer:

-   CSS/WAAPI for cheap perpetual ambient effects
-   transform/opacity for continuous movement
-   motion library for higher-level orchestration/state where useful
-   SVG path animation only where it provides meaningful visual value

------------------------------------------------------------------------

## 16. Responsive Art Direction

Do **not** merely scale desktop scenes down on mobile.

Illustrated composition requires actual responsive art direction.

At breakpoints, consider:

-   recomposition
-   cropping
-   moving anchors
-   removing nonessential scenery
-   changing illustration density
-   changing foreground overlap
-   simplifying animation
-   reducing parallax
-   alternate artwork framing
-   different typography treatment

The mobile experience should look intentionally designed, not like a
zoomed-out poster.

Support at minimum:

-   desktop
-   tablet
-   mobile

Pay particular attention to iPhone/Safari behavior.

------------------------------------------------------------------------

## 17. Accessibility

Accessibility is non-negotiable.

Ensure:

-   full keyboard navigation
-   clear but art-directed focus states
-   correct ARIA semantics
-   correct Dialog/Menu/Popover focus management
-   sufficient contrast
-   semantic HTML
-   screen-reader-friendly component behavior
-   decorative artwork hidden appropriately from assistive technology
-   meaningful illustration content described where necessary
-   usable zoom/text scaling
-   touch targets
-   no motion-dependent information
-   `prefers-reduced-motion`

### Reduced Motion

Reduced motion should be intentionally designed rather than simply
disabling everything.

For example:

-   skip long drawing sequences
-   show artwork immediately or with a brief fade
-   disable parallax
-   disable wind/water loops
-   preserve essential state transitions

------------------------------------------------------------------------

## 18. Performance

Detailed illustration must not make the library unusable.

Set and enforce reasonable performance budgets during implementation.

Strategies should include:

-   SVG optimization
-   semantic grouping
-   lazy-loading scenes below the fold
-   code splitting
-   avoiding React rerenders for ambient motion
-   animating groups rather than thousands of paths
-   mask-based texture reveals
-   compositor-friendly transforms
-   responsive artwork complexity
-   avoiding unnecessary filters
-   minimizing hydration work
-   testing on mobile hardware profiles
-   avoiding layout-triggering scroll animation

The initial page must not remain blank while animation JavaScript
initializes.

Design graceful static/pre-hydration rendering.

Measure actual performance rather than assuming it is acceptable.

------------------------------------------------------------------------

## 19. Documentation & Showcase

The documentation site is also the flagship artistic experience.

It should simultaneously be:

-   documentation
-   component explorer
-   installation guide
-   source viewer
-   art showcase
-   interactive demonstration of the scene system

Every component page should provide appropriate:

-   live preview
-   installation command
-   usage example
-   source/code
-   variants
-   API/props
-   accessibility notes
-   motion notes where relevant
-   customization guidance
-   examples in illustrated compositions where useful

### Showcase Philosophy

The homepage should feel like an interactive editorial journey.

Possible narrative:

``` text
blank paper
    ↓
brand mark draws
    ↓
landscape contours emerge
    ↓
architecture appears
    ↓
typography/components construct themselves
    ↓
scene becomes subtly alive
    ↓
scroll introduces depth
    ↓
components become part of the landscape
    ↓
window demonstrates Dialog
    ↓
botanical composition demonstrates controls
    ↓
scientific illustration demonstrates Slider/Toggle
    ↓
documentation/component grid
```

Do not treat that sequence as a rigid storyboard. Art-direct the
strongest experience.

### Critical Rule

The showcase site must itself be built primarily from public/installable
library primitives.

When someone sees an impressive interaction, it should ideally be
possible to offer:

**View source · Add to project**

The marketing experience should prove the actual product rather than
hide one-off effects unavailable to users.

------------------------------------------------------------------------

## 20. Branding

Create a coherent original identity for the project.

If no final name is supplied, choose a strong working name that suits
the art direction and keep naming easy to replace later.

Create:

-   wordmark treatment
-   favicon
-   metadata
-   social preview
-   concise positioning language
-   voice/tone
-   navigation structure

Avoid generic AI-generated brand language.

The writing should feel confident, concise, literate, and
design-conscious.

Do not overuse poetic copy at the expense of explaining the product.

------------------------------------------------------------------------

## 21. States People Forget

Design and document the less glamorous states too.

Components should account for:

-   hover
-   focus
-   focus-visible
-   active
-   selected
-   checked
-   open
-   disabled
-   loading
-   error
-   success
-   empty
-   long content
-   overflow
-   touch
-   keyboard-only usage
-   high zoom
-   reduced motion
-   slow loading

The showcase/docs should include polished:

-   loading states
-   error states
-   404
-   empty search
-   mobile navigation

Do not let the artistic treatment make ordinary product states
confusing.

------------------------------------------------------------------------

## 22. Customization

Developers should be able to adopt the visual language without cloning
the showcase exactly.

Support customization through semantic tokens and composable primitives.

Consider configuration for:

-   paper color
-   ink colors
-   accent
-   typography
-   radius
-   line weight
-   illustration density
-   motion intensity
-   scene world/motif
-   texture intensity
-   component density

Customization should preserve coherent art direction.

------------------------------------------------------------------------

## 23. Testing & Quality

This project is unusually dependent on visual quality.

Implement appropriate:

-   unit tests
-   interaction tests
-   accessibility tests
-   registry/install tests
-   responsive tests
-   browser testing
-   visual regression tests

Visual regression coverage is particularly important for:

-   core components
-   first-load end state
-   illustrated components
-   major scene breakpoints
-   open/closed interactive states
-   reduced-motion mode

Test important behavior in current Chromium, Firefox, and Safari/WebKit
where practical.

------------------------------------------------------------------------

## 24. Visual Inspection Loop

Do not judge the design by source code.

For every major milestone:

1.  implement it
2.  run the application
3.  render the real page
4.  capture/inspect screenshots
5.  inspect multiple viewport sizes
6.  compare against the supplied reference images and this art direction
7.  identify anything generic, awkward, broken, visually weak, overly
    SaaS-like, or unfinished
8.  improve it
9.  test interaction/accessibility
10. continue

Repeat this loop until the work meets the quality bar.

If artwork looks like programmer art, replace or improve it.

If motion draws attention to itself rather than making the environment
feel alive, reduce it.

If the page resembles a standard shadcn clone with serif fonts and beige
colors, rethink it.

------------------------------------------------------------------------

## 25. Architecture Before Scale

Before writing large amounts of implementation code:

1.  analyze the supplied reference images
2.  translate their visual language into concrete rules
3.  research current shadcn registry capabilities
4.  design the component architecture
5.  design the scene/layer/anchor architecture
6.  design the illustration asset pipeline
7.  design the motion architecture
8.  establish design tokens
9.  establish typography
10. identify technical risks
11. select one showcase scene/component that proves the thesis

Then implement the foundation and proof of concept.

Once the proof validates the architecture, continue through the complete
v1.

Do not spend weeks building generic primitives before proving that the
hardest illustrated interaction actually works.

------------------------------------------------------------------------

## 26. Initial Proof of Concept

Choose **one extraordinary showcase interaction** that demonstrates all
major ideas together.

It should ideally prove:

-   detailed authored artwork
-   semantic HTML integration
-   SVG/HTML layering
-   first-load drawing
-   ambient motion
-   component state controlling illustration
-   foreground/background depth
-   scroll behavior
-   responsive composition
-   accessibility
-   performance feasibility

An architectural scene with an interactive window/Dialog is one possible
direction because it naturally demonstrates physical integration, but
choose a better concept if one emerges from the supplied references.

The first proof should answer:

> Can UI and editorial illustration genuinely feel like one interactive
> object?

Do not simplify the artwork merely because implementation is harder.

------------------------------------------------------------------------

## 27. Project Documentation

Before substantial implementation, create persistent project documents
based on this brief:

``` text
/docs/ART_DIRECTION.md
/docs/MOTION.md
/docs/ARCHITECTURE.md
/docs/QUALITY.md
```

Also maintain the normal README and contribution/development
documentation.

These documents should preserve the project's principles so art
direction does not drift as the repository grows.

Update them when architecture intentionally changes.

------------------------------------------------------------------------

## 28. Autonomous Execution Contract

Treat this brief as authorization to take ownership of delivering the
finished project.

Do not stop after:

-   proposing architecture
-   creating a design system
-   scaffolding the repository
-   implementing a proof of concept
-   building the homepage
-   implementing one component
-   producing placeholder illustrations
-   reaching a technically functional state

Work iteratively until the defined v1 is complete.

You are empowered to make reasonable:

-   product decisions
-   design decisions
-   architecture decisions
-   typography decisions
-   illustration decisions
-   animation decisions
-   implementation decisions

when this document does not explicitly answer something.

Do not ask for approval on minor choices.

When multiple reasonable approaches exist, investigate them and choose
the one that best supports the product.

If an external dependency, library, or technique has changed recently,
research its current documentation before implementing it.

### Decision Priority

When tradeoffs are unavoidable, prioritize:

1.  exceptional visual/artistic quality
2.  usability and accessibility
3.  coherent system design
4.  developer experience
5.  performance
6.  implementation simplicity

Performance is still a hard requirement; this ordering means do not
prematurely destroy the artistic concept merely because a simpler
implementation exists. Find a better engineering solution.

### Implementation Loop

For each major milestone:

1.  plan enough to avoid obvious rework
2.  implement
3.  run/build
4.  visually inspect
5.  test
6.  diagnose shortcomings
7.  refine
8.  repeat
9.  move to the next milestone

Do not merely produce plans for work that you are capable of performing.

Do not leave essential work as suggestions for a human developer.

Do not use placeholder artwork in the final result.

Do not leave TODOs representing required v1 functionality.

Do not declare completion merely because the application builds.

### Quality Standard

Optimize for producing something someone would plausibly believe
involved a talented:

-   product designer
-   frontend engineer
-   creative developer
-   motion designer
-   editorial illustrator

Do **not** optimize for finishing as quickly as possible.

------------------------------------------------------------------------

## 29. Definition of Done --- V1

V1 is complete when the repository includes a polished implementation
of:

### Foundation

-   production-quality TypeScript/React architecture
-   Next.js documentation/showcase
-   Tailwind/design-token system
-   typography system
-   shadcn-compatible registry/distribution strategy
-   installable source-owned components
-   documented development workflow

### Component Library

-   coherent core editorial component collection
-   important states and accessibility
-   responsive behavior
-   customization tokens

### Motion System

-   reusable draw-in primitive/system
-   intro orchestration
-   ambient-motion primitives
-   scroll/depth primitives
-   interaction-motion patterns
-   reduced-motion behavior

### Illustration System

-   documented art language
-   optimized vector pipeline
-   semantic artwork grouping
-   reusable illustration primitives/assets
-   customization strategy
-   multiple compatible motifs/worlds

### Scene System

-   layers/depth
-   HTML anchors
-   SVG foreground/background integration
-   parallax/scroll behavior
-   component ↔ illustration state interaction
-   responsive recomposition

### Illustrated Components

-   several polished installable examples demonstrating different
    integration patterns

### Showcase

-   extraordinary art-directed homepage
-   first-load drawn-into-existence sequence
-   ambient environmental motion
-   moving trees/foliage
-   occasional bird/environmental behavior
-   layered scroll depth
-   component/illustration interactions
-   desktop/tablet/mobile compositions
-   showcase interactions built from public primitives

### Documentation

-   installation
-   component pages
-   examples
-   API/props
-   source/code access
-   accessibility guidance
-   motion guidance
-   customization
-   scene-system documentation
-   contribution/development docs

### Quality

-   optimized assets
-   lazy loading where appropriate
-   strong mobile performance
-   keyboard accessibility
-   screen-reader behavior
-   reduced motion
-   automated testing
-   visual regression coverage
-   cross-browser verification
-   polished loading/error/404 states
-   metadata/favicon/social preview
-   no essential placeholder content
-   no essential TODOs

------------------------------------------------------------------------

## 30. Final Acceptance Test

Before declaring the project complete, evaluate it against these
questions:

1.  **Would the core components still be desirable without the showcase
    artwork?**
2.  **Do illustrated components feel like one object rather than HTML
    placed over an SVG?**
3.  **Does the artwork look authored by an illustrator rather than
    generated by a developer?**
4.  **Does ambient motion feel natural enough that users discover it
    rather than immediately notice a loop?**
5.  **Does the first-load sequence genuinely feel drawn into
    existence?**
6.  **Does scrolling create depth without becoming gimmicky?**
7.  **Does mobile feel recomposed rather than shrunk?**
8.  **Can developers install the impressive things they see?**
9.  **Can users customize the system without destroying its visual
    coherence?**
10. **Is accessibility still excellent?**
11. **Is performance acceptable on realistic mobile hardware?**
12. **Does the site avoid the recognizable visual clichés of modern
    component-library/SaaS websites?**
13. **Is there at least one interaction that feels genuinely surprising
    and new?**
14. **Would a developer reasonably say, "I haven't seen a component
    library presented like this before"?**

If the answer to an important question is no, continue working.

------------------------------------------------------------------------

## 31. Start Now

Begin by studying every supplied reference image carefully.

Extract:

-   composition
-   line quality
-   density
-   typography
-   spacing
-   palette
-   framing
-   visual hierarchy
-   illustration technique
-   relationship between text and artwork

Then:

1.  establish the persistent design/architecture documents
2.  research current technical constraints where needed
3.  define the architecture
4.  establish the visual foundation
5.  build the hardest proof-of-concept scene
6.  run and visually inspect it
7.  refine until it proves the thesis
8.  expand into the component library
9.  build the complete showcase/docs experience
10. test, optimize, polish, and continue until the V1 definition of done
    is satisfied

**Do not stop at a proposal. Build the product.**
Code is to be stored at: https://github.com/mkeresty/toile