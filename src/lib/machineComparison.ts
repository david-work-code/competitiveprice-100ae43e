import type { MachineData, ComparisonResult } from "@/pages/Index";

export function compareMachines(machines: MachineData[]): ComparisonResult {
  const hydraulic = machines.filter((m) => (m.productType || "").toLowerCase().includes("hydraulic"));
  const electric = machines.filter((m) => (m.productType || "").toLowerCase().includes("electric"));

  return {
    hydraulic: groupSimilarMachinesToTableFormat(hydraulic),
    electric: groupSimilarMachinesToTableFormat(electric),
  };
}

type ReferenceSpecs = {
  clampingForce: number | string;
  shotSize: number | string;
  screwType: string;
  performance?: string;
};

type TableGroup = {
  referenceSpecs: ReferenceSpecs;
  [manufacturer: string]: any; // arrays of MachineData per manufacturer
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.\-]/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function parseShotSize(shotSize: string, performance?: string): number {
  // For Multi performance, take the value before '/'
  if (performance && performance.toLowerCase().includes("multi") && shotSize.includes("/")) {
    const beforeSlash = shotSize.split("/")[0];
    return toNumber(beforeSlash);
  }
  return toNumber(shotSize);
}

function parseCheckedDate(checked: string): Date {
  // Parse MM.YYYY format
  if (!checked || typeof checked !== "string") return new Date(0);
  const parts = checked.split(".");
  if (parts.length !== 2) return new Date(0);
  const month = parseInt(parts[0]) - 1; // JS months are 0-indexed
  const year = parseInt(parts[1]);
  return new Date(year, month);
}

function groupSimilarMachinesToTableFormat(machines: MachineData[]): TableGroup[] {
  if (!machines || machines.length === 0) return [];

  // Group by normalized specs (clamping force range, screw type, shot size range)
  const map = new Map<
    string,
    {
      manufacturers: Record<string, MachineData[]>;
      ref: ReferenceSpecs;
    }
  >();

  machines.forEach((machine) => {
    const clampingForceNum = toNumber(machine.clampingForce);
    const performanceValue = (machine.performance || "").toLowerCase().trim();
    const shotSizeNum = parseShotSize(machine.shotSize, performanceValue);
    const screwTypeNorm = (machine.screwType || "").toLowerCase().trim();
    
    // Normalize performance for grouping - keep Multi separate
    let performanceGroup = "standard";
    if (performanceValue === "high") performanceGroup = "high";
    else if (performanceValue.includes("multi")) performanceGroup = "multi";

    const forceRange = Math.round(clampingForceNum / 50) * 50; // nearest 50
    const shotRange = Math.round(shotSizeNum / 10) * 10; // nearest 10

    const key = `${forceRange}-${screwTypeNorm}-${shotRange}-${performanceGroup}`;

    if (!map.has(key)) {
      map.set(key, {
        manufacturers: {},
        ref: {
          clampingForce: forceRange,
          shotSize: shotRange,
          screwType: machine.screwType || "",
          performance: performanceGroup === "high" ? "High" : performanceGroup === "multi" ? "Multi" : undefined,
        },
      });
    }

    const group = map.get(key)!;
    const mfg = machine.manufacturer || "Unknown";
    if (!group.manufacturers[mfg]) group.manufacturers[mfg] = [];
    group.manufacturers[mfg].push(machine);
  });

  // Filter to keep only the latest checked entry per manufacturer in each group
  map.forEach((group) => {
    Object.keys(group.manufacturers).forEach((mfg) => {
      const machines = group.manufacturers[mfg];
      if (machines.length > 1) {
        // Sort by checked date descending and keep only the latest
        machines.sort((a, b) => parseCheckedDate(b.checkedTime).getTime() - parseCheckedDate(a.checkedTime).getTime());
        group.manufacturers[mfg] = [machines[0]];
      }
    });
  });

  // Convert to the structure expected by ComparisonTable:
  // { referenceSpecs: {...}, [manufacturer]: MachineData[] }
  const result: TableGroup[] = [];
  map.forEach(({ manufacturers, ref }) => {
    result.push({ referenceSpecs: ref, ...manufacturers });
  });

  // Sort by clamping force (ascending), then by shot size (ascending)
  result.sort((a, b) => {
    const forceA = toNumber(a.referenceSpecs.clampingForce);
    const forceB = toNumber(b.referenceSpecs.clampingForce);
    if (forceA !== forceB) return forceA - forceB;
    
    const shotA = toNumber(a.referenceSpecs.shotSize);
    const shotB = toNumber(b.referenceSpecs.shotSize);
    return shotA - shotB;
  });

  return result;
}
