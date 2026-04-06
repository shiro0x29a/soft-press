import KeystaticApp from "./keystatic";

export const dynamic = "force-dynamic";

export default function RootLayout() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "var(--background)",
        overflow: "auto",
      }}
    >
      <KeystaticApp />
    </div>
  );
}
