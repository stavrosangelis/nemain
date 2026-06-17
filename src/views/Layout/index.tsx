import { Outlet } from "react-router";
import { Container } from "@mui/material";
import { Header, Footer } from "@/components";

export default function Layout() {
  return (
    <Container maxWidth={false} disableGutters sx={{ backgroundColor: "#FFF" }}>
      <Header />
      <Outlet />
      <Footer />
    </Container>
  );
}
