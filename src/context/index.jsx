import React, { memo, useMemo } from "react";
import { io } from "socket.io-client";

export const wsContext = React.createContext(null);

const socket = io("https://loto-rnd.thanhlankool1.repl.co/", {
  path: "/ws/socket.io",
  transports: ["websocket"],
});

export function WebSocketConTextProvider({ children }) {
  const value = useMemo(() => {
    return {
      socketio: socket,
    };
  }, []);

  React.useEffect(() => {
    socket.on("connect", (evt) => {
      console.log("CONNECTED");
    });

    socket.on("disconnect", (evt) => {
      console.log("DISCONNECTED");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <wsContext.Provider value={value.socketio}>{children}</wsContext.Provider>
  );
}
// export default WebSocketConTextProvider;
export default memo(WebSocketConTextProvider);
