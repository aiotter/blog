/** @jsxImportSource nano */

import site from "site";
import { Data } from "meta";
import { Badge, Created, Modified, Tag } from "components/badge.tsx";
import { PageList } from "components/page-list.tsx";
import { sort } from "meta";

export const layout = "layouts/base.tsx";
export const renderOrder = 10;

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
          <h1 class="text-3xl my-0 font-ud-shin-go-bold font-bold whitespace-nowrap">
            <a href="./about.mdx" class="link mr-2">aiotter</a>のブログ
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
      <h1 class="clear-both heading text-4xl">最新の投稿</h1>
      <PageList tag date items={
        site.pages.filter((page) => ["post", "collection"].includes(page.data.type))
          .sort(sort.pages.dateDescending)}
      />
    </div>
  </main>
);
