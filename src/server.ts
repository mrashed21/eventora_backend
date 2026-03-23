import app from "./app";
import { config } from "./app/config/config";
import { seed_super_admin } from "./app/utils/seed";

const server = async () => {
  await seed_super_admin();
  try {
    app.listen(config.PORT, () => {
      console.log(`Server is running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

server();
