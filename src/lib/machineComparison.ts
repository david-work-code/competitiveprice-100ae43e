import type { MachineData, ComparisonResult } from "@/pages/Index";

interface GroupedMachine extends MachineData {
  groupKey: string;
}

export function compareMachines(machines: MachineData[]): ComparisonResult {
  // Separate by product type
  const hydraulic = machines.filter(m => m.productType.toLowerCase().includes('hydraulic'));
  const electric = machines.filter(m => m.productType.toLowerCase().includes('electric'));

  return {
    hydraulic: groupSimilarMachines(hydraulic),
    electric: groupSimilarMachines(electric)
  };
}

function groupSimilarMachines(machines: MachineData[]): any[] {
  if (machines.length === 0) return [];

  // Create groups based on similar specifications
  const groups: Map<string, MachineData[]> = new Map();

  machines.forEach(machine => {
    // Normalize values for comparison
    const clampingForce = parseFloat(machine.clampingForce) || 0;
    const shotSize = parseFloat(machine.shotSize) || 0;
    const screwType = machine.screwType.toLowerCase().trim();

    // Create a key based on similar specs (with tolerance)
    // Group by clamping force ranges (±10%), screw type, and shot size ranges (±15%)
    const forceRange = Math.round(clampingForce / 50) * 50; // Round to nearest 50
    const shotRange = Math.round(shotSize / 10) * 10; // Round to nearest 10
    const groupKey = `${forceRange}-${screwType}-${shotRange}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(machine);
  });

  // Convert groups to comparison table format
  const comparisonTables: any[] = [];

  groups.forEach((groupMachines) => {
    // Group by manufacturer within each spec group
    const byManufacturer = new Map<string, MachineData[]>();
    
    groupMachines.forEach(machine => {
      const mfg = machine.manufacturer;
      if (!byManufacturer.has(mfg)) {
        byManufacturer.set(mfg, []);
      }
      byManufacturer.get(mfg)!.push(machine);
    });

    // Find max number of models per manufacturer in this group
    const maxModels = Math.max(...Array.from(byManufacturer.values()).map(arr => arr.length));

    // Create rows for this comparison group
    for (let i = 0; i < maxModels; i++) {
      const row: any = {};
      
      byManufacturer.forEach((models, manufacturer) => {
        const model = models[i];
        if (model) {
          row[manufacturer] = {
            modelName: model.modelName,
            clampingForce: model.clampingForce,
            tieBarDistance: model.tieBarDistance,
            screwType: model.screwType,
            shotSize: model.shotSize,
            salesType: model.salesType,
            salesPrice: model.salesPrice,
            checkedTime: model.checkedTime,
            customer: model.customer,
            listPrice: model.listPrice,
            freight: model.freight,
            optionPrice: model.optionPrice
          };
        }
      });

      comparisonTables.push(row);
    }
  });

  return comparisonTables;
}
