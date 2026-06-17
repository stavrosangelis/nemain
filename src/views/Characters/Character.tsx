import { useParams } from "react-router";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";

export default function CharacterView() {
  const { id } = useParams();

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 15 }}>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "300px",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress aria-label="Loading…" /> <i>Loading...</i>
        </Box>
      ) : (!isLoading && !data) || error ? (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "300px",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      ) : !isLoading && data ? (
        <>
          <Typography variant="h4" component="h1">
            {label}
          </Typography>
          {lettersSent && lettersSent.length > 0 && (
            <Box sx={{ my: 1 }}>
              <Typography variant="h4" component="h4" sx={{ mb: 1 }}>
                Letters sent [{lettersSent.length}]:
              </Typography>
              <LettersOutput letters={lettersSent} />
            </Box>
          )}
          {lettersReceived && lettersReceived.length > 0 && (
            <Box sx={{ my: 1 }}>
              <Typography variant="h4" component="h4" sx={{ mb: 1 }}>
                Letters received [{lettersReceived.length}]:
              </Typography>
              <LettersOutput letters={lettersReceived} />
            </Box>
          )}
        </>
      ) : null}
    </Container>
  );
}
