/** @jsxImportSource nano */

import * as Nano from "nano";
import site from "site";
import JsonLd, * as schema from "./json-ld.tsx";

// @deno-types="./es-iter.d.ts"
import Iter from "https://esm.sh/es-iter@1.1.2";

type Item = { name: string; url: string };

export const BreadcrumbList: Nano.FC<
  // Do not allow empty array
  { items: (Item | Item[])[] }
> = (props) => {
  // Convert type from (Item | Item[])[] to Item[][]
  const items = props.items
    .map((item) => Array.isArray(item) ? item : [item])
    .filter((items) => items.length > 0);

  const jsonLd: schema.WithContext<schema.BreadcrumbList>[] = new Iter<Item>([{
    name: "Home",
    url: "/",
  }])
    .product(...items)
    .toArray()
    .map((items) =>
      items.map(({ name, url }, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name,
        item: site.url(url, true),
      }))
    ).map((items) => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items as schema.ListItem[],
    }));

  return (
    <>
      <Nano.Helmet>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css"
          rel="stylesheet"
        />
        <JsonLd>
          {jsonLd}
        </JsonLd>
      </Nano.Helmet>

      <ol class="inline-flex flex-row flex-wrap align-middle relative block">
        <span class="absolute bg-shadow" />
        <li>
          <a href="/" class="p-1">
            <i class="fas fa-home"></i>
          </a>
        </li>
        {items.map((items, i) => (
          <li class="flex-initial before:font-awesome before:font-black before:mx-1.5 before:content-['\f0da']">
            {items.map(({ name, url }) => (
              <span class="first:before:content-['{'] last:after:content-['}'] after:content-[',_'] only:before:content-[''] only:after:content-['']">
                <a href={url} class="p-0.5">{name}</a>
              </span>
            ))}
          </li>
        ))}
      </ol>
    </>
  );
};
