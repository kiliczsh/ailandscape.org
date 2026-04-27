"use client";

import type { ToolDetailProps } from "./shared";
import { SidebarProfile } from "./variants/sidebar-profile";

export function ToolDetail(props: ToolDetailProps) {
  return <SidebarProfile {...props} />;
}
