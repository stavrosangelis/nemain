import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import Cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import RefreshIcon from "@mui/icons-material/Refresh";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { db } from "@/data/db";
import type { Character } from "@/data/db";

// Register layout extension — aliased so ESLint doesn't mistake it for a React hook
const registerLayout: (ext: Cytoscape.Ext) => void =
  Cytoscape.use.bind(Cytoscape);
registerLayout(fcose as Cytoscape.Ext);

// ─── Constants ────────────────────────────────────────────────────────────────

const EDGE_COLORS = {
  friendly: "#43946C",
  hostile: "#EF4444",
  familial_links: "#F59E0B",
  foster_links: "#A78BFA",
} as const;

type EdgeType = keyof typeof EDGE_COLORS;

const EDGE_LABELS: Record<EdgeType, string> = {
  friendly: "Friendly",
  hostile: "Hostile",
  familial_links: "Familial",
  foster_links: "Foster",
};

const ALL_EDGE_TYPES: EdgeType[] = [
  "friendly",
  "hostile",
  "familial_links",
  "foster_links",
];

type PathInfo = { found: boolean; hops: number };

// ─── Cytoscape Stylesheet ─────────────────────────────────────────────────────

const STYLESHEET: object[] = [
  {
    selector: "node",
    style: {
      "background-color": "#60A5FA",
      label: "data(label)",
      color: "#e2e8f0",
      "font-size": "9px",
      "text-valign": "bottom",
      "text-halign": "center",
      "text-margin-y": 4,
      "text-outline-width": 2,
      "text-outline-color": "#0f172a",
      width: 22,
      height: 22,
      "border-width": 2,
      "border-color": "#3b82f6",
      "transition-property":
        "opacity border-color border-width background-color",
      "transition-duration": 150,
    },
  },
  {
    selector: 'node[gender = "F"]',
    style: {
      "background-color": "#F472B6",
      "border-color": "#ec4899",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1.5,
      opacity: 0.65,
      "curve-style": "bezier",
      "transition-property": "opacity width",
      "transition-duration": 150,
    },
  },
  {
    selector: 'edge[type = "friendly"]',
    style: {
      "line-color": "#43946C",
      "target-arrow-color": "#43946C",
      "target-arrow-shape": "triangle",
    },
  },
  {
    selector: 'edge[type = "hostile"]',
    style: {
      "line-color": "#EF4444",
      "target-arrow-color": "#EF4444",
      "target-arrow-shape": "triangle",
    },
  },
  {
    selector: 'edge[type = "familial_links"]',
    style: {
      "line-color": "#F59E0B",
      "target-arrow-color": "#F59E0B",
      "target-arrow-shape": "none",
    },
  },
  {
    selector: 'edge[type = "foster_links"]',
    style: {
      "line-color": "#A78BFA",
      "target-arrow-color": "#A78BFA",
      "target-arrow-shape": "none",
    },
  },
  // ── Highlight / dim states ──
  {
    selector: "node.highlighted",
    style: {
      "border-width": 3,
      "border-color": "#ffffff",
    },
  },
  {
    selector: "node.dimmed",
    style: { opacity: 0.1 },
  },
  {
    selector: "edge.dimmed",
    style: { opacity: 0.04 },
  },
  {
    selector: "edge.highlighted",
    style: { width: 2.5, opacity: 1 },
  },
  // ── Path highlight ──
  {
    selector: "node.path-node",
    style: {
      "background-color": "#FCD34D",
      "border-color": "#f59e0b",
      "border-width": 3,
      "z-index": 20,
    },
  },
  {
    selector: "edge.path-edge",
    style: {
      "line-color": "#FCD34D",
      "target-arrow-color": "#FCD34D",
      width: 3,
      "z-index": 20,
      opacity: 1,
    },
  },
  // ── Hidden (filtered out) ──
  {
    selector: ".hidden",
    style: { display: "none" },
  },
];

// ─── fcose layout config ──────────────────────────────────────────────────────

