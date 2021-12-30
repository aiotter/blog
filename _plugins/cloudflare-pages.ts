import { Site } from "lume/core.ts";

const encoder = new TextEncoder();

// https://developers.cloudflare.com/pages/platform/headers
async function createHeaders(site: Site) {
  const file = await Deno.open(site.dest() + "/_headers", {
    create: true,
    write: true,
  });

  await file.write(
    encoder.encode(`https://:project.pages.dev/*\n  X-Robots-Tag: noindex\n\n`),
  );

  for (const page of site.pages) {
    const url = typeof page.data.url === "function"
      ? page.data.url(page)
      : page.data.url;
    if (!url) continue;

    await file.write(encoder.encode(`${url}\n`));

    if (page.data.lastModified instanceof Date) {
      await file.write(
        encoder.encode(
          `  Last-Modified: ${page.data.lastModified.toUTCString()}\n`,
        ),
      );
    }

    await file.write(encoder.encode("\n"));
  }

  file.close();
}

export default function () {
  return (site: Site) => {
    site.addEventListener("afterBuild", async () => {
      await createHeaders(site);
    });
  };
}
