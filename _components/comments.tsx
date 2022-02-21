/** @jsxImportSource nano */

import { Helmet } from "nano";
import { FormattedDate } from "components/date.tsx";
import { Endpoints } from "https://esm.sh/@octokit/types@6.34.0";
type CommitComment =
  Endpoints["GET /repos/{owner}/{repo}/comments/{comment_id}"]["response"][
    "data"
  ];

type Comment = Partial<CommitComment> & { body_html?: string };

export const Comments = (
  { items: comments }: { items: Comment[] },
) => (
  <>
    <Helmet>
      <link href="/primitives.css" rel="stylesheet" />
      <link
        href="https://unpkg.com/@primer/css@19.3.0/dist/timeline.css"
        rel="stylesheet"
      />
      <link
        href="https://unpkg.com/@primer/css@19.3.0/dist/markdown.css"
        rel="stylesheet"
      />
    </Helmet>
    {comments.map((comment) => (
      <div class="TimelineItem ml-[88px]">
        <div class="TimelineItem-avatar">
          <a href={comment.user?.html_url}>
            <img
              class="rounded-full"
              height="40"
              width="40"
              alt={"@" + comment.user?.login}
              src={comment.user?.avatar_url ??
                "https://user-images.githubusercontent.com/334891/29999089-2837c968-9009-11e7-92c1-6a7540a594d5.png"}
            />
          </a>
        </div>

        <div class="TimelineItem-body border rounded-lg relative ml-[-16px]">
          <div
            name="comment-header"
            class="flex rounded-t-lg px-4 py-2 before:absolute before:block before:top-[11px] before:right-full before:left-[-8px] before:w-[8px] before:h-[16px] before:content-['_'] before:[clip-path:polygon(0_50%,100%_0,100%_100%)] before:bg-teal-100 bg-teal-100"
          >
            <h3>
              <a href={comment.user?.html_url} class="link font-bold">
                {comment.user!.login}
              </a>
              {" commented "}
              <a href={comment.html_url}>
                <FormattedDate
                  datetime={new Date(Date.parse(comment.created_at!))}
                  relative
                />
              </a>
            </h3>
          </div>
          <div
            name="comment-body"
            class="markdown-body bg-neutral-100 rounded-b-lg px-4 py-2"
            dangerouslySetInnerHTML={{
              __html: comment.body_html ?? comment.body,
            }}
          />
        </div>
      </div>
    ))}
  </>
);
