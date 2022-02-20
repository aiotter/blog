import {
  createCanvas,
  loadImage,
} from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { TinySegmenter } from "deps/tiny-segmenter.js";
import dayjs from "dayjs";
import { Data } from "meta";
import site from "site";

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

export async function createImage(
  text: string,
  created: string,
) {
  // Canvas settings
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext("2d");
  const font = await fetch(
    "https://github.com/google/fonts/raw/main/ofl/kiwimaru/KiwiMaru-Medium.ttf",
  ).then((r) => r.arrayBuffer());
  canvas.loadFont(font, { family: "KiwiMaru" });

  // Background rendering
  const background = await fetch(
    "http://res.cloudinary.com/aiotter/image/upload/v1645355737/aiotter.com/ogp/image_base.png",
  ).then((r) => r.arrayBuffer());
  ctx.save();
  const bgImage = await loadImage(new Uint8Array(background));
  ctx.drawImage(bgImage, 0, 0);
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
export default async function* (): AsyncGenerator<Omit<Data, "sourceFile">> {
  for (const page of site.pages) {
    if (page.data.type === "post" && page.data.title) {
      yield {
        url: `./image/${page.dest.path}.png`,
        content: await createImage(
          String(page.data.title),
          dayjs(page.data.date).format("YYYY-MM-DD"),
        ),
      };
    }
  }
}
