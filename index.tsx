/** @jsxImportSource nano */

import site from "site";
import { Data } from "meta";
import { Badge, Created, Modified, Tag } from "components/badge.tsx";
import { sort } from "meta";

export const layout = "layouts/base.tsx";

const BlogPosts = () => {
  const blogPosts = site.pages
    .filter((page) => page.data.type === "post")
    .sort(sort.pages.dateDescending);

  return (
    <ul class="space-y-10">
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
    <div class="flex flex-row flex-wrap gap-y-10 justify-center mb-20">
      <a href="./about.mdx">
        <img
          src="https://avatars.githubusercontent.com/aiotter"
          class="rounded-full w-60"
        />
      </a>
      <div class="flex flex-col my-auto mx-5">
        <div class="border-b-4 px-5 mb-3">
          <h1 class="text-3xl my-0 font-bold">
            <a href="./about.mdx" class="link">aiotter</a> のブログ
          </h1>
        </div>
        <div class="flex gap-2 mx-auto">
          <a href="https://twitter.com/aiotter_tech">
            <Badge logo="twitter" logoColor="white" color="555555">
              twitter
            </Badge>
          </a>
          <a href="https://github.com/aiotter">
            <Badge logo="github" color="555555">GitHub</Badge>
          </a>
        </div>
      </div>
    </div>

    <div class="max-w-xl mx-auto">
      <h1 class="clear-both">最新の投稿</h1>
      <BlogPosts />
    </div>
  </main>
);
