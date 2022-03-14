import {
  createCanvas,
  loadImage,
} from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { namespace } from "https://deno.land/x/cache@0.2.13/mod.ts";
import { TinySegmenter } from "libs/tiny-segmenter.js";
import dayjs from "dayjs";
import { Data } from "lume/core.ts";
import site from "site";

// Path of the assets
const fontPath =
  "https://github.com/google/fonts/raw/main/ofl/kiwimaru/KiwiMaru-Medium.ttf";
const backgroundImagePath =
  "http://res.cloudinary.com/aiotter/image/upload/v1645355737/aiotter.com/ogp/image_base.png";

// Cache font
const fontCache = namespace("fontCache");
if (localStorage.getItem("fontPath") !== fontPath) {
  await fontCache.purge();
  localStorage.setItem("fontPath", fontPath);
}
const font = await fontCache.cache(fontPath, { maxAge: 60 * 60 * 24 * 30 })
  .then((f) => Deno.readFile(f.path));

// Cache background image
const backgroundImageCache = namespace("backgroundImageCache");
if (localStorage.getItem("backgroundImagePath") !== backgroundImagePath) {
  await backgroundImageCache.purge();
  localStorage.setItem("backgroundImagePath", backgroundImagePath);
}
const background = await backgroundImageCache.cache(backgroundImagePath, {
  maxAge: 60 * 60 * 24 * 30,
}).then((f) => Deno.readFile(f.path)).then((data) => loadImage(data));

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

export function createImage(
  text: string,
  created: string,
) {
  // Canvas settings
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext("2d");
  canvas.loadFont(font, { family: "KiwiMaru" });

  // Background rendering
  ctx.save();
  ctx.drawImage(background, 0, 0);
  ctx.restore();

  // Text rendering
  ctx.save();
  ctx.translate(100, 100);
  ctx.font = "64px KiwiMaru";
  ctx.fillStyle = "white";
  multilineJapanese(text, 14)
    .split("\n")
    .forEach((line, i) => ctx.fillText(line, 0, 64 * (i + 1)));
  ctx.restore();

  // Badge rendering
  ctx.save();
  // With http://res.cloudinary.com/aiotter/image/upload/v1645353424/aiotter.com/ogp/image_base.png
  // ctx.translate(528, 485);
  // ctx.font = "46px KiwiMaru";
  // ctx.fillText(created, 0, 46);
  ctx.font = "46px KiwiMaru";
  // ctx.translate(470, 485); // 中央
  ctx.translate(1100 - ctx.measureText(created).width, 530 - 46);
  ctx.fillText(created, 0, 46);
  // ctx.strokeRect(0, 0, ctx.measureText(created).width, 46);
  ctx.restore();

  // Output
  return canvas.toBuffer("image/png");
}

export const renderOrder = 100;
export default function* (): Generator<Data> {
  for (const page of site.pages) {
    if (
      ["post", "collection", "collection-post"].includes(
        page.data.type as string,
      ) && page.data.title
    ) {
      yield {
        url: `./image/${page.dest.path}.png`,
        content: createImage(
          String(page.data.title),
          dayjs(page.data.date).format("YYYY-MM-DD"),
        ),
      };
    }
  }
}
