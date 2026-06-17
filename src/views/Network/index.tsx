import { Box } from '@mui/material'
import Network from '@/components/Network'

export default function NetworkView() {
  return (
    <Box sx={{ height: 'calc(100vh - 148px)', overflow: 'hidden' }}>
      <Network />
    </Box>
  )
}
