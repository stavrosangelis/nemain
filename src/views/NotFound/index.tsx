import { Box, Container } from '@mui/material';
export default function NotFound() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 62px)' }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      </Box>
    </Container>
  );
}