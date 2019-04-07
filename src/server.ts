// import errorHandler from "./utils/errorHandler";
import app from "./app";
import * as SocketIO from "socket.io";

// app.use(errorHandler()); //todo: implement error handler

const server = app.listen(app.get("port"), () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});

export default server;
export const io = SocketIO(server);