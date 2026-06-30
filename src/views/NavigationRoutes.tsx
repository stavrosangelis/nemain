import { Route, Routes } from "react-router";
import Layout from "./Layout";
import NotFound from "./NotFound";
import HomePageView from "./Home";
import { CharacterView, CharactersView } from "./Characters";
import NetworkView from "./Network";

export default function NavigationRoutes() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePageView />} />
          <Route path="/characters" element={<CharactersView />} />
          <Route path="/network" element={<NetworkView />} />
          <Route path="/characters/:id" element={<CharacterView />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
