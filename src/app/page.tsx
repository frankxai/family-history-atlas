import { AtlasExperience } from "@/components/AtlasExperience";
import { createFamilyHistoryAtlas, syntheticAlderFamily } from "@/atlas";

export const dynamic = "force-static";

export default async function HomePage() {
  const atlas = createFamilyHistoryAtlas();
  const result = await atlas.compile({ access: { kind: "public" }, source: syntheticAlderFamily });

  if (!result.ok) {
    throw new Error("The synthetic atlas could not be compiled.");
  }

  return <AtlasExperience document={result.document} />;
}
