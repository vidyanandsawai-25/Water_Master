export type RateStatus = 'Active' | 'Inactive';

export type ConnectionType = 'Meter' | 'No Meter';

export interface WaterRate {
  id: number;
  zoneNo?: string;
  wardNo?: string;
  category: string;
  connectionType: ConnectionType;
  tapSize: string;
  ratePerKL: number;
  annualFlatRate: number;
  minimumCharge: number;
  meterOffPenalty: number;
  status: RateStatus;
}

export interface RateMasterFormData {
  zoneNo?: string;
  wardNo?: string;
  category: string;
  connectionType: ConnectionType;
  tapSize: string;
  ratePerKL: number;
  annualFlatRate: number;
  minimumCharge: number;
  meterOffPenalty: number;
  status: RateStatus;
}
