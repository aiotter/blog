import { Application, Router } from "https://deno.land/x/oak@v10.2.0/mod.ts";

const app = new Application();

// Serve static files
app.use(async (ctx, next) => {
  try {
    await ctx.send({
      root: `${Deno.cwd()}/_site`,
      index: "index.html",
    });
  } catch {
    if (ctx.request.method !== "GET") await next();
    ctx.response.status = 404;
    ctx.response.body = await Deno.readTextFile(`${Deno.cwd()}/_site/404/index.html`);
  }
});

const router = new Router();
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
