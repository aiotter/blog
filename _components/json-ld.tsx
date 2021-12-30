/** @jsxImportSource nano */

import { FC } from "nano";
import { Thing, WithContext } from "https://esm.sh/schema-dts@1.0.0";
export * from "https://esm.sh/schema-dts@1.0.0";

const JsonLd: FC<{ children: WithContext<Thing> | WithContext<Thing>[] }> = (
  { children },
) => (
  <script type="application/ld+json">
    {JSON.stringify(children)}
  </script>
);
export default JsonLd;
