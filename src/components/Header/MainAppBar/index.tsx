import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { NavLink } from "react-router";
import "./styles.css";

const drawerWidth = 240;
const navItems = [
  { label: "Home", to: "/" },
  { label: "Characters", to: "/characters" },
  { label: "Network", to: "/network" },
];

export default function DrawerAppBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <NavLink
        to="/"
        style={{ textDecoration: "none" }}
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <Typography variant="h6" sx={{ my: 2 }}>
          ALB
        </Typography>
      </NavLink>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              sx={{ textAlign: "left" }}
              component={NavLink}
              to={item.to}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box>
      <AppBar
        component="nav"
        color="inherit"
        elevation={0}
        position="relative"
        sx={{ backgroundColor: "transparent" }}
      >
        <Toolbar>
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              justifyContent: "center",
              width: "100%",
            }}
            className="main-navigation"
          >
            {navItems.map((item) => (
              <Button
                component={NavLink}
                key={item.label}
                sx={{ color: "#333" }}
                to={item.to}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              flex: 1,
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          anchor="right"
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
}
