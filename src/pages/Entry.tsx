import { type FC } from "react";
import Button from "../components/common/Button";
import { Link } from "react-router-dom";

const Entry: FC = () => (
  <div className="flex flex-col gap-4">
    <div className="text-5xl font-bold">Choose role</div>
    <Link to="editor" className="contents">
      <Button>Editor</Button>
    </Link>
    <Link to="player" className="contents">
      <Button>Player</Button>
    </Link>
  </div>
);

export default Entry;
