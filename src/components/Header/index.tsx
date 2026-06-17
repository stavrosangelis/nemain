import { Box, Container } from "@mui/material";
import Banner from "./Banner";
import MainAppBar from "./MainAppBar";

const Header = () => {
  return (
    <Box
      sx={{
        borderBottom: 3,
        borderColor: "var(--color-6)",
        backgroundColor: "var(--color-4)",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Banner />
        <MainAppBar />
      </Container>
    </Box>
  );
};
export default Header;
