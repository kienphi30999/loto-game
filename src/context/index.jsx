import React, { memo, useMemo } from "react";
import { io } from "socket.io-client";

export const wsContext = React.createContext(null);

const socket = io("https://loto-backend.easypiece.online/", {
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
      console.log("CONNECTED WS");
    });

    socket.on("disconnect", (evt) => {
      console.log("DISCONNECTED WS");
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
