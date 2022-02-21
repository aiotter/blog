import primerPrimitives from "https://esm.sh/@primer/primitives@7.4.1";

function* getVariables(
  obj: Record<string, unknown>,
  prefix = "-",
): Generator<[string, string]> {
  for (const name of Object.getOwnPropertyNames(obj)) {
    if (typeof obj[name] === "string") {
      yield [[prefix, name].join("-"), obj[name] as string];
    } else {
      for (
        const item of getVariables(
          obj[name] as Record<string, unknown>,
          [prefix, name].join("-"),
        )
      ) {
        yield item;
      }
    }
  }
}

const { colors } = primerPrimitives;
const style = [...getVariables(colors.light_colorblind, "--color")]
  .map((item) => item.join(":"))
  .join(";");
export default `.markdown-body, .TimelineItem {${style}}`;
