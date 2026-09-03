export type PondStatus = 'Kosong' | 'Digunakan' | 'Perawatan';
export type CycleStatus = 'Aktif' | 'Selesai' | 'Dibatalkan';
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Pond {
  id: string;
  userId: string;
  name: string;
  size: string;
  capacity: number;
  type: string;
  status: PondStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  cycles?: CultivationCycle[];
  _count?: {
    cycles?: number;
    mortalities?: number;
    harvests?: number;
  };
}

export interface CultivationCycle {
  id: string;
  userId: string;
  pondId: string;
  pond?: Pond;
  code: string;
  startDate: string;
  harvestEstimateDate?: string | null;
  endDate?: string | null;
  initialFishCount: number;
  seedPricePerFish: number;
  totalSeedCost: number;
  seedSize: string;
  feedType: string;
  status: CycleStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  mortalities?: FishMortality[];
  harvests?: Harvest[];
  feedRecords?: FeedRecord[];
  transactions?: Transaction[];
}

export interface FishMortality {
  id: string;
  cycleId: string;
  cycle?: CultivationCycle;
  pondId: string;
  pond?: Pond;
  date: string;
  count: number;
  cause: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Harvest {
  id: string;
  cycleId: string;
  cycle?: CultivationCycle;
  pondId: string;
  pond?: Pond;
  date: string;
  fishCount: number;
  totalWeightKg: number;
  pricePerKg: number;
  totalRevenue: number;
  buyerName: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedRecord {
  id: string;
  cycleId: string;
  cycle?: CultivationCycle;
  date: string;
  feedType: string;
  weightKg: number;
  pricePerKg: number;
  totalCost: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  cycleId?: string | null;
  cycle?: CultivationCycle | null;
  type: TransactionType;
  category: string;
  source: string;
  amount: number;
  date: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  totalProfit: number;
  totalLoss: number;
  cashBalance: number;
  totalCultivatedFish: number;
  totalDeadFish: number;
  totalHarvestedFish: number;
  activeCyclesCount: number;
  completedCyclesCount: number;
  mortalityRateOverall: number;
  survivalRateOverall: number;
}
