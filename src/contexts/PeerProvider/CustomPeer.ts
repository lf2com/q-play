import Peer, { PeerError, type PeerEvents } from "peerjs";

type GetEventHandlers<T extends object> = {
  [E in keyof T as E extends string
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      T[E] extends Function
      ? `on${Capitalize<E>}`
      : never
    : never]: T[E];
};

type PeerEventHandlers = GetEventHandlers<PeerEvents>;

type PeerMediaConnEventHandlers = GetEventHandlers<{
  close: () => void;
  error: (error: PeerError<"negotiation-failed" | "connection-closed">) => void;
  iceStateChanged: (state: RTCIceConnectionState) => void;
  stream: (stream: MediaStream) => void;
  willCloseOnRemote: () => void;
  message: (data: unknown) => void;
}>;

class CustomPeer extends Peer {
  callPromise(...args: Parameters<Peer["call"]>): Promise<{
    mediaConnection: unknown; //MediaConnection;
    stream: MediaStream;
  }> {
    const mediaConn = super.call.apply(this, args);

    return new Promise((resolve, reject) => {
      const end = () => {
        mediaConn.off("stream", onStream);
        mediaConn.off("willCloseOnRemote", onWillCloseOnRemote);
        this.off("error", onError);
      };

      const onStream: PeerMediaConnEventHandlers["onStream"] = (stream) => {
        resolve({
          mediaConnection: mediaConn,
          stream,
        });
        end();
      };

      const onWillCloseOnRemote: PeerMediaConnEventHandlers["onWillCloseOnRemote"] =
        () => {
          reject();
          end();
        };

      const onError: PeerEventHandlers["onError"] = (error) => {
        reject(error);
        end();
      };

      this.on("error", onError);
      mediaConn.on("stream", onStream);
      mediaConn.on("willCloseOnRemote", onWillCloseOnRemote);
    });
  }
}

export default CustomPeer;
