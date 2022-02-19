/** @jsxImportSource nano */
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="dom.iterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import * as Nano from "nano";
import site from "site";
import { Data } from "meta";

function image(data: Data) {
  const url = new URL(
    "/ogp/image" + data.url + "index.png",
    site.url("", true),
  );
  return url.href;
}

const template: Nano.FC<{ children: Nano.Component } & Data> = (
  { children, ...data },
) => {
  const App: Nano.FC = () => (
    <>
      <Nano.Helmet>
        {() => {
          if (data.title) return <title>{data.title}</title>;
        }}
        <link href="/style.css" rel="stylesheet" type="text/css" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <meta property="og:image" content={image(data)} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content={site.url(data.url as string, true)} />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:image" content={image(data)} />
        <meta name="twitter:creator" content="aiotter_tech" />
      </Nano.Helmet>

      <body class="bg-neutral-100 md:container md:max-w-3xl mx-auto p-5 sm:px-10 my-10 max-w-prose">
        {children}
      </body>
    </>
  );

  const html = Nano.renderSSR(<App />);
  const { body, head, attributes } = Nano.Helmet.SSR(html);
  const Head: Nano.FC = () =>
    head.length > 0
      ? <head innerHTML={{ __dangerousHtml: head.join("") }} />
      : <head />;

  return (
    <html {...Object.fromEntries(attributes.html)}>
      <Head />
      <body
        {...Object.fromEntries(attributes.body)}
        innerHTML={{ __dangerousHtml: body }}
      />
    </html>
  );
};
export default template;
