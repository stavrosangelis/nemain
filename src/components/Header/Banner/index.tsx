import { Box, Typography } from "@mui/material";
import { Link } from "react-router";
import "./styles.css";

const Banner = () => {
  return (
    <Link to="/" style={{ textDecoration: "none", color: "#111" }}>
      <Box
        sx={{
          display: "inline-flex",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" className="banner-title">
          Nemain
        </Typography>
      </Box>
    </Link>
  );
};

export default Banner;
