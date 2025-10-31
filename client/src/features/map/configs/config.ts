import { useMemo } from "react";
import midnightStyle from "./midnight-style";
import { useTheme } from "next-themes";

type MapConfigId = "default" | "midnight";

export type MapConfig = {
  id: MapConfigId;
  label: string;
  mapId?: string;
  mapTypeId?: string;
  styles?: google.maps.MapTypeStyle[];
};

export const MAP_CONFIGS: MapConfig[] = [
  {
    id: "default",
    label: "Default",
    mapId: "default-map",
  },
  {
    id: "midnight",
    label: "Midnight",
    mapId: "midnight-map",
    styles: midnightStyle,
  },
];

export const useMapConfig = (id: MapConfigId = "default") => {
   const { resolvedTheme } = useTheme();

  const mapConfig = useMemo(() => {
    if (resolvedTheme === "dark") {
      return MAP_CONFIGS.find((config) => config.id === "midnight") || MAP_CONFIGS[0];
    }
    return MAP_CONFIGS.find((config) => config.id === id) || MAP_CONFIGS[0];
  }, [id, resolvedTheme]);

  return { mapConfig };
};
