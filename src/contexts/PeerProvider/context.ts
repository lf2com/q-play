import { createContext, useContext } from "react";
import type CustomPeer from "./CustomPeer";

export interface PeerContextValue {
  peer: CustomPeer | null;
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
