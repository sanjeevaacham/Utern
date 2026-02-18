
export enum DesignType {
  FLYOVER = 'Grade Separated (Flyover)',
  MEDIAN_POCKET = 'At-Grade Median Pocket',
  BULGE = 'Flared Median U-Turn'
}

export interface DesignConfig {
  l1Width: number;
  l2Width: number;
  l3Width: number;
  medianWidth: number;
  trafficSpeed: number;
  uTurnType: DesignType;
}

export interface TrafficStats {
  throughput: number;
  safetyScore: number;
  costEstimate: string;
}

export interface TurningRadiusData {
  carRadius: number;
  busRadius: number;
  innerSwept: number;
  outerSwept: number;
}
