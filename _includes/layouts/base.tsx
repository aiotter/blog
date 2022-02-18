/** @jsxImportSource nano */
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="dom.iterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import * as Nano from "nano";

const template: Nano.FC<{ children: Nano.Component; title: string }> = (
  { children, title },
) => {
  const App: Nano.FC = () => (
    <>
      <Nano.Helmet>
        {() => {
          if (title) return <title>{title}</title>;
        }}
        <link href="/style.css" rel="stylesheet" type="text/css" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
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