const LAYOUT = {
  name: "fcose",
  quality: "default",
  randomize: true,
  animate: true,
  animationDuration: 900,
  animationEasing: "ease-out-expo",
  fit: true,
  padding: 60,
  nodeDimensionsIncludeLabels: true,
  uniformNodeDimensions: false,
  packComponents: true,
  nodeRepulsion: 5000,
  idealEdgeLength: 80,
  edgeElasticity: 0.45,
  nestingFactor: 0.1,
  gravity: 0.25,
  numIter: 2500,
  tile: true,
  tilingPaddingVertical: 12,
  tilingPaddingHorizontal: 12,
} as unknown as Cytoscape.LayoutOptions;

// ─── Helper: build elements once from db ─────────────────────────────────────

function buildElements(): Cytoscape.ElementDefinition[] {
  const nameToId = new Map(db.map((c) => [c.character_name, String(c.id)]));

  const nodes: Cytoscape.ElementDefinition[] = db.map((c) => ({
    data: {
      id: String(c.id),
      label: c.character_name,
      gender: c.gender,
    },
  }));

  const edgeSet = new Set<string>();
  const edges: Cytoscape.ElementDefinition[] = [];

  for (const char of db) {
    const sourceId = String(char.id);
    for (const type of ALL_EDGE_TYPES) {
      const targets = (char[type] ?? []) as string[];
      for (const targetName of targets) {
        const targetId = nameToId.get(targetName);
        if (!targetId) continue;
        const [a, b] = [sourceId, targetId].sort();
        const key = `${a}|${b}|${type}`;
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push({
          data: { id: `e-${key}`, source: sourceId, target: targetId, type },
        });
      }
    }
  }

  return [...nodes, ...edges];
}

// ─── Sub-component: Character details panel ───────────────────────────────────

interface ConnectionGroupProps {
  label: string;
  color: string;
  names: string[];
  onNavigate: (name: string) => void;
}

function ConnectionGroup({
  label,
  color,
  names,
  onNavigate,
}: ConnectionGroupProps) {
  return (
    <Box sx={{ mt: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: "#94a3b8",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 0.25, pl: 2.25 }}
      >
        {names.map((name) => (
          <Typography
            key={name}
            variant="caption"
            onClick={() => onNavigate(name)}
            sx={{
              color: "#cbd5e1",
              cursor: "pointer",
              lineHeight: 1.6,
              "&:hover": { color: "#ffffff", textDecoration: "underline" },
            }}
          >
            {name}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

interface CharacterDetailsProps {
  character: Character;
  onNavigate: (name: string) => void;
  onClose: () => void;
}

function CharacterDetails({
  character,
  onNavigate,
  onClose,
}: CharacterDetailsProps) {
  const hasConnections =
    character.friendly.length > 0 ||
    character.hostile.length > 0 ||
    character.familial_links.length > 0 ||
    (character.foster_links ?? []).length > 0;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: "#f1f5f9", fontWeight: 700, lineHeight: 1.3 }}
        >
          {character.character_name}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "#64748b", mt: -0.5, mr: -0.5 }}
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      </Box>

      {character.alternate_names && character.alternate_names.length > 0 && (
        <Typography
          variant="caption"
          sx={{ color: "#64748b", display: "block", mt: 0.25 }}
        >
          Also: {character.alternate_names.join(", ")}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
        <Chip
          label={character.gender === "M" ? "Male" : "Female"}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.65rem",
            backgroundColor:
              character.gender === "M"
                ? "rgba(96,165,250,0.15)"
                : "rgba(244,114,182,0.15)",
            color: character.gender === "M" ? "#60A5FA" : "#F472B6",
            border: `1px solid ${character.gender === "M" ? "#60A5FA40" : "#F472B640"}`,
          }}
        />
        <Chip
          label={`Page ${character.page}`}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.65rem",
            backgroundColor: "rgba(100,116,139,0.2)",
            color: "#94a3b8",
          }}
        />
      </Box>

      {character.role_notes && (
        <Typography
          variant="caption"
          sx={{ color: "#94a3b8", display: "block", mt: 1, lineHeight: 1.5 }}
        >
          {character.role_notes}
        </Typography>
      )}

      {hasConnections && (
        <>
          <Divider sx={{ borderColor: "#1e293b", my: 1.5 }} />
          {character.friendly.length > 0 && (
            <ConnectionGroup
              label="Friendly"
              color={EDGE_COLORS.friendly}
              names={character.friendly}
              onNavigate={onNavigate}
            />
          )}
          {character.hostile.length > 0 && (
            <ConnectionGroup
              label="Hostile"
              color={EDGE_COLORS.hostile}
              names={character.hostile}
              onNavigate={onNavigate}
            />
          )}
          {character.familial_links.length > 0 && (
            <ConnectionGroup
              label="Familial"
              color={EDGE_COLORS.familial_links}
              names={character.familial_links}
              onNavigate={onNavigate}
            />
          )}
          {(character.foster_links ?? []).length > 0 && (
            <ConnectionGroup
              label="Foster"
              color={EDGE_COLORS.foster_links}
              names={character.foster_links ?? []}
              onNavigate={onNavigate}
            />
          )}
        </>
      )}
    </Box>
  );
}

