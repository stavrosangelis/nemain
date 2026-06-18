import { Box, Container, Typography } from "@mui/material";
import ulLogo from "@/assets/affiliations/ul-logo.svg";
import diasLogo from "@/assets/affiliations/DIAS_RGB.png";
import ircLogo from "@/assets/affiliations/irc_logo_white.svg";
import "./styles.css";

export default function Footer() {
  return (
    <>
      <Box
        sx={{
          borderTop: "2px solid var(--color-6)",
          minHeight: "200px",
          backgroundColor: "var(--color-2)",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            gap: 4,
            py: 2,
            maxWidth: "100%",
            height: "100%",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <a
            href="https://www.ul.ie/"
            target="_blank"
            rel="nofollow noopener noreferrer external"
          >
            <img
              src={ulLogo}
              title="University of Limerick"
              className="footer-affiliation"
            />{" "}
          </a>
          <a
            href="https://www.dias.ie/"
            target="_blank"
            rel="nofollow noopener noreferrer external"
          >
            <img
              src={diasLogo}
              title="The Dublin Institute for Advanced Studies (DIAS)"
              className="footer-affiliation"
            />{" "}
          </a>
          <a
            href="https://research.ie/"
            target="_blank"
            rel="nofollow noopener noreferrer external"
          >
            <img
              src={ircLogo}
              title="Irish Research Council"
              className="footer-affiliation"
            />{" "}
          </a>
        </Container>
      </Box>
      <Box
        sx={{
          borderTop: "2px solid var(--color-4)",
          backgroundColor: "var(--color-6)",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Typography variant="body2" sx={{ color: "#FFF" }}>
            Copyright © 2026. All rights reserved
          </Typography>
        </Container>
      </Box>
    </>
  );
}
