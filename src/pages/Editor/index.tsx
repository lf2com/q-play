import { useCallback, useEffect, useRef, type FC } from "react";
import { usePeer } from "../../contexts/PeerProvider/context";
import Button from "../../components/common/Button";
import { useNavigate, useParams } from "react-router-dom";
import type { DataConnection } from "peerjs";

const Editor: FC = () => {
  const navigate = useNavigate();
  const { peer, code, getIdByCode } = usePeer();
  const inputRef = useRef<HTMLInputElement>(null);
  const { targetCode } = useParams();
  const disabledInput = !!targetCode;
  const peerRef = useRef(peer);

  const redirectToEditing = useCallback(
    (dataConn: DataConnection) => {
      const pathname = disabledInput ? "../editing" : "editing";
      console.log(110, dataConn);

      navigate(pathname, {
        state: {
          targetId: dataConn.peer,
          connId: dataConn.connectionId,
        },
      });
    },
    [disabledInput, navigate]
  );

  const connectTargetByCode = useCallback(
    (p: NonNullable<typeof peer>, c: string) => {
      const id = getIdByCode(c);
      const dataConn = p.connect(id);

      dataConn.once("open", () => {
        redirectToEditing(dataConn);
      });
    },
    [getIdByCode, redirectToEditing]
  );

  useEffect(() => {
    if (peer && targetCode) {
      connectTargetByCode(peer, targetCode);
    }
  }, [
    connectTargetByCode,
    disabledInput,
    navigate,
    peer,
    redirectToEditing,
    targetCode,
  ]);

  useEffect(() => {
    peerRef.current = peer;
  }, [peer]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-5xl font-bold">Enter pairing code</div>
      {peer ? (
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault();

            const targetCode = inputRef.current?.value;

            if (targetCode) {
              connectTargetByCode(peer, targetCode);
            }
          }}
        >
          <input
            ref={inputRef}
            disabled={disabledInput}
            type="text"
            autoFocus
            className="bg-white text-black"
            maxLength={code.length}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <Button type="submit" disabled={disabledInput}>
            Connect
          </Button>
        </form>
      ) : (
        "Loading"
      )}
    </div>
  );
};

export default Editor;
