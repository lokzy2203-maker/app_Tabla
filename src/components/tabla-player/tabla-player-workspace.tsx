"use client";

import { useState } from "react";
import { TAAL_PRESETS } from "@/lib/taal-presets";
import { TablaPlayer } from "@/components/tabla-player/tabla-player";
import { AiComposer } from "@/components/tabla-player/ai-composer";

export function TablaPlayerWorkspace() {
  const [notation, setNotation] = useState(TAAL_PRESETS[0].notation);

  return (
    <div className="space-y-8">
      <TablaPlayer notation={notation} onNotationChange={setNotation} />
      <AiComposer notation={notation} onLoad={setNotation} />
    </div>
  );
}
