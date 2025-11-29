import type Peer from "peerjs";
import { createContext, useContext } from "react";

export interface PeerContextValue {
  peer: Peer | null;
  code: string;
  getIdByCode: (code: string) => string;
  getCodeById: (id: string) => string;
}

export const PeerContext = createContext<PeerContextValue>({
  peer: null,
  code: "",
  getIdByCode: () => "",
  getCodeById: () => "",
});

export const usePeer = () => {
  const context = useContext(PeerContext);

  if (!context) {
    throw Error("no peer context");
  }

  return context;
};