// ─── Main Network component ───────────────────────────────────────────────────

const ELEMENTS = buildElements();

export default function Network() {
  const cyRef = useRef<Cytoscape.Core | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<"all" | "M" | "F">("all");
  const [activeTypes, setActiveTypes] = useState<Set<EdgeType>>(
    new Set(ALL_EDGE_TYPES),
  );
  const [searchValue, setSearchValue] = useState("");
  const [pathStart, setPathStart] = useState<Character | null>(null);
  const [pathEnd, setPathEnd] = useState<Character | null>(null);
  const [pathInfo, setPathInfo] = useState<PathInfo | null>(null);

  const idToCharacter = useMemo(
    () => new Map(db.map((c) => [String(c.id), c])),
    [],
  );
  const nameToId = useMemo(
    () => new Map(db.map((c) => [c.character_name, String(c.id)])),
    [],
  );
  const selectedCharacter = useMemo(
    () => (selectedId ? (idToCharacter.get(selectedId) ?? null) : null),
    [selectedId, idToCharacter],
  );

  // ── Focus a character node by name ──
  const focusByName = useCallback(
    (name: string) => {
      const cy = cyRef.current;
      if (!cy) return;
      const id = nameToId.get(name);
      if (!id) return;
      const node = cy.getElementById(id);
      if (!node.length) return;

      const hood = node.closedNeighborhood();
      cy.elements()
        .addClass("dimmed")
        .removeClass("highlighted path-node path-edge");
      hood.removeClass("dimmed").addClass("highlighted");
      cy.animate({ center: { eles: node }, zoom: 2.5 }, { duration: 400 });
      setSelectedId(id);
      setPathInfo(null);
    },
    [nameToId],
  );

  // ── cy instance callback ──
  const cyCallback = useCallback(
    (cy: Cytoscape.Core) => {
      if (cyRef.current === cy) return;
      cyRef.current = cy;

      cy.on("tap", "node", (e) => {
        const id = (e.target as Cytoscape.NodeSingular).id();
        const node = cy.getElementById(id);
        const hood = node.closedNeighborhood();

        cy.elements()
          .addClass("dimmed")
          .removeClass("highlighted path-node path-edge");
        hood.removeClass("dimmed").addClass("highlighted");
        setSelectedId(id);
        setPathInfo(null);
      });

      cy.on("tap", (e) => {
        if (e.target === cy) {
          cy.elements().removeClass("dimmed highlighted path-node path-edge");
          setSelectedId(null);
          setPathInfo(null);
        }
      });

      cy.on("dbltap", (e) => {
        if (e.target !== cy) return;
        const newZoom = Math.min(cy.zoom() * 1.6, 6);
        cy.animate(
          { zoom: { level: newZoom, renderedPosition: e.renderedPosition } },
          { duration: 250 },
        );
      });
    },
    // setSelectedId and setPathInfo are stable (useState setters)
    [setSelectedId, setPathInfo],
  );

  // ── Apply filters imperatively whenever filter state changes ──
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.elements().removeClass("hidden");

      if (genderFilter !== "all") {
        cy.nodes()
          .filter((n) => n.data("gender") !== genderFilter)
          .addClass("hidden");
      }

      for (const type of ALL_EDGE_TYPES) {
        if (!activeTypes.has(type)) {
          cy.edges(`[type = "${type}"]`).addClass("hidden");
        }
      }

      // hide edges whose endpoints are hidden
      cy.edges()
        .filter(
          (e) => e.source().hasClass("hidden") || e.target().hasClass("hidden"),
        )
        .addClass("hidden");
    });
  }, [genderFilter, activeTypes]);

  // ── Search ──
  const handleSearchSelect = useCallback(
    (_e: React.SyntheticEvent, character: Character | null) => {
      if (!character) return;
      focusByName(character.character_name);
      setSearchValue("");
    },
    [focusByName],
  );

  // ── Path finder ──
  const handleFindPath = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || !pathStart || !pathEnd) return;

    const startId = String(pathStart.id);
    const endId = String(pathEnd.id);

    if (startId === endId) {
      setPathInfo({ found: false, hops: 0 });
      return;
    }

    try {
      const dijkstra = cy
        .elements()
        .not(".hidden")
        .dijkstra({
          root: cy.getElementById(startId),
          weight: () => 1,
          directed: false,
        });

      const path = dijkstra.pathTo(cy.getElementById(endId));

      cy.elements().removeClass("dimmed highlighted path-node path-edge");

      if (!path || path.length === 0) {
        setPathInfo({ found: false, hops: 0 });
        return;
      }

      cy.elements().addClass("dimmed");
      path.removeClass("dimmed").addClass("path-node");
      path.filter("edge").removeClass("path-node").addClass("path-edge");

      const hops = path.filter("node").length - 1;
      setPathInfo({ found: true, hops });
      setSelectedId(null);

      cy.animate({ fit: { eles: path, padding: 80 } }, { duration: 500 });
    } catch {
      setPathInfo({ found: false, hops: 0 });
    }
  }, [pathStart, pathEnd]);

  // ── Reset layout ──
  const handleResetLayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass("dimmed highlighted path-node path-edge");
    setSelectedId(null);
    setPathInfo(null);
    cy.layout(LAYOUT).run();
  }, []);

  // ── Fit to screen ──
  const handleFit = useCallback(() => {
    cyRef.current?.animate(
      { fit: { eles: cyRef.current.elements().not(".hidden"), padding: 60 } },
      { duration: 400 },
    );
  }, []);

  // ── Zoom in / out ──
  const handleZoomIn = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.animate(
      { zoom: Math.min(cy.zoom() * 1.3, 6), center: { eles: cy.elements() } },
      { duration: 200 },
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.animate(
      { zoom: Math.max(cy.zoom() / 1.3, 0.2), center: { eles: cy.elements() } },
      { duration: 200 },
    );
  }, []);

  // ── Toggle edge type ──
  const toggleEdgeType = useCallback((type: EdgeType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* ── Sidebar ── */}
      <Box
        sx={{
          width: 300,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1a1f2e",
          borderRight: "1px solid #1e293b",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #1e293b" }}>
          <Typography
            variant="subtitle1"
            sx={{ color: "#f1f5f9", fontWeight: 700, letterSpacing: "-0.01em" }}
          >
            Character Network
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {db.length} characters ·{" "}
            {ELEMENTS.filter((e) => e.data.source).length} connections
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2,
            pt: 2,
            pb: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          {/* ── Search ── */}
          <Box>
            <SectionLabel>Search</SectionLabel>
            <Autocomplete<Character>
              options={db}
              getOptionLabel={(c) => c.character_name}
              filterOptions={(options, { inputValue }) => {
                const q = inputValue.toLowerCase();
                return options.filter((c) =>
                  c.character_name.toLowerCase().includes(q),
                );
              }}
              inputValue={searchValue}
              onInputChange={(_e, v) => setSearchValue(v)}
              onChange={handleSearchSelect}
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Character name…"
                  sx={darkInputSx}
                />
              )}
              slotProps={{
                paper: {
                  sx: { backgroundColor: "#0f172a", color: "#e2e8f0" },
                },
              }}
            />
          </Box>

          {/* ── Legend ── */}
          <Box>
            <SectionLabel>Legend</SectionLabel>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <LegendDot color="#60A5FA" label="Male" />
              <LegendDot color="#F472B6" label="Female" />
            </Box>
            <Box
              sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
            >
              {ALL_EDGE_TYPES.map((type) => (
                <Box
                  key={type}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 2,
                      backgroundColor: EDGE_COLORS[type],
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    {EDGE_LABELS[type]}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Filters ── */}
          <Box>
            <SectionLabel>Filters</SectionLabel>
            <Typography
              variant="caption"
              sx={{ color: "#64748b", display: "block", mb: 0.75 }}
            >
              Gender
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
              {(["all", "M", "F"] as const).map((g) => (
                <Chip
                  key={g}
                  label={g === "all" ? "All" : g === "M" ? "Male" : "Female"}
                  size="small"
                  onClick={() => setGenderFilter(g)}
                  sx={{
                    height: 24,
                    fontSize: "0.7rem",
                    backgroundColor:
                      genderFilter === g ? "#43946C" : "rgba(255,255,255,0.06)",
                    color: genderFilter === g ? "#ffffff" : "#94a3b8",
                    border: `1px solid ${genderFilter === g ? "#43946C" : "#1e293b"}`,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor:
                        genderFilter === g
                          ? "#43946C"
                          : "rgba(255,255,255,0.12)",
                    },
                  }}
                />
              ))}
            </Stack>
            <Typography
              variant="caption"
              sx={{ color: "#64748b", display: "block", mb: 0.5 }}
            >
              Relationships
            </Typography>
            {ALL_EDGE_TYPES.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    size="small"
                    checked={activeTypes.has(type)}
                    onChange={() => toggleEdgeType(type)}
                    sx={{
                      color: "#475569",
                      "&.Mui-checked": { color: EDGE_COLORS[type] },
                      padding: "2px 4px",
                    }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    {EDGE_LABELS[type]}
                  </Typography>
                }
                sx={{ display: "flex", alignItems: "center", mx: 0, my: 0 }}
              />
            ))}
          </Box>

          {/* ── Path Finder ── */}
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}
            >
              <AccountTreeIcon sx={{ fontSize: 14, color: "#64748b" }} />
              <SectionLabel sx={{ mb: 0 }}>Path Finder</SectionLabel>
            </Box>
            <Stack spacing={1}>
              <Autocomplete<Character>
                options={db}
                getOptionLabel={(c) => c.character_name}
                value={pathStart}
                onChange={(_e, v) => {
                  setPathStart(v);
                  setPathInfo(null);
                }}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                size="small"
                renderInput={(params) => (
                  <TextField {...params} label="From" sx={darkInputSx} />
                )}
                slotProps={{
                  paper: {
                    sx: { backgroundColor: "#0f172a", color: "#e2e8f0" },
                  },
                }}
              />
              <Autocomplete<Character>
                options={db}
                getOptionLabel={(c) => c.character_name}
                value={pathEnd}
                onChange={(_e, v) => {
                  setPathEnd(v);
                  setPathInfo(null);
                }}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                size="small"
                renderInput={(params) => (
                  <TextField {...params} label="To" sx={darkInputSx} />
                )}
                slotProps={{
                  paper: {
                    sx: { backgroundColor: "#0f172a", color: "#e2e8f0" },
                  },
                }}
              />
              <Button
                variant="contained"
                size="small"
                disabled={!pathStart || !pathEnd}
                onClick={handleFindPath}
                sx={{
                  backgroundColor: "#43946C",
                  "&:hover": { backgroundColor: "#357a59" },
                  "&:disabled": {
                    backgroundColor: "#1e293b",
                    color: "#475569",
                  },
                  fontSize: "0.75rem",
                  textTransform: "none",
                }}
              >
                Find Path
              </Button>
              {pathInfo && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    p: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: pathInfo.found ? "#FCD34D" : "#ef4444",
                      borderRadius: 1,
                      backgroundColor: pathInfo.found
                        ? "rgba(252,211,77,0.1)"
                        : "rgba(239,68,68,0.1)",
                      border: `1px solid ${pathInfo.found ? "rgba(252,211,77,0.3)" : "rgba(239,68,68,0.3)"}`,
                      p: 1,
                    }}
                  >
                    {pathInfo.found
                      ? `Path found · ${pathInfo.hops} hop${pathInfo.hops !== 1 ? "s" : ""}`
                      : "No path found"}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<CloseIcon />}
                    variant="outlined"
                    color="error"
                    sx={{ lineHeight: 1.5 }}
                    onClick={() => {
                      const cy = cyRef.current;
                      if (!cy) return;
                      cy.elements().removeClass(
                        "dimmed highlighted path-node path-edge",
                      );
                      setSelectedId(null);
                      setPathInfo(null);
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              )}
            </Stack>
          </Box>

          {/* ── Character Details ── */}
          {selectedCharacter && (
            <>
              <Divider sx={{ borderColor: "#1e293b" }} />
              <CharacterDetails
                character={selectedCharacter}
                onNavigate={focusByName}
                onClose={() => {
                  setSelectedId(null);
                  cyRef.current?.elements().removeClass("dimmed highlighted");
                }}
              />
            </>
          )}
        </Box>
      </Box>

      {/* ── Graph Canvas ── */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          backgroundColor: "#0f172a",
          overflow: "hidden",
        }}
      >
        <CytoscapeComponent
          elements={ELEMENTS}
          stylesheet={STYLESHEET}
          layout={LAYOUT}
          style={{ width: "100%", height: "100%" }}
          cy={cyCallback}
          minZoom={0.2}
          maxZoom={6}
        />

        {/* Canvas toolbar */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            flexDirection: "column",
            gap: 0.75,
          }}
        >
          <Tooltip title="Zoom in" placement="left">
            <IconButton
              size="small"
              onClick={handleZoomIn}
              sx={{
                backgroundColor: "rgba(30,41,59,0.9)",
                color: "#94a3b8",
                "&:hover": { backgroundColor: "#1e293b", color: "#fff" },
              }}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom out" placement="left">
            <IconButton
              size="small"
              onClick={handleZoomOut}
              sx={{
                backgroundColor: "rgba(30,41,59,0.9)",
                color: "#94a3b8",
                "&:hover": { backgroundColor: "#1e293b", color: "#fff" },
              }}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit graph to screen" placement="left">
            <IconButton
              size="small"
              onClick={handleFit}
              sx={{
                backgroundColor: "rgba(30,41,59,0.9)",
                color: "#94a3b8",
                "&:hover": { backgroundColor: "#1e293b", color: "#fff" },
              }}
            >
              <CenterFocusStrongIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset layout" placement="left">
            <IconButton
              size="small"
              onClick={handleResetLayout}
              sx={{
                backgroundColor: "rgba(30,41,59,0.9)",
                color: "#94a3b8",
                "&:hover": { backgroundColor: "#1e293b", color: "#fff" },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Click-to-navigate hint */}
        {!selectedId && !pathInfo && (
          <Box
            sx={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#334155", userSelect: "none" }}
            >
              Click a node to explore · Click canvas to clear
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Tiny shared style helpers ────────────────────────────────────────────────

function SectionLabel({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: object;
}) {
  return (
    <Typography
      variant="caption"
      sx={{
        color: "#64748b",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        display: "block",
        mb: 0.75,
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
        {label}
      </Typography>
    </Box>
  );
}

const darkInputSx = {
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
  },
  "& .MuiInputBase-input": { color: "#e2e8f0" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
  "& .MuiInputLabel-root": { color: "#64748b" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#43946C" },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#475569",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#43946C",
  },
  "& .MuiSvgIcon-root": { color: "#64748b" },
};
