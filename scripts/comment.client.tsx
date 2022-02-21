/** @jsxImportSource nano */
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="dom.iterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { Comments } from "components/comments.tsx";
import { request } from "https://cdn.skypack.dev/@octokit/request@5.6.3?dts";
import { hydrate } from "nano";
import { Data } from "meta";

// import { repository } from "site";
const repository = { url: "https://github.com/aiotter/blog" };

async function listCommitComments() {
  const [, owner, repo] = new URL(repository.url).pathname.split("/");
  const response = await request(
    "GET /repos/{owner}/{repo}/comments",
    { owner, repo, per_page: 100, mediaType: { format: "html" } },
  );
  return response.data;
}

function listCommit() {
  const history = document.getElementById("history");
  if (history) {
    return (JSON.parse(history.innerText) as Data["history"])!.map(
      (commit) => ({ id: commit.oid, message: commit.commit.message }),
    );
  }
  return [];

  // Falling back to GitHub API for searching file history
  // const path = // Not implemented
  // const [, owner, repo] = new URL(repository.url).pathname.split("/");
  // return await request("GET /repos/{owner}/{repo}/commits", {
  //   owner,
  //   repo,
  //   path,
  //   per_page: 100,
  // }).then(({ data }) =>
  //   data.map((commit) => ({ id: commit.sha, message: commit.commit.message }))
  // );
}

// deno-lint-ignore no-window-prefix
window.addEventListener("load", async () => {
  const commitIds = listCommit().map((commit) => commit.id);
  const comments = (await listCommitComments())
    .filter((comment) => commitIds.includes(comment.commit_id));

  hydrate(
    <Comments items={comments} />,
    document.getElementById("comments"),
  );

  // Dispatch DOMContentLoaded to update innerText of <time>
  window.document.dispatchEvent(
    new Event("DOMContentLoaded", { bubbles: true, cancelable: true }),
  );
});
