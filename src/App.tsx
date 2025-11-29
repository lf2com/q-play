import { type FC } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Entry from "./pages/Entry";
import Editor from "./pages/Editor";
import Player from "./pages/Player";
import Pairing from "./pages/Player/Pairing";
import PeerProvider from "./contexts/PeerProvider";
import Test from "./pages/Test";
import Fetching from "./pages/Player/Fetching";
import Editing from "./pages/Editor/Editing";
import ConsoleOnScreen from "./components/common/ConsoleOnScreen";

const App: FC = () => (
  <PeerProvider>
    <ConsoleOnScreen enabled={import.meta.env.DEV} />
    <Routes>
      <Route path="/">
        <Route index element={<Entry />} />
        <Route path="editor">
          <Route index element={<Editor />} />
          <Route path=":targetCode" element={<Editor />} />
          <Route path="editing" element={<Editing />} />
        </Route>
        <Route path="player">
          <Route index element={<Player />} />
          <Route path="pairing" element={<Pairing />} />
          <Route path="fetching" element={<Fetching />} />
        </Route>
        <Route path="test" element={<Test />} />
      </Route>
    </Routes>
  </PeerProvider>
);

export default App;
