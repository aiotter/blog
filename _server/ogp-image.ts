import {
  createCanvas,
  loadImage,
} from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { TinySegmenter } from "./tiny-segmenter.js";
import { Image } from "https://deno.land/x/imagescript@v1.2.11/mod.ts";

function multilineJapanese(text: string, maxSize: number): string {
  const segmenter = new TinySegmenter();
  const segmentedText = segmenter.segment(text);
  const regex = /^[!"%')\*\+\-\.,\/:;>?@\\\]^_`|}~？！。、」』】はがのをにへとで]$/;

  let newSegment = segmentedText.shift() ?? "";
  const result: string[] = [];
  for (;; newSegment = segmentedText.shift() ?? "") {
    if (regex.test(newSegment)) {
      result.push(result.pop() + newSegment);
    } else {
      result.push(newSegment);
    }
    if (segmentedText.length === 0) break;
  }

  return result.reduce((previous, current) =>
    (previous + current).split("\n").slice(-1).pop()!.length > maxSize
      ? previous + "\n" + current
      : previous + current
  );
}

export async function createImage(text: string) {
  // Canvas settings
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext("2d");
  const font = await fetch(
    "https://github.com/google/fonts/raw/main/ofl/hinamincho/HinaMincho-Regular.ttf",
  ).then((r) => r.arrayBuffer());
  canvas.loadFont(font, { family: "Hina Mincho" });

  // Border rendering
  ctx.save();
  ctx.fillRect(25, 25, 1150, 580);
  ctx.fillStyle = "white";
  ctx.fillRect(45, 45, 1110, 540);
  ctx.fillStyle = "black";
  ctx.strokeRect(50, 50, 1100, 530);
  ctx.restore();

  // Text rendering
  ctx.save();
  ctx.translate(250, 200);
  ctx.font = "64px Hina Mincho";
  multilineJapanese(text, 14)
    .split("\n")
    .forEach((line, i) => ctx.fillText(line, 0, 64 * i));
  ctx.restore();

  // Avatar rendering
  ctx.save();
  ctx.translate(70, 70); // image position
  ctx.beginPath();
  ctx.arc(80, 80, 80, 0, 2 * Math.PI, true);
  ctx.clip();
  const avatarImage = await loadImage(
    "https://avatars.githubusercontent.com/aiotter",
  );
  ctx.drawImage(avatarImage, 0, 0, 160, 160);
  ctx.restore();

  // Icon rendering
  ctx.save();
  ctx.translate(250, 80);
  const svg = await fetch(
    "https://raw.githubusercontent.com/primer/octicons/main/icons/file-24.svg",
  ).then((r) => r.text());
  const png = await Image.renderSVG(svg, 48, Image.SVG_MODE_HEIGHT).encode();
  const iconImage = await loadImage(png);
  ctx.drawImage(iconImage, 0, 0);
  ctx.restore();

  // Output
  return canvas.toBuffer("image/png");
}
