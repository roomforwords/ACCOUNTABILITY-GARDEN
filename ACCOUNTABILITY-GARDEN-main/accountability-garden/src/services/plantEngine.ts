// ==========================================
// PLANT ENGINE: BANYAN TREE GROWTH SYSTEM ADAPTER
// Replaced generic plants with the dedicated Banyan Tree Growth System
// ==========================================

import {
  Commitment,
  DailyRecord,
  PlantArchetype,
  BanyanGrowthState,
  BanyanStage
} from '../types';
import { BanyanEngine } from './banyanEngine';
import { getLocalDateString } from '../utils/dateUtils';

export type PlantStage = BanyanStage;
export type PlantGrowthState = BanyanGrowthState;

export const ARCHETYPE_CONFIG: Record<PlantArchetype, {
  label: string;
  defaultCategory: string;
  stemColor: string;
  foliageColor: string;
  growthFactor: number;
  description: string;
}> = {
  banyan: {
    label: 'Banyan Tree',
    defaultCategory: 'All Commitments',
    stemColor: '#5c3d2e',
    foliageColor: '#2d6a4f',
    growthFactor: 1.0,
    description: 'Immense spreading canopy, descending aerial prop roots, and infinite permanent growth.'
  }
};

export function calculatePlantGrowth(
  commitment: Commitment,
  records: DailyRecord[],
  currentDate: string = getLocalDateString()
): BanyanGrowthState {
  return BanyanEngine.calculateBanyanGrowth(commitment, records, currentDate);
}
