import { TablaPlayerWorkspace } from "@/components/tabla-player/tabla-player-workspace";

export default function TablaPlayerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 w-full">
      <h1 className="text-2xl font-semibold mb-1">AI Tabla Player</h1>
      <p className="text-sm text-neutral-500 mb-8">
        Pick a taal, edit the bol notation, and press Play — the synthesized tabla engine will
        play the bols in rhythm at your chosen tempo so you can practice along. Save compositions
        and train the AI Composer below to generate new patterns in a learned style.
      </p>
      <TablaPlayerWorkspace />
    </main>
  );
}
