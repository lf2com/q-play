import type { CSSProperties, FC } from "react";
import { memo, useEffect, useRef, useState } from "react";
import { customTwMerge } from "../../utils/customTwMerge";

interface Log {
  type: "log" | "warn" | "error";
  timestamp: number;
  message: string;
}

const ConsoleOnScreen: FC = () => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const oriConsole = console;
    const pushLog = (type: Log["type"], ...args: unknown[]) => {
      oriConsole.log(...args);

      setLogs((prevLogs) =>
        prevLogs.concat({
          type,
          timestamp: Date.now(),
          message: args
            .map((val) => {
              if (typeof val === "object") {
                try {
                  return JSON.stringify(val);
                } catch {
                  // ignore error
                }
              }

              return val;
            })
            .join(", "),
        })
      );
    };

    globalThis.console = {
      ...oriConsole,
      log: pushLog.bind(null, "log"),
      warn: pushLog.bind(null, "warn"),
      error: pushLog.bind(null, "error"),
    };

    return () => {
      globalThis.console = oriConsole;
    };
  }, []);

  useEffect(() => {
    const logContainer = logContainerRef.current;

    if (!logContainer) {
      return;
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            setLogs((prevLogs) => {
              prevLogs.shift();

              return prevLogs;
            });
          }
        });
      },
      {
        root: document,
        rootMargin: "0% 0% 0% 0%",
        threshold: [0],
      }
    );

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(({ addedNodes, removedNodes }) => {
        removedNodes.forEach((node) => {
          if (node instanceof Element) {
            intersectionObserver.unobserve(node);
          }
        });

        addedNodes.forEach((node) => {
          if (node instanceof Element) {
            intersectionObserver.observe(node);
          }
        });
      });
    });

    mutationObserver.observe(logContainer, { childList: true });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={logContainerRef}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-top overflow-hidden"
    >
      {logs.map((props, index) => (
        <Log key={`${index}_${props.timestamp}`} {...props} />
      ))}
    </div>
  );
};

const Log = memo<Log>(({ type, timestamp, message }) => {
  const [text, style] = (() => {
    const [, text = message, inlineStyle = ""] =
      message.match(/^%c\s+(.+?),\s*(.+)$/) ?? [];

    const style: CSSProperties = inlineStyle
      ? inlineStyle.split(";").reduce<CSSProperties>(
          (obj, line) => {
            const [key, val = ""] = line.split(":");

            Object.defineProperty(obj, key.trim(), { value: val.trim() });

            return obj;
          },
          {
            whiteSpace: "nowrap",
            flexGrow: 0,
            opacity: 0.5,
          } satisfies CSSProperties
        )
      : {};

    return [text, style];
  })();

  return (
    <div
      key={timestamp}
      className={customTwMerge(
        "flex gap-4 border-b px-1 py-1 text-sm text-start last:border-none",
        {
          "border-gray-400 bg-gray-400/25 text-gray-400": type === "log",
          "border-yellow-400 bg-yellow-400/25 text-yellow-400": type === "warn",
          "border-red-400 bg-red-400/25 text-red-400": type === "error",
        }
      )}
    >
      <div className="shrink-0 font-[monospace]">
        {new Date(timestamp).toISOString().replace(/.+T(.+)Z/, "$1")}
      </div>
      <div className="flex-1" style={style}>
        {text}
      </div>
    </div>
  );
});

Log.displayName = "LogMemo";

const ConsoleOnScreenWrapper: FC<{ enabled?: boolean }> = ({
  enabled = true,
}) => {
  return enabled ? <ConsoleOnScreen /> : null;
};

export default ConsoleOnScreenWrapper;
