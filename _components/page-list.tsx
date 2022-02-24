/** @jsxImportSource nano */

import * as Lume from "lume/core.ts";
import { Created, Modified, Tag } from "components/badge.tsx";

export function Page(
  { item: page, tag, date }: { item: Lume.Page; tag?: boolean; date?: boolean },
) {
  // Using a trick to keep the badges on the right bottom
  // cf. https://css-tricks.com/float-an-element-to-the-bottom-corner/
  return (
    <li class="gap-y-1 border-b-2 md:flex">
      <div class="flex flex-col-reverse gap-1 md:block md:grow">
        {tag || date
          ? (
            <div
              name="page-metadata"
              class="flex md:h-full md:items-end md:[shape-outside:inset(calc(100%-20px)_0_0)] gap-x-1 pb-1 md:float-right"
            >
              <div name="spacer" class="grow" />
              {tag ? page.data.tags!.map((tag) => <Tag>{tag}</Tag>) : undefined}
              {date
                ? page.data.lastModified
                  ? <Modified>{page.data.lastModified as Date}</Modified>
                  : <Created>{page.data.date!}</Created>
                : undefined}
            </div>
          )
          : undefined}

        <h2
          name="page-title"
          class={"inline font-ud-shin-go font-bold text-2xl" + (
            page.data.type === "collection"
              ? " before:content-['\\f07b'] before:font-awesome before:font-normal before:mr-2"
              : ""
          )}
        >
          <a href={page.data.url}>
            {page.data.title}
          </a>
        </h2>
      </div>
    </li>
  );
}

export function PageList(
  { items: pages, ...props }: {
    items: Lume.Page[];
    tag?: boolean;
    date?: boolean;
  },
) {
  return (
    <ul class="space-y-10">
      {pages.map((page) => <Page item={page} {...props} />)}
    </ul>
  );
}
