/** @jsxImportSource nano */
import { parse } from "libs/parse-ogp.ts";

export function Embed({ ogp }: { ogp: ReturnType<typeof parse> }) {
  if (!ogp) return undefined;

  return (
    <section
      name="embed"
      class="flex flex-wrap md:flex-nowrap gap-2 outline outline-4 hover:outline-teal-600 outline-slate-300 rounded-xl my-5 p-4 mx-auto max-w-[90%]"
    >
      <img
        class="basis-3/5 grow max-h-44 object-contain !bg-transparent !m-auto"
        src={ogp.images[0]?.url ??
          "https://www.colorbook.io/imagecreator.php?width=180&height=180&hex=0d9488"}
        alt={ogp.images[0]?.alt}
        width={ogp.images[0]?.width}
        height={ogp.images[0]?.height}
      />
      <div class="basis-2/5 grow p-2 m-auto min-w-0">
        <h1 class="!text-clip !text-lg !font-bold line-clamp-2 !my-2 !border-b-2">
          {ogp.title}
        </h1>
        <div class="line-clamp-3 md:line-clamp-5 text-sm">
          {ogp.description}
        </div>
      </div>
    </section>
  );
}
