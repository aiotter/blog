/** @jsxImportSource nano */

import site from "site";
import { Data } from "meta";
import { Created, Modified, Tag } from "components/badge.tsx";
import { sort } from "meta";

export const layout = "layouts/base.tsx";

const BlogPosts = () => {
  const blogPosts = site.pages
    .filter((page) => page.data.type === "post")
    .sort(sort.pages.dateDescending);

  return (
    <ul class="max-w-xl space-y-10">
      {blogPosts.map((page) => (
        <li class="flex flex-row flex-wrap gap-y-1 border-b-2">
          <div name="page-title">
            <a
              href={page.data.url}
              class="text-2xl font-semibold"
            >
              {page.data.title}
            </a>
          </div>

          <div
            name="page-metadata"
            class="flex flex-grow gap-x-1 items-end mb-1"
          >
            <div name="spacer" class="flex-grow" />

            {page.data.tags!.map((tag) => <Tag>{tag}</Tag>)}

            {page.data.lastModified &&
                <Modified>{page.data.lastModified as Date}</Modified> ||
              <Created>{page.data.date!}</Created>}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default (_data: Data) => (
  <main>
    <h1>最新の投稿</h1>
    <BlogPosts />
  </main>
);
