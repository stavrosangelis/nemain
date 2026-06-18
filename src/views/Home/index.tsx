import { Container, Paper, Typography } from "@mui/material";

export default function HomePageView() {
  return (
    <Container maxWidth="lg" sx={{ mb: 15 }}>
      <Paper elevation={2} sx={{ p: 2, mt: 5, mb: 2 }}>
        <Typography variant="h1" sx={{ fontSize: "40px", mb: 2 }}>
          Aided Lóegairi Búadaig
        </Typography>
        <Typography variant="body2">
          Networks of Early-modern, Medieval, and Ancient Irish Narratives
          (NEMAIN) aims to create social network the entire social from
          narratives Mythological and Ulster cycle of Irish literature. As many
          narratives have been lost however, the best-known heroes now may not
          have always been the most important heroes. A minor character in one
          narrative, may have been the protagonists in others and their
          importance is now lost. Due to the abundance of shared characters in
          these two cycles, the construction of a large social network will
          allow us to identify influential characters.
        </Typography>
      </Paper>
    </Container>
  );
}
