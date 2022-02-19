import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { createImage } from "./ogp-image.ts";

const app = new Application();

// Serve static files
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/_site`,
      index: "index.html",
    });
  } catch {
    await next();
    if (ctx.response.status === 404) {
      ctx.response.body = await Deno.readTextFile(
        `${Deno.cwd()}/_site/404/index.html`,
      );
    }
  }
});

const router = new Router();

// Serve OGP images
router.get("/ogp/image", async (ctx) => {
  const text = ctx.request.url.searchParams.get("text");
  if (text) {
    ctx.response.body = await createImage(text);
    ctx.response.type = "image/png";
  } else {
    ctx.response.status = 404;
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
