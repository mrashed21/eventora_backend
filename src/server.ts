import app from "./app";
import { config } from "./app/config/config";

const server = async () => {
  try {
    app.listen(config.PORT, () => {
      console.log(`Server is running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

server();
