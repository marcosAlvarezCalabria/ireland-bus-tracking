import { env } from "./config/env.js";
import { gtfsFeedCache } from "./infrastructure/gtfs-feed-cache.js";
import app from "./server.js";

async function bootstrap(): Promise<void> {
  await gtfsFeedCache.start();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

void bootstrap();
