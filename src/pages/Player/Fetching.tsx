import { useEffect, useMemo, useState, type FC } from "react";
import { usePeer } from "../../contexts/PeerProvider/context";
import { useLocation, useNavigate } from "react-router-dom";
import type { DataConnection } from "peerjs";
import Button from "../../components/common/Button";

const Fetching: FC = () => {
  const {
    state: { sourceId, connId },
  } = useLocation();
  const navigate = useNavigate();
  const { peer, getCodeById } = usePeer();
  const sourceCode = useMemo(
    () => getCodeById(sourceId),
    [getCodeById, sourceId]
  );
  const regions = useMemo(() => Array.from({ length: 4 }, (_, i) => i + 1), []);
  const [contents, setContents] = useState(
    regions.map<{
      blob: Blob;
      url: string;
    } | null>(() => null)
  );

  useEffect(() => {
    if (!peer) {
      return;
    }

    const conn = peer.getConnection(sourceId, connId) as DataConnection;

    if (!conn) {
      console.warn("ERROR no conn");
      return;
    }

    let peerReady = false;

    const handleResize = () => {
      if (peerReady) {
        conn.send({
          type: "display",
          width: innerWidth,
          height: innerHeight,
        });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conn.on("data", (data: any) => {
      switch (data.type) {
        case "ask-display": {
          peerReady = true;
          handleResize();
          break;
        }

        case "update-content": {
          const { regionIndex: index, file } = data;
          const blob = file ? new Blob([file], { type: data.filetype }) : null;

          setContents((prev) => {
            const prevItem = prev[index];

            if (prevItem) {
              URL.revokeObjectURL(prevItem.url);
            }

            return prev
              .slice(0, index)
              .concat(
                blob
                  ? {
                      blob,
                      url: URL.createObjectURL(blob),
                    }
                  : null
              )
              .concat(prev.slice(index + 1));
          });
        }
      }
    });

    globalThis.addEventListener("resize", handleResize);

    return () => {
      globalThis.removeEventListener("resize", handleResize);
    };
  }, [connId, peer, sourceId]);

  return (
    <div className="fixed inset-0 select-none grid grid-cols-2 grid-rows-2">
      <div className="absolute top-0 left-0 px-2 py-1 bg-black/50">
        #fetching from {sourceCode}
      </div>
      <Button
        className="absolute bottom-0 right-0 m-4"
        onClick={() => {
          navigate("../pairing");
        }}
      >
        Reset
      </Button>
      {regions.map((regionId, index) => {
        const content = contents[index];

        return (
          <div
            key={regionId}
            className="border border-white text-white/50 text-9xl font-extrabold flex bg-white/5 bg-no-repeat bg-cover bg-center overflow-hidden"
            {...(content && {
              style: { backgroundImage: `url(${content.url})` },
            })}
          >
            <span className="m-auto">{regionId}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Fetching;
