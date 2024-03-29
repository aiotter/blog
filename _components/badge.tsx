/** @jsxImportSource nano */
import dayjs from "dayjs";
import { Component, FC } from "nano";
import { Data, url } from "meta";

interface Params {
  label?: string;
  message: string; // Required
  color?: string;
  style?: "plastic" | "flat" | "flat-square" | "for-the-badge" | "social";
  logo?: string;
  logoColor?: string;
  logoWidth?: string;
  // "link" parameter is only for <object> tag embedding
  link?: [string, string];
  labelColor?: string;
  cacheSeconds?: number | string;
}

type ComponentParams<Tag> = {
  tag?: Tag;
  link?: Tag extends "object" ? [string, string] : undefined;
  width?: number | string;
  height?: number | string;
} & Omit<Params, "link">;

export function badge(
  params: Params,
  type: "image/svg+xml" | "image/png" = "image/svg+xml",
) {
  if (!params.message) throw Error("message param is required");

  let url: URL;
  switch (type) {
    case "image/svg+xml":
      url = new URL("https://img.shields.io/static/v1");
      break;
    case "image/png":
      url = new URL("https://raster.shields.io/static/v1");
      break;
    default:
      throw Error(`type "${type}" is not supported`);
  }

  // Default params
  params.label ||= "";

  for (const [name, value] of Object.entries(params ?? {})) {
    if (name === "link") {
      url.searchParams.append(name, value[0]);
      url.searchParams.append(name, value[1]);
    } else {
      url.searchParams.set(name, value);
    }
  }
  return url;
}

export function Badge<Tag>(params: ComponentParams<Tag>): Component;
export function Badge<Tag>(
  params: Omit<ComponentParams<Tag>, "message"> & { children: [string] },
): Component;
export function Badge<Tag extends "img" | "object">(
  { tag, children, width, height, ...params }: Partial<
    ComponentParams<Tag> & { children: [string] }
  >,
) {
  // If no message parameter specified, use children instead
  const message = children?.length > 0
    ? children.pop()
    : params.message as string;
  const urlParams: Params = { ...params, message };

  const url = badge(urlParams);

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

export const Source: FC<{ data: Data }> = ({ data }) => (
  <a href={data.repository.url + "/blob/" + data.repository.branch + data.sourceFile}>
    <Badge
      message="原稿"
      color="555555"
      logo="github"
      logoColor="white"
      height="20"
    />
  </a>
);

export const PullRequest: FC<{ data: Data }> = ({ data }) => (
  <a href={data.repository.url + "/edit/" + data.repository.branch + data.sourceFile}>
    <Badge
      message="修正提案"
      color="555555"
      logo="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IndoaXRlIiBkPSJNNy4xNzcgMy4wNzNMOS41NzMuNjc3QS4yNS4yNSAwIDAxMTAgLjg1NHY0Ljc5MmEuMjUuMjUgMCAwMS0uNDI3LjE3N0w3LjE3NyAzLjQyN2EuMjUuMjUgMCAwMTAtLjM1NHpNMy43NSAyLjVhLjc1Ljc1IDAgMTAwIDEuNS43NS43NSAwIDAwMC0xLjV6bS0yLjI1Ljc1YTIuMjUgMi4yNSAwIDExMyAyLjEyMnY1LjI1NmEyLjI1MSAyLjI1MSAwIDExLTEuNSAwVjUuMzcyQTIuMjUgMi4yNSAwIDAxMS41IDMuMjV6TTExIDIuNWgtMVY0aDFhMSAxIDAgMDExIDF2NS42MjhhMi4yNTEgMi4yNTEgMCAxMDEuNSAwVjVBMi41IDIuNSAwIDAwMTEgMi41em0xIDEwLjI1YS43NS43NSAwIDExMS41IDAgLjc1Ljc1IDAgMDEtMS41IDB6TTMuNzUgMTJhLjc1Ljc1IDAgMTAwIDEuNS43NS43NSAwIDAwMC0xLjV6Ij48L3BhdGg+PC9zdmc+Cg=="
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

export const History: FC<{ data: Data }> = ({ data }) => (
  <a href={data.repository.url + "/commits/" + data.repository.branch + data.sourceFile}>
    <Badge
      message="歴史"
      color="555555"
      logo="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IndoaXRlIiBkPSJNMS42NDMgMy4xNDNMLjQyNyAxLjkyN0EuMjUuMjUgMCAwMDAgMi4xMDRWNS43NWMwIC4xMzguMTEyLjI1LjI1LjI1aDMuNjQ2YS4yNS4yNSAwIDAwLjE3Ny0uNDI3TDIuNzE1IDQuMjE1YTYuNSA2LjUgMCAxMS0xLjE4IDQuNDU4Ljc1Ljc1IDAgMTAtMS40OTMuMTU0IDguMDAxIDguMDAxIDAgMTAxLjYtNS42ODR6TTcuNzUgNGEuNzUuNzUgMCAwMS43NS43NXYyLjk5MmwyLjAyOC44MTJhLjc1Ljc1IDAgMDEtLjU1NyAxLjM5MmwtMi41LTFBLjc1Ljc1IDAgMDE3IDguMjV2LTMuNUEuNzUuNzUgMCAwMTcuNzUgNHoiPjwvcGF0aD48L3N2Zz4K"
      height="20"
    />
  </a>
);
