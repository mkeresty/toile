# Architecture

The system has five independently installable strata: core controls, motion primitives, artwork primitives, illustrated controls, and scenes. Core controls have no scene dependency. Registry items use the current shadcn GitHub registry format, explicit targets, direct package dependencies, and pinned same-repository addresses where releases require reproducibility.

`Scene` establishes the coordinate and stacking context. `SceneLayer` carries a semantic depth value. `SceneAnchor` locates real HTML within art. Background and foreground artwork remain pointer-inert unless an element is deliberately interactive. Illustrated components wrap established accessible primitives rather than reimplementing focus or keyboard behavior.

Artwork enters as original drawing, is vectorized when interaction requires it, split into semantic groups, optimized, annotated with motion ownership, and validated at desktop, tablet, and mobile compositions.
