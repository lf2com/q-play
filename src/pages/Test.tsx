import type { FC } from "react";

const Test: FC = () => (
  <div className="fixed inset-0 flex gap-4 bg-white">
    <iframe src="/#/player" className="flex-1 h-full" />
    <iframe src="/#/editor" className="flex-1 h-full" />
  </div>
);

export default Test;
