import React from "react";

interface BrutalBadgeProps {
  children: React.ReactNode;
  bg?: string;
  color?: string;
  style?: React.CSSProperties;
}

export function BrutalBadge({
  children,
  bg = "#FFFFFF",
  color = "#000000",
  style = {},
}: BrutalBadgeProps) {
  return (
    <span
      className="brutal-tag"
      style={{
        backgroundColor: bg,
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
