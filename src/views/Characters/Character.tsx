import { useParams, Link } from "react-router";
import {
  Alert,
  Box,
  Chip,
  Container,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { findById } from "@/data/db";
import type { RelatedCharacter } from "@/types";

function RelatedChips({ items, color }: { items: RelatedCharacter[]; color?: "success" | "error" | "default" }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {items.map((rel) => (
        <Chip
          key={rel.id}
          label={rel.character_name}
          color={color ?? "default"}
          size="small"
          component={Link}
          to={`/characters/${rel.id}`}
          clickable
        />
      ))}
    </Box>
  );
}

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

  const genderLabel = character.gender === "M" ? "Male" : character.gender === "F" ? "Female" : character.gender;

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 15 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {character.character_name}
      </Typography>

      {character.alternate_names.length > 0 && (
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Also known as: {character.alternate_names.map((n) => n.character_name).join(", ")}
        </Typography>
      )}

      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        {character.role_notes && (
          <Typography variant="body1">
            <strong>Role:</strong> {character.role_notes}
          </Typography>
        )}
        <Typography variant="body1">
          <strong>Gender:</strong> {genderLabel}
        </Typography>
        {character.allegiance && (
          <Typography variant="body1">
            <strong>Allegiance:</strong> {character.allegiance}
          </Typography>
        )}
        {character.faction && (
          <Typography variant="body1">
            <strong>Faction:</strong> {character.faction}
          </Typography>
        )}
      </Box>

      {character.friendly.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Friendly</Typography>
          <RelatedChips items={character.friendly} color="success" />
        </Box>
      )}

      {character.hostile.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Hostile</Typography>
          <RelatedChips items={character.hostile} color="error" />
        </Box>
      )}

      {character.familial_links.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Family</Typography>
          <RelatedChips items={character.familial_links} />
        </Box>
      )}

      {character.foster_links.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Foster links</Typography>
          <RelatedChips items={character.foster_links} />
        </Box>
      )}

      {character.sources.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>Sources</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Manuscript</TableCell>
                <TableCell>Page</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {character.sources.map((src, i) => (
                <TableRow key={i}>
                  <TableCell>{src.name}</TableCell>
                  <TableCell>{src.page}</TableCell>
                  <TableCell>{src.role_notes ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Container>
  );
}
