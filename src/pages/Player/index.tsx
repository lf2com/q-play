import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";

const STORE_KEY_CONTENT = "c";

const Player: FC = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<[] | null>(null);

  useEffect(() => {
    const storedPlaylistValue = localStorage.getItem(STORE_KEY_CONTENT);

    if (!storedPlaylistValue) {
      navigate("pairing");
      return;
    }

    try {
      setPlaylist(JSON.parse(storedPlaylistValue));
    } catch (err) {
      console.warn("Failed to parse playlist", err);
      console.warn("stored playlist value", storedPlaylistValue);
    }
  }, [navigate]);

  if (!playlist) {
    return <div className="text-xl">Loading</div>;
  }
};

export default Player;
