export default function Eyebrow({ children, color = "emerald" }: { children: React.ReactNode; color?: "emerald" | "orange" }) {
  return (
    <span className={`text-xs font-black uppercase tracking-widest ${color === "orange" ? "text-orange-400" : "text-emerald-400"}`}>
      {children}
    </span>
  );
}
