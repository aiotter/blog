/** @jsxImportSource nano */
import dayjs from "dayjs";
import { FC } from "nano";
import site, { repository } from "site";
import { Data, url } from "meta";

interface Params<Tag> {
  label?: string;
  message?: string;
  color?: string;
  style?: "plastic" | "flat" | "flat-square" | "for-the-badge" | "social";
  logo?: string;
  logoColor?: string;
  logoWidth?: string;
  // "link" parameter is only for <object> tag embedding
  link?: Tag extends "object" ? [string, string] : undefined;
  labelColor?: string;
  cacheSeconds?: number | string;
  width?: number | string;
  height?: number | string;
}

export function Badge<Tag extends "img" | "object">(
  { tag, children, width, height, ...params }:
    & { tag?: Tag; children?: string }
    & Params<Tag>,
) {
  const url = new URL("https://img.shields.io/static/v1");

  // Default params
  params.label ||= "";
  params.message ||= children;

  for (const [name, value] of Object.entries(params ?? {})) {
    if (name === "link") {
      url.searchParams.append(name, value[0]);
      url.searchParams.append(name, value[1]);
    } else {
      url.searchParams.set(name, value);
    }
  }

  const tailwindClassName = [
    height && `h-[${height}px]`,
    width && `w-[${width}]`,
  ].filter(Boolean).join(" ");

  if (!tag || tag === "img") {
    return <img src={url} {...{ height, width, class: tailwindClassName }} />;
  } else if (tag === "object") {
    return (
      <object data={url} {...{ height, width, class: tailwindClassName }} />
    );
  }
}

export const Created: FC<{ children: Parameters<typeof dayjs>[0] }> = (
  { children: date },
) => (
  <Badge label="作成" color="brightgreen" height="20">
    {dayjs(date).format("YYYY-MM-DD")}
  </Badge>
);

export const Modified: FC<{ children: Parameters<typeof dayjs>[0] }> = (
  { children: date },
) => (
  <Badge label="更新" color="brightgreen" height="20">
    {dayjs(date).format("YYYY-MM-DD")}
  </Badge>
);

export const Source: FC<{ url: string }> = ({ url }) => (
  <a href={repository.url + url}>
    <Badge
      message="原稿"
      color="555555"
      logo="github"
      logoColor="white"
      height="20"
    />
  </a>
);

export const PullRequest: FC<{ url: string }> = ({ url }) => (
  <a href={repository.url + url}>
    <Badge
      message="修正提案"
      color="555555"
      logo="git"
      logoColor="white"
      height="20"
    />
  </a>
);

export const Tag: FC<{ children: string }> = ({ children: tag }) => (
  <a href={url.tag(tag)}>
    <Badge
      message={tag}
      color="555555"
      logo="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAARhJREFUeNrElosNwiAQhoEJGKUj2A06Am7SDdQJHMERHEFG0AnsBnhNaGIvgLzuvOTSpg38371opfDmnLvBZRJ7e3rHz17+/iylXEQPA4DZldsDXLfoqkbuAfzeAqE6JK8J4heABT+utabOxNoDJlBjXdgjxT2hUHfvokcdbknLAYsOgYiMf6d9dHTTEQHYNntTjajKTKummo5UDwiOEZWoDE7Q2NrAY+jYxiVYiACimcAA4z8g8DQMlV2fPR3JKYA6WeJMXGKRb4eNIcyEyf0foIAwOafhlQjie68TN0Roj5kLIrQ270PVAaJevANEu3gDRD/xCoj+4gUQdOIZEBO5eAqCTTwGwSoegeAVj0DwiiOIavGPAAMAdsFh9C+Ctl8AAAAASUVORK5CYII="
      height="20"
    />
  </a>
);
