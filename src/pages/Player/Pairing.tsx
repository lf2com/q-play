import { useEffect, type FC } from "react";
import { usePeer } from "../../contexts/PeerProvider/context";
import { useNavigate } from "react-router-dom";

const Pairing: FC = () => {
  const navigate = useNavigate();
  const { peer, code } = usePeer();

  // const editorUrl = useMemo(() => {
  //   const url = new URL(location.href);

  //   url.hash = `#/editor/${code}`;

  //   return url.toString();
  // }, [code]);

  useEffect(() => {
    if (!peer) {
      return;
    }

    peer.on("connection", (dataConn) => {
      dataConn.once("open", () => {
        navigate("../fetching", {
          state: {
            sourceId: dataConn.peer,
            connId: dataConn.connectionId,
          },
        });
      });
    });
  }, [navigate, peer]);

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="text-5xl font-bold">Pairing code</div>
      {peer ? (
        <>
          <div className="text-9xl font-sans">{code}</div>
          {/* <QRCodeSVG value={editorUrl} bgColor="transparent" fgColor="#fff" /> */}
        </>
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
};

export default Pairing;
