#!/usr/bin/env python3
"""Cut registered parallax plates from the immutable toile artwork.

Every exported PNG keeps the source canvas and source pixels. SAM 2 supplies
semantic silhouettes; no generative fill, resizing, or repositioning occurs.
"""

from pathlib import Path
import argparse

import numpy as np
from PIL import Image
import torch
import cv2

from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/mediterranean-scene.png"
CHECKPOINT = ROOT / ".tools/sam2/checkpoints/sam2.1_hiera_tiny.pt"
CONFIG = "configs/sam2.1/sam2.1_hiera_t.yaml"
OUT = ROOT / "public/art/sam2"

# Prompts are intentionally object-sized rather than horizontal depth bands.
# Each tuple is (box, positive points, negative points).
PROMPTS = {
    "mountains": [
        ((470, 285, 1671, 642), [(910, 390), (1250, 485), (1540, 500)],
         [(760, 530), (1110, 600), (1500, 625)]),
    ],
    "far-shore": [
        ((1120, 520, 1671, 690), [(1320, 625), (1580, 625)], [(1450, 565)]),
    ],
    "right-village": [
        ((690, 390, 1260, 700), [(812, 500), (1000, 555), (1160, 620)],
         [(900, 350), (1080, 690)]),
    ],
    "left-hillside": [
        ((0, 165, 445, 560), [(175, 290), (335, 390)], [(40, 520), (425, 510)]),
    ],
    "villa": [
        ((210, 300, 895, 835), [(510, 485), (570, 720), (760, 770)],
         [(250, 450), (880, 600)]),
    ],
    "mid-vegetation": [
        ((0, 245, 1130, 835), [(110, 470), (400, 555), (690, 575), (975, 650)],
         [(525, 450), (815, 525), (720, 760)]),
    ],
    "foreground": [
        ((0, 535, 520, 941), [(95, 720), (285, 875)], [(500, 600)]),
        ((1230, 680, 1671, 941), [(1480, 835), (1625, 875)], [(1300, 730)]),
    ],
    "water": [
        ((455, 645, 1671, 941), [(980, 855), (1360, 760)],
         [(620, 740), (1495, 685), (1580, 825)]),
    ],
}


def choose_device():
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def predict_one(predictor, box, positives, negatives):
    coords = np.asarray(positives + negatives, dtype=np.float32)
    labels = np.asarray([1] * len(positives) + [0] * len(negatives), dtype=np.int32)
    masks, scores, _ = predictor.predict(
        point_coords=coords,
        point_labels=labels,
        box=np.asarray(box, dtype=np.float32),
        multimask_output=True,
    )
    return masks[int(np.argmax(scores))], float(np.max(scores))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--preview", action="store_true", help="also write labeled mask previews")
    args = parser.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGB")
    pixels = np.asarray(source)
    device = choose_device()
    print(f"Loading SAM 2 on {device}…")
    model = build_sam2(CONFIG, str(CHECKPOINT), device=device)
    predictor = SAM2ImagePredictor(model)
    predictor.set_image(pixels)

    manifest = []
    raw_masks = {}
    for name, prompts in PROMPTS.items():
        union = np.zeros((source.height, source.width), dtype=bool)
        scores = []
        for box, positive, negative in prompts:
            mask, score = predict_one(predictor, box, positive, negative)
            union |= mask.astype(bool)
            scores.append(score)

        raw_masks[name] = union
        if args.preview:
            alpha = Image.fromarray((union * 255).astype(np.uint8), mode="L")
            Image.merge("RGB", (alpha, alpha, alpha)).save(OUT / f"{name}-mask.png")
        coverage = float(union.mean())
        manifest.append(f"{name}: score={min(scores):.3f}, coverage={coverage:.3%}")
        print(manifest[-1])

    # Consolidate the detailed selections into five cohesive depth planes.
    # Filling external contours ensures windows, foliage gaps, and engraved
    # white areas travel with their building rather than tearing away.
    groups = {
        "mountains": ["mountains"],
        "distant-settlement": ["far-shore", "right-village", "left-hillside"],
        "water": ["water"],
        "foreground-estate": ["villa", "mid-vegetation"],
        "bottom-plants": ["foreground"],
    }

    def solid_union(names):
        merged = np.logical_or.reduce([raw_masks[name] for name in names]).astype(np.uint8)
        merged = cv2.morphologyEx(
            merged,
            cv2.MORPH_CLOSE,
            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)),
        )
        contours, _ = cv2.findContours(merged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        solid = np.zeros_like(merged)
        cv2.drawContours(solid, contours, -1, 1, thickness=cv2.FILLED)
        return solid.astype(bool)

    grouped_masks = {name: solid_union(members) for name, members in groups.items()}
    order = list(groups)
    owner = np.full((source.height, source.width), -1, dtype=np.int16)
    for index, name in enumerate(order):
        owner[grouped_masks[name]] = index

    plates = [
        (name, owner == index) for index, name in enumerate(order)
    ]
    claimed = (owner >= 0).astype(np.uint8) * 255
    base_pixels = cv2.inpaint(pixels, claimed, 5, cv2.INPAINT_TELEA)
    Image.fromarray(base_pixels, mode="RGB").save(OUT / "base.png", optimize=True)
    for name, mask in plates:
        rgba = source.convert("RGBA")
        rgba.putalpha(Image.fromarray((mask * 255).astype(np.uint8), mode="L"))
        rgba.save(OUT / f"{name}.png", optimize=True)

    # Hard, disjoint alpha means this neutral-position composite must be exact.
    rebuilt = np.dstack((base_pixels, np.full((source.height, source.width), 255, np.uint8)))
    for _, mask in plates:
        rebuilt[mask, :3] = pixels[mask]
        rebuilt[mask, 3] = 255
    exact = bool(np.array_equal(rebuilt[:, :, :3], pixels))
    manifest.append(f"neutral composite exact: {exact}")
    (OUT / "manifest.txt").write_text("\n".join(manifest) + "\n")
    if not exact:
        raise RuntimeError("registered plates do not reconstruct the source")


if __name__ == "__main__":
    main()
