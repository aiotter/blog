/** @jsxImportSource nano */

import * as Nano from "nano";
import site from "site";
import { url } from "meta";
import JsonLd, * as schema from "components/json-ld.tsx";

// @deno-types="./es-iter.d.ts"
import Iter from "https://esm.sh/es-iter@1.1.2";

export interface Item {
  name: string;
  url: string;
}

export class Items extends Array<Array<Item> | Item> {
  private constructor(items: Array<Item[]>) {
    super(items.length ?? 0);
    items.forEach((element, index) => this[index] = element);
  }

  static fromTags(tags?: string[]): Items {
    const items: Item[][] = [];
    if (tags && tags.length > 0) {
      items.push(
        [{ name: "tags", url: "/tags" }],
        tags.map((tag) => ({ name: tag, url: url.tag(tag) })),
      );
    }
    return items;
  }
}

export const BreadcrumbList: Nano.FC<{ items: Items }> = (props) => {
  // Convert type from (Item | Item[])[] to Item[][]
  const items: Item[][] = props.items
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
        <JsonLd>{jsonLd}</JsonLd>
      </Nano.Helmet>

      <ol class="inline-flex flex-row flex-wrap align-middle relative block">
        <span class="absolute bg-shadow" />
        <li>
          <a href="/" class="p-1">
            <i class="fas fa-home"></i>
          </a>
        </li>
        {items.map((items) => (
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
