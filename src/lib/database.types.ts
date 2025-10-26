export type UserRole = 'farmer' | 'fpo' | 'processor' | 'retailer' | 'policymaker' | 'admin';
export type CropStatus = 'planned' | 'planted' | 'growing' | 'harvested';
export type AdvisoryType = 'crop_planning' | 'weather' | 'pest_management' | 'market_price';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';
export type InventoryStatus = 'procured' | 'stored' | 'in_transit' | 'processed' | 'sold';
export type WarehouseStatus = 'active' | 'inactive' | 'maintenance';
export type LogisticsStatus = 'scheduled' | 'in_transit' | 'delivered' | 'delayed';
export type TraceabilityStage = 'farm' | 'procurement' | 'storage' | 'processing' | 'retail';
export type FacilityType = 'credit' | 'insurance' | 'subsidy';
export type FacilityStatus = 'applied' | 'approved' | 'disbursed' | 'rejected' | 'completed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          organization: string | null;
          phone: string | null;
          location: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          organization?: string | null;
          phone?: string | null;
          location?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          organization?: string | null;
          phone?: string | null;
          location?: any;
          updated_at?: string;
        };
      };
      crops: {
        Row: {
          id: string;
          farmer_id: string;
          crop_type: string;
          area_hectares: number;
          planting_date: string;
          expected_harvest_date: string;
          actual_harvest_date: string | null;
          status: CropStatus;
          location: any;
          created_at: string;
          updated_at: string;
        };
      };
      advisories: {
        Row: {
          id: string;
          advisory_type: AdvisoryType;
          target_audience: string | null;
          title: string;
          content: string;
          priority: PriorityLevel;
          valid_until: string | null;
          metadata: any;
          created_at: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          crop_id: string | null;
          owner_id: string;
          location_id: string | null;
          crop_type: string;
          quantity_kg: number;
          quality_grade: string | null;
          procurement_date: string;
          status: InventoryStatus;
          price_per_kg: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      warehouses: {
        Row: {
          id: string;
          name: string;
          operator_id: string | null;
          location: any;
          capacity_tonnes: number;
          current_utilization_tonnes: number;
          facilities: any;
          status: WarehouseStatus;
          created_at: string;
          updated_at: string;
        };
      };
      logistics: {
        Row: {
          id: string;
          inventory_id: string;
          from_location: any;
          to_location: any;
          transporter_id: string | null;
          vehicle_number: string | null;
          dispatch_date: string;
          expected_arrival: string;
          actual_arrival: string | null;
          status: LogisticsStatus;
          tracking_data: any;
          created_at: string;
          updated_at: string;
        };
      };
      traceability: {
        Row: {
          id: string;
          batch_id: string;
          crop_id: string | null;
          inventory_id: string | null;
          stage: TraceabilityStage;
          actor_id: string;
          timestamp: string;
          location: any;
          action: string;
          hash: string;
          previous_hash: string | null;
          metadata: any;
          created_at: string;
        };
      };
      market_prices: {
        Row: {
          id: string;
          crop_type: string;
          market_location: string;
          price_per_kg: number;
          date: string;
          is_prediction: boolean;
          confidence_score: number | null;
          source: string;
          created_at: string;
        };
      };
      credit_facilities: {
        Row: {
          id: string;
          farmer_id: string;
          facility_type: FacilityType;
          provider: string;
          amount: number;
          status: FacilityStatus;
          application_date: string;
          approval_date: string | null;
          performance_score: number | null;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
      };
      analytics_metrics: {
        Row: {
          id: string;
          metric_type: string;
          time_period: string;
          period_start: string;
          period_end: string;
          region: string;
          crop_type: string | null;
          value: number;
          unit: string;
          metadata: any;
          created_at: string;
        };
      };
    };
  };
}
