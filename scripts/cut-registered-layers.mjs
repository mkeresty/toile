import sharp from "sharp";
import {mkdir} from "node:fs/promises";

const width=1672,height=941,source="public/mediterranean-scene.png";
const regions={
  mountains:'<path d="M0 250H1672V625C1500 590 1390 620 1240 585S980 600 840 550S610 520 430 505S180 520 0 500Z"/>',
  left:'<path d="M0 175H905V820L760 850L590 832L430 875L250 825L0 805Z"/>',
  right:'<path d="M735 250H1672V755L1500 735L1320 760L1130 730L950 750L790 690Z"/>',
  water:'<path d="M0 635C330 660 560 648 780 666S1210 640 1672 630V941H0Z"/>',
  foreground:'<path d="M0 500C145 545 278 675 455 941H0ZM1150 941C1325 790 1490 710 1672 680V941Z"/>'
};
await mkdir("public/art/registered",{recursive:true});
for(const[name,shape]of Object.entries(regions)){
  const mask=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g fill="white">${shape}</g></svg>`);
  await sharp(source).ensureAlpha().composite([{input:mask,blend:"dest-in"}]).png().toFile(`public/art/registered/${name}.png`);
  console.log(`cut ${name}`);
}
