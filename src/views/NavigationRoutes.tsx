import { Route, Routes } from "react-router";
import Layout from "./Layout";
import NotFound from "./NotFound";
import { /* CharacterView ,*/ CharactersView } from "./Characters";
import NetworkView from "./Network";

export default function NavigationRoutes() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/characters" element={<CharactersView />} />
          <Route path="/network" element={<NetworkView />} />
          {/* <Route path="/persons/:id" element={<CharacterView />} /> */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
