import {
  useEffect,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";
import CustomPeer from "./CustomPeer";
import { PeerContext, type PeerContextValue } from "./context";

const ID_PREFIX = "q-play-";

const getIdByCode = (code: string) => `${ID_PREFIX}${code}`;
const getCodeById = (id: string) => id.replace(ID_PREFIX, "");

const PeerProvider: FC<PropsWithChildren> = ({ children }) => {
  const [code] = useState(
    Array.from({ length: 6 }, () => (10 * Math.random()) | 0).join("")
  );
  const [peer, setPeer] = useState<CustomPeer | null>(null);

  useEffect(() => {
    const newPeer = new CustomPeer(getIdByCode(code), {
      debug: 3,
      config: {
        iceServers: [
          { url: "stun:stun.l.google.com:19302" },
          { url: "stun:stun1.l.google.com:19302" },
          { url: "stun:stun2.l.google.com:19302" },
          { url: "stun:stun3.l.google.com:19302" },
          { url: "stun:stun4.l.google.com:19302" },
        ],
      },
    });

    console.log(`<${code}>[peer] connecting`, code);

    newPeer
      .on("open", (cid) => {
        setPeer(newPeer);
        console.log(`<${code}>[peer] open`, cid);
      })
      .on("error", (error) => {
        console.warn(`<${code}>[peer] error`, error);
      })
      .on("call", (mediaConn) => {
        console.log(`<${code}>[peer] call`, mediaConn);
      })
      .on("connection", (dataConn) => {
        console.log(`<${code}>[peer] connection`, dataConn);
      })
      .on("disconnected", (id) => {
        console.warn(`<${code}>[peer] disconnected`, id);
      });

    return () => {
      newPeer.disconnect();
      newPeer.destroy();
    };
  }, [code]);

  const contextValue = useMemo<PeerContextValue>(
    () => ({
      peer,
      code,
      getIdByCode,
      getCodeById,
    }),
    [code, peer]
  );

  return (
    <PeerContext.Provider value={contextValue}>{children}</PeerContext.Provider>
  );
};

export default PeerProvider;
