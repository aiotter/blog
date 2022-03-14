import { oak } from "./deps.ts";

export const staticFiles: oak.Middleware = async (ctx, next) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/_site`,
      index: "index.html",
    });
  } catch {
    if (ctx.request.method !== "GET") await next();
    ctx.response.status = 404;
    ctx.response.body = await Deno.readTextFile(
      `${Deno.cwd()}/_site/404/index.html`,
    );
  }
};
