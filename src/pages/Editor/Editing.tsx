import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FC,
} from "react";
import { useLocation } from "react-router-dom";
import { usePeer } from "../../contexts/PeerProvider/context";
import Button from "../../components/common/Button";
import type { DataConnection } from "peerjs";
import { customTwMerge } from "../../utils/customTwMerge";

const Editing: FC = () => {
  const {
    state: { targetId, connId },
  } = useLocation();
  const { peer, getCodeById } = usePeer();
  const targetCode = useMemo(
    () => getCodeById(targetId),
    [getCodeById, targetId]
  );
  const [display, setDisplay] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [conn, setConn] = useState<DataConnection | null>(null);
  const regions = useMemo(() => Array.from({ length: 4 }, (_, i) => i + 1), []);
  const [contents, setContents] = useState(
    regions.map<{
      file: File;
      url: string;
    } | null>(() => null)
  );

  useEffect(() => {
    if (!peer) {
      return;
    }

    const conn = peer.getConnection(targetId, connId) as DataConnection;

    if (!conn) {
      console.warn("ERROR no conn");
      return;
    }

    let peerReady = false;

    const askDisplay = () => {
      if (peerReady) {
        return;
      }

      conn.send({ type: "ask-display" });
      setTimeout(() => askDisplay(), 1000);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conn.on("data", (data: any) => {
      switch (data.type) {
        case "display": {
          const { width, height } = data;

          peerReady = true;
          setDisplay({ width, height });
          break;
        }
      }
    });

    askDisplay();
    setConn(conn);
  }, [connId, peer, targetId]);

  return (
    <div className="fixed inset-0 flex flex-col gap-10 p-10 select-none">
      <div className="absolute top-0 left-0 px-2 py-1 bg-black/50">
        #editing for {targetCode}
      </div>
      <div
        className="flex-1 self-center container grid place-items-center"
        style={{ containerType: "size" }}
      >
        <div
          className={customTwMerge(
            "m-auto border border-white grid grid-cols-2 grid-rows-2",
            "aspect-(--ratio) w-[min(100cqw,calc(100cqh*var(--ratio)))]"
          )}
          {...(display && {
            style: {
              "--ratio": `${display.width} / ${display.height}`,
            } as CSSProperties,
          })}
        >
          {regions.map((regionId, index) => {
            const content = contents[index];

            return (
              <label
                key={regionId}
                className="relative border border-white text-white/50 text-9xl font-extrabold flex bg-white/5 hover:bg-white/10 active:bg-white/15 bg-no-repeat bg-cover bg-center overflow-hidden"
                {...(content && {
                  style: { backgroundImage: `url(${content.url})` },
                })}
              >
                <span className="m-auto">{regionId}</span>
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={({ currentTarget: { files } }) => {
                    const file = files?.[0];

                    setContents((prev) => {
                      const prevItem = prev[index];

                      if (prevItem) {
                        URL.revokeObjectURL(prevItem.url);
                      }

                      return prev
                        .slice(0, index)
                        .concat(
                          file
                            ? {
                              file,
                              url: URL.createObjectURL(file),
                            }
                            : null
                        )
                        .concat(prev.slice(index + 1));
                    });
                  }}
                />
              </label>
            );
          })}
        </div>
      </div>
      <Button
        disabled={!conn || isLoading}
        className="shrink-0"
        {...(conn && {
          onClick: async () => {
            setIsLoading(true);

            await contents.reduce(async (promise, content, index) => {
              await promise;

              if (!content) {
                await conn.send({
                  type: "update-content",
                  regionIndex: index,
                  file: null,
                });

                return;
              }

              const { file, url } = content;

              const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();

                img.addEventListener('load', () => {
                  resolve(img);
                });
                img.addEventListener('error', reject);
                img.src = url;
              })

              const { naturalWidth, naturalHeight } = img;
              const srcCanvas = document.createElement('canvas');
              const scale = Math.min(1920 / naturalWidth, 1080 / naturalHeight);

              srcCanvas.width = Math.round(scale * naturalWidth);
              srcCanvas.height = Math.round(scale * naturalHeight);

              const ctx = srcCanvas.getContext('2d');

              ctx?.drawImage(img, 0, 0, srcCanvas.width, srcCanvas.height);

              const resizedBlob = await new Promise<Blob>((resolve, reject) => {
                srcCanvas.toBlob(blob => {
                  if (blob) {
                    resolve(blob)
                  } else {
                    reject(Error('Failed to resize image'))
                  }
                }, file.type, 1)
              });

              await conn.send({
                type: "update-content",
                regionIndex: index,
                filename: file.name,
                filetype: resizedBlob.type,
                file: resizedBlob,
              });
            }, Promise.resolve());

            setIsLoading(false);
          },
        })}
      >
        Update
      </Button>
    </div>
  );
};

export default Editing;
