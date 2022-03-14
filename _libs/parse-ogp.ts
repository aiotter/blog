/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />

export function parse(document: Document) {
  const tags = document.getElementsByTagName("meta");

  const ogpPropertyMap = new Map(
    Array.from(tags).map(
      (tag) => [
        tag.getAttribute("property"),
        tag.getAttribute("content") ?? undefined,
      ],
    ),
  );

  if (
    !ogpPropertyMap.has("og:title") || !ogpPropertyMap.has("og:type") ||
    !ogpPropertyMap.has("og:image") || !ogpPropertyMap.has("og:url")
  ) {
    return undefined;
  }

  return {
    title: ogpPropertyMap.get("og:title")!,
    type: ogpPropertyMap.get("og:type")!,
    description: ogpPropertyMap.get("og:description")!,
    url: ogpPropertyMap.get("og:url")!,
    images: [{
      url: ogpPropertyMap.get("og:image"),
      secure_url: ogpPropertyMap.get("og:image:secure_url"),
      type: ogpPropertyMap.get("og:image:type"),
      width: ogpPropertyMap.get("og:image:width"),
      height: ogpPropertyMap.get("og:image:height"),
      alt: ogpPropertyMap.get("og:image:alt"),
    }],
  };
}

// Deno.test("Check OGP", async () => {
//   const { assertEquals } = await import(
//     "https://deno.land/std@0.129.0/testing/asserts.ts"
//   );
//   const { DOMParser } = await import(
//     "https://deno.land/x/deno_dom@v0.1.21-alpha/deno-dom-wasm.ts"
//   );
// 
//   const html = await fetch("https://ogp.me/").then((r) => r.text());
//   const { title, description, url } = parse(
//     // @ts-ignore: Incorrect intermediate types
//     new DOMParser().parseFromString(html, "text/html"),
//   )!;
// 
//   assertEquals(title, "Open Graph protocol");
//   assertEquals(
//     description,
//     "The Open Graph protocol enables any web page to become a rich object in a social graph.",
//   );
//   assertEquals(url, "https://ogp.me/");
// });
