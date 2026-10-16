import {
  Signpost,
  LayoutPanelLeft,
  Flag,
  Palette,
  BadgeCheck,
  Image as ImageIcon,
  Printer,
  PenTool,
  Layers,
  Stamp,
  Camera,
  Share2,
  CreditCard,
  FileText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const SERVICE_ICONS: Record<string, LucideIcon> = {
  signpost: Signpost,
  "layout-panel-left": LayoutPanelLeft,
  flag: Flag,
  palette: Palette,
  "badge-check": BadgeCheck,
  image: ImageIcon,
  printer: Printer,
  "pen-tool": PenTool,
  layers: Layers,
  stamp: Stamp,
  camera: Camera,
  "share-2": Share2,
  "credit-card": CreditCard,
  "file-text": FileText,
};

export const SERVICE_ICON_KEYS = Object.keys(SERVICE_ICONS);

export const DEFAULT_SERVICE_ICON = Sparkles;
