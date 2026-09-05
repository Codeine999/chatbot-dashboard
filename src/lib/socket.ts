import { io, Socket } from "socket.io-client";
import { getAuthToken } from "@/features/auth/store/auth.store";

const SOCKET_ORIGIN = (import.meta.env.VITE_API_URL as string).replace(
  /\/api\/?$/,
  ""
);

let adminSocket: Socket | null = null;

/**
 * One shared admin-namespace socket for the whole app, connected lazily.
 * `auth` is a callback so every (re)connect attempt reads the *current*
 * token — a static object here would make automatic reconnects keep
 * retrying forever with whatever token was valid at construction time.
 */
export function getAdminSocket(): Socket {
  if (adminSocket) return adminSocket;

  adminSocket = io(`${SOCKET_ORIGIN}/admin`, {
    autoConnect: false,
    reconnectionAttempts: 5,
    auth: (cb) => cb({ token: getAuthToken() }),
  });

  return adminSocket;
}

export function connectAdminSocket(): Socket {
  const socket = getAdminSocket();

  if (!socket.connected) socket.connect();

  return socket;
}

export function disconnectAdminSocket(): void {
  adminSocket?.disconnect();
}
