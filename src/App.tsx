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

const App: FC = () => (
  <Routes>
    <Route path="/">
      <Route index element={<Entry />} />
      <Route path="editor">
        <Route
          index
          element={
            <PeerProvider>
              <Editor />
            </PeerProvider>
          }
        />
        <Route
          path=":targetCode"
          element={
            <PeerProvider>
              <Editor />
            </PeerProvider>
          }
        />
        <Route
          path="editing"
          element={
            <PeerProvider>
              <Editing />
            </PeerProvider>
          }
        />
      </Route>
      <Route path="player">
        <Route index element={<Player />} />
        <Route
          path="pairing"
          element={
            <PeerProvider>
              <Pairing />
            </PeerProvider>
          }
        />
        <Route
          path="fetching"
          element={
            <PeerProvider>
              <Fetching />
            </PeerProvider>
          }
        />
      </Route>
      <Route path="test" element={<Test />} />
    </Route>
  </Routes>
);

export default App;
