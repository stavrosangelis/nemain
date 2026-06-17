import { useParams } from "react-router";
import {
  Alert,
  Box,
  Chip,
  Container,
  Typography,
} from "@mui/material";
import { findById } from "@/data/db";

export default function CharacterView() {
  const { id } = useParams();
  const character = id ? findById(Number(id)) : undefined;

  if (!character) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5, mb: 15 }}>
        <Box sx={{ display: "flex", width: "100%", height: "300px", alignItems: "center", justifyContent: "center" }}>
          <Alert severity="error">Character not found.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 15 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {character.character_name}
      </Typography>
      {character.alternate_names && character.alternate_names.length > 0 && (
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Also known as: {character.alternate_names.join(", ")}
        </Typography>
      )}
      <Typography variant="body1" gutterBottom>
        <strong>Role:</strong> {character.role_notes}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Gender:</strong> {character.gender === "M" ? "Male" : character.gender === "F" ? "Female" : character.gender}
      </Typography>
      <Typography variant="body1" gutterBottom>
        <strong>Page:</strong> {character.page}
      </Typography>
      {character.friendly.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Friendly:</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {character.friendly.map((name) => (
              <Chip key={name} label={name} color="success" size="small" />
            ))}
          </Box>
        </Box>
      )}
      {character.hostile.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Hostile:</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {character.hostile.map((name) => (
              <Chip key={name} label={name} color="error" size="small" />
            ))}
          </Box>
        </Box>
      )}
      {character.familial_links.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Family:</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {character.familial_links.map((name) => (
              <Chip key={name} label={name} size="small" />
            ))}
          </Box>
        </Box>
      )}
      {character.foster_links && character.foster_links.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Foster links:</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {character.foster_links.map((name) => (
              <Chip key={name} label={name} size="small" />
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}
