import React from "react";

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function BrutalButton({
  variant = "primary",
  size = "md",
  children,
  className = "",
  style = {},
  ...props
}: BrutalButtonProps) {
  const variantClass =
    variant === "secondary"
      ? "brutal-btn-secondary"
      : variant === "danger"
        ? "brutal-btn-danger"
        : "brutal-btn-primary";

  const sizeStyle: React.CSSProperties =
    size === "sm"
      ? { padding: "6px 12px", fontSize: "11px" }
      : size === "lg"
        ? { padding: "14px 28px", fontSize: "16px" }
        : {};

  return (
    <button
      className={`${variantClass} ${className}`}
      style={{ ...sizeStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
