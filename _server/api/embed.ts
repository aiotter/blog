import { dom, oak, ogp } from "../deps.ts";

export const app: oak.Middleware = async (ctx) => {
  const url = ctx.request.url.searchParams.get("url");
  const html = await fetch(url!).then((r) => r.text());

  ctx.response.type = "application/json";
  ctx.response.body = ogp.parse(
    // @ts-ignore: Use deno-dom instead of the one from native browser
    new dom.DOMParser().parseFromString(html, "text/html"),
  );
};
