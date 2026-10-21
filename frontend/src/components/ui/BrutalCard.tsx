import React from "react";

interface BrutalCardProps {
  children: React.ReactNode;
  highlight?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function BrutalCard({
  children,
  highlight = false,
  className = "",
  style = {},
  onClick,
}: BrutalCardProps) {
  const baseClass = highlight ? "brutal-card brutal-card-highlight" : "brutal-card";
  return (
    <div
      className={`${baseClass} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
