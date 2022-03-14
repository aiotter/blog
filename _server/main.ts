import { oak } from "./deps.ts";
import { staticFiles } from "./static.ts";
import * as embed from "./api/embed.ts";

const app = new oak.Application();
const router = new oak.Router();

// Handle API endpoints
router.get("/api/embed", embed.app);

app.use(router.routes());
app.use(staticFiles);
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
