"use client";

export function PassportCardRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <article className={className}>{children}</article>;
}
