/**
 * Water Rate Actions
 * Business logic layer integrating with real WTIS Backend API
 * Handles validation, error handling, and data transformation
 */

import { WaterRate } from "@/constants/waterRates";
import apiService, { type BackendRate } from "@/lib/api/services";
// import { mockDataService } from "@/services/water-master/mockData";
import { toast } from "sonner";

// Check if we should use mock data (when backend is unavailable)
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Current user ID (should come from auth context in production)
const CURRENT_USER_ID = 1;
/**
 * Zone Actions
 */
export const zoneActions = {
  fetchZones: async (): Promise<ActionResult<{ id: number; name: string }[]>> => {
    try {
      // Use mock data if API is unavailable
      if (USE_MOCK_DATA) {
        const zones = await mockDataService.zones.getAll();
        const mappedZones = zones.map((name: string, idx: number) => ({ id: idx + 1, name }));
        return { success: true, data: mappedZones };
      }

      const response = await apiService.getZones({
        pageNumber: 1,
        pageSize: 100,
        isActive: true,
      });
      const zones = response.items.map((zone: any) => ({ id: zone.zoneID ?? zone.id, name: zone.zoneName ?? zone.name }));
      return { success: true, data: zones };
    } catch (error) {
      // Fallback to mock data on error
      console.warn('API call failed for zones, falling back to mock data:', error);
      const zones = await mockDataService.zones.getAll();
      const mappedZones = zones.map((name: string, idx: number) => ({ id: idx + 1, name }));
      return { success: true, data: mappedZones };
    }
  },

  addZone: async (name: string): Promise<ActionResult<string>> => {
    try {
      if (!name || !name.trim()) {
        throw new Error("Zone name is required");
      }
      const response = await apiService.createZone({
        zoneName: name.trim(),
        description: `${name.trim()} zone`,
        isActive: true,
        createdBy: CURRENT_USER_ID,
      });
      toast.success("✅ Zone added successfully");
      return { success: true, data: response.zoneName };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add zone";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  deleteZone: async (id: number): Promise<ActionResult<void>> => {
    try {
      await apiService.deleteZone(id);
      toast.success("✅ Zone deleted successfully");
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete zone";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },
};
const CURRENT_YEAR = new Date().getFullYear();

// Lookup maps (should be loaded from API on app init)
const lookupMaps = {
  zones: new Map<string, number>(),
  wards: new Map<string, number>(),
  categories: new Map<string, number>(),
  connectionTypes: new Map<string, number>(),
  tapSizes: new Map<string, number>(),
};

/**
 * Action result type
 */
type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Map backend rate to frontend format
function mapBackendToFrontend(backendRate: BackendRate): WaterRate {
  return {
    id: backendRate.rateID,
    zoneNo: backendRate.zoneCode || '',
    wardNo: backendRate.wardCode || '',
    category: (backendRate.categoryName || 'Unknown') as any,
    connectionType: (backendRate.connectionTypeName || 'Unknown') as any,
    tapSize: backendRate.tapSize || '',
    ratePerKL: backendRate.perLiter || 0,
    annualFlatRate: backendRate.rate || 0,
    minimumCharge: backendRate.minimumCharge || 0,
    meterOffPenalty: backendRate.meterOffPenalty || 0,
    status: backendRate.isActive ? "Active" : "Inactive",
  };
}

// Map frontend rate to backend format for creation
function mapFrontendToBackendCreate(rate: Omit<WaterRate, "id">): any {
  // Get IDs from lookup maps or use defaults
  const zoneID = lookupMaps.zones.get(rate.zoneNo) || 1;
  const wardID = lookupMaps.wards.get(rate.wardNo) || 1;
  const categoryID = lookupMaps.categories.get(rate.category) || 1;
  const connectionTypeID = lookupMaps.connectionTypes.get(rate.connectionType) || 1;
  const tapSizeID = lookupMaps.tapSizes.get(rate.tapSize) || 1;

  return {
    zoneID,
    wardID,
    tapSizeID,
    connectionTypeID: connectionTypeID,
    connectionCategoryID: categoryID,
    minReading: 0,
    maxReading: 99999,
    perLiter: rate.ratePerKL,
    minimumCharge: rate.minimumCharge,
    meterOffPenalty: rate.meterOffPenalty,
    rate: rate.annualFlatRate,
    year: CURRENT_YEAR,
    remark: `${rate.category} - ${rate.connectionType}`,
    isActive: rate.status === "Active",
    createdBy: CURRENT_USER_ID,
  };
}

/**
 * Water Rate Actions
 */
export const waterRateActions = {
  /**
   * Fetch all water rates
   */
  fetchRates: async (): Promise<ActionResult<WaterRate[]>> => {
    try {
      // Use mock data if API is unavailable
      if (USE_MOCK_DATA) {
        const rates = await mockDataService.rates.getAll();
        return { success: true, data: rates };
      }

      const response = await apiService.getRates({
        pageNumber: 1,
        pageSize: 1000, // Get all rates
        isActive: undefined, // Include both active and inactive
      });
      
      const rates = response.items.map(mapBackendToFrontend);
      return { success: true, data: rates };
    } catch (error) {
      // Fallback to mock data on error
      console.warn('API call failed, falling back to mock data:', error);
      const rates = await mockDataService.rates.getAll();
      return { success: true, data: rates };
    }
  },

  /**
   * Fetch single rate by ID
   */
  fetchRateById: async (id: number): Promise<ActionResult<WaterRate>> => {
    try {
      const backendRate = await apiService.getRateById(id);
      const rate = mapBackendToFrontend(backendRate);
      return { success: true, data: rate };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch rate";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  /**
   * Create new rate
   */
  createRate: async (rate: Omit<WaterRate, "id">): Promise<ActionResult<WaterRate>> => {
    try {
      // Validation
      if (!rate.zoneNo || !rate.wardNo) {
        throw new Error("Zone and Ward are required");
      }
      if (!rate.category || !rate.connectionType) {
        throw new Error("Category and Connection Type are required");
      }
      if (rate.ratePerKL < 0 || rate.minimumCharge < 0) {
        throw new Error("Rates must be positive numbers");
      }

      // Ensure zone exists or add it
      const zoneResult = await zoneActions.addZone(rate.zoneNo);
      if (!zoneResult.success) {
        throw new Error("Failed to add zone: " + (zoneResult.error || "Unknown error"));
      }

      // Use mock data if API is unavailable
      if (USE_MOCK_DATA) {
        const newRate = await mockDataService.rates.create(rate);
        toast.success("✅ Rate created successfully (Mock Data)");
        return { success: true, data: newRate };
      }

      const backendData = mapFrontendToBackendCreate(rate);
      const createdRate = await apiService.createRate(backendData);

      const newRate = mapBackendToFrontend(createdRate);
      toast.success("✅ Rate created successfully");
      return { success: true, data: newRate };
    } catch (error) {
      // Fallback to mock data on error
      if (!USE_MOCK_DATA) {
        console.warn('API call failed, falling back to mock data:', error);
        try {
          const newRate = await mockDataService.rates.create(rate);
          toast.success("✅ Rate created successfully (Mock Data)");
          return { success: true, data: newRate };
        } catch (mockError) {
          const message = mockError instanceof Error ? mockError.message : "Failed to create rate";
          toast.error(`❌ ${message}`);
          return { success: false, error: message };
        }
      }
      const message = error instanceof Error ? error.message : "Failed to create rate";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  /**
   * Update existing rate
   */
  updateRate: async (
    id: number,
    updates: Partial<WaterRate>
  ): Promise<ActionResult<WaterRate>> => {
    try {
      // Use mock data if API is unavailable
      if (USE_MOCK_DATA) {
        const updatedRate = await mockDataService.rates.update(id, updates);
        toast.success("✅ Rate updated successfully (Mock Data)");
        return { success: true, data: updatedRate };
      }

      // Fetch current rate to get all fields
      const currentRate = await apiService.getRateById(id);

      // Build complete backend update payload with all required fields
      const backendUpdates: any = {
        zoneID: currentRate.zoneID,
        wardID: currentRate.wardID,
        tapSizeID: currentRate.tapSizeID,
        connectionTypeID: currentRate.connectionTypeID,
        connectionCategoryID: currentRate.connectionCategoryID,
        minReading: currentRate.minReading,
        maxReading: currentRate.maxReading,
        year: currentRate.year,
        remark: currentRate.remark,
        updatedBy: CURRENT_USER_ID,
      };

      // Apply updates
      if (updates.ratePerKL !== undefined) {
        backendUpdates.perLiter = updates.ratePerKL;
      } else {
        backendUpdates.perLiter = currentRate.perLiter;
      }
      
      if (updates.annualFlatRate !== undefined) {
        backendUpdates.rate = updates.annualFlatRate;
      } else {
        backendUpdates.rate = currentRate.rate;
      }
      
      if (updates.minimumCharge !== undefined) {
        backendUpdates.minimumCharge = updates.minimumCharge;
      } else {
        backendUpdates.minimumCharge = currentRate.minimumCharge;
      }
      
      if (updates.meterOffPenalty !== undefined) {
        backendUpdates.meterOffPenalty = updates.meterOffPenalty;
      } else {
        backendUpdates.meterOffPenalty = currentRate.meterOffPenalty;
      }
      
      if (updates.status !== undefined) {
        backendUpdates.isActive = updates.status === "Active";
      } else {
        backendUpdates.isActive = currentRate.isActive;
      }

      const response = await apiService.updateRate(id, backendUpdates);

      const updatedRate = mapBackendToFrontend(response);
      toast.success("✅ Rate updated successfully");
      return { success: true, data: updatedRate };
    } catch (error) {
      // Fallback to mock data on error
      if (!USE_MOCK_DATA) {
        console.warn('API call failed, falling back to mock data:', error);
        try {
          const updatedRate = await mockDataService.rates.update(id, updates);
          toast.success("✅ Rate updated successfully (Mock Data)");
          return { success: true, data: updatedRate };
        } catch (mockError) {
          const message = mockError instanceof Error ? mockError.message : "Failed to update rate";
          toast.error(`❌ ${message}`);
          return { success: false, error: message };
        }
      }
      const message = error instanceof Error ? error.message : "Failed to update rate";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  /**
   * Delete rate
   */
  deleteRate: async (id: number): Promise<ActionResult<void>> => {
    try {
      // Use mock data if API is unavailable
      if (USE_MOCK_DATA) {
        await mockDataService.rates.delete(id);
        toast.success("✅ Rate deleted successfully (Mock Data)");
        return { success: true };
      }

      await apiService.deleteRate(id);

      toast.success("✅ Rate deleted successfully");
      return { success: true };
    } catch (error) {
      // Fallback to mock data on error
      if (!USE_MOCK_DATA) {
        console.warn('API call failed, falling back to mock data:', error);
        try {
          await mockDataService.rates.delete(id);
          toast.success("✅ Rate deleted successfully (Mock Data)");
          return { success: true };
        } catch (mockError) {
          const message = mockError instanceof Error ? mockError.message : "Failed to delete rate";
          toast.error(`❌ ${message}`);
          return { success: false, error: message };
        }
      }
      const message = error instanceof Error ? error.message : "Failed to delete rate";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  /**
   * Delete multiple rates
   */
  deleteMultipleRates: async (ids: number[]): Promise<ActionResult<void>> => {
    try {
      if (ids.length === 0) {
        throw new Error("No rates selected");
      }

      // Use mock data if API is unavailable
      if (USE_MOCK_DATA) {
        for (const id of ids) {
          await mockDataService.rates.delete(id);
        }
        toast.success(`✅ ${ids.length} rate(s) deleted successfully (Mock Data)`);
        return { success: true };
      }

      await apiService.deleteMultipleRates(ids);

      toast.success(`✅ ${ids.length} rate(s) deleted successfully`);
      return { success: true };
    } catch (error) {
      // Fallback to mock data on error
      if (!USE_MOCK_DATA) {
        console.warn('API call failed, falling back to mock data:', error);
        try {
          for (const id of ids) {
            await mockDataService.rates.delete(id);
          }
          toast.success(`✅ ${ids.length} rate(s) deleted successfully (Mock Data)`);
          return { success: true };
        } catch (mockError) {
          const message = mockError instanceof Error ? mockError.message : "Failed to delete rates";
          toast.error(`❌ ${message}`);
          return { success: false, error: message };
        }
      }
      const message = error instanceof Error ? error.message : "Failed to delete rates";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  /**
   * Toggle rate status
   */
  toggleRateStatus: async (id: number): Promise<ActionResult<WaterRate>> => {
    try {
      // First fetch current rate to get current status
      const currentRate = await apiService.getRateById(id);
      
      // Toggle the status
      const newStatus = !currentRate.isActive;
      
      const response = await apiService.updateRate(id, {
        isActive: newStatus,
        updatedBy: CURRENT_USER_ID,
      });

      const updatedRate = mapBackendToFrontend(response);
      toast.info(`Status changed to ${newStatus ? "Active" : "Inactive"}`);
      return { success: true, data: updatedRate };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to toggle status";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  /**
   * Export rates to CSV
   */
  exportToCSV: async (rates: WaterRate[]): Promise<ActionResult<void>> => {
    try {
      const headers = [
        "ID",
        "Zone",
        "Ward",
        "Category",
        "Connection Type",
        "Tap Size",
        "Rate per KL",
        "Annual Flat Rate",
        "Minimum Charge",
        "Meter Off Penalty",
        "Status",
      ];

      const rows = rates.map((rate) => [
        rate.id,
        rate.zoneNo,
        rate.wardNo,
        rate.category,
        rate.connectionType,
        rate.tapSize,
        rate.ratePerKL,
        rate.annualFlatRate,
        rate.minimumCharge,
        rate.meterOffPenalty,
        rate.status,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `water-rates-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("✅ CSV exported successfully");
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to export CSV";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },
};

/**
 * Category Actions
 */
export const categoryActions = {
  fetchCategories: async (): Promise<ActionResult<{ id: number; name: string }[]>> => {
    try {
      // Use mock data if API is unavailable
      if (USE_MOCK_DATA) {
        const categories = await mockDataService.categories.getAll();
        // Map string[] to { id, name }[] if mock returns string[]
        const mappedCategories = categories.map((name: string, idx: number) => ({ id: idx + 1, name }));
        return { success: true, data: mappedCategories };
      }

      const response = await apiService.getConnectionCategories({
        pageNumber: 1,
        pageSize: 100,
        isActive: true,
      });
      // Robustly handle both array and object response
      let items = Array.isArray(response.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : [];
      // If items is empty, but response itself is an array
      if (items.length === 0 && Array.isArray(response)) {
        items = response;
      }
      const categories = items.map((cat: any, idx: number) => ({
        id: cat.CategoryID ?? cat.categoryID ?? cat.id ?? idx + 1,
        name: cat.CategoryName ?? cat.categoryName ?? cat.name ?? ''
      }));
      return { success: true, data: categories };
    } catch (error) {
      // Fallback to mock data on error
      console.warn('API call failed for categories, falling back to mock data:', error);
      const categories = await mockDataService.categories.getAll();
      const mappedCategories = categories.map((name: string, idx: number) => ({ id: idx + 1, name }));
      return { success: true, data: mappedCategories };
    }
  },

  addCategory: async (name: string): Promise<ActionResult<string>> => {
    try {
      if (!name || !name.trim()) {
        throw new Error("Category name is required");
      }

      // Use real API endpoint
      const response = await apiService.createConnectionCategory({
        categoryName: name.trim(),
        description: `${name.trim()} category`,
        isActive: true,
        createdBy: CURRENT_USER_ID,
      });
      toast.success("✅ Category added successfully");
      return { success: true, data: response.CategoryName };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add category";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  deleteCategory: async (id: number): Promise<ActionResult<void>> => {
    try {
      await apiService.deleteConnectionCategory(id);
      toast.success("✅ Category deleted successfully");
      return { success: true };
      // Note: Backend doesn't support delete by name, only by ID
      // In production, you'd call the backend with the id
      toast.info("Category deletion requires ID - feature pending");
      return { success: false, error: "Not implemented" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete category";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },
};

/**
 * Connection Type Actions
 */
export const connectionTypeActions = {
  fetchConnectionTypes: async (): Promise<ActionResult<{ id: number; name: string }[]>> => {
    try {
      // Use mock data if API is unavailable
      if (USE_MOCK_DATA) {
        const types = await mockDataService.connectionTypes.getAll();
        // Map string[] to { id, name }[] if mock returns string[]
        const mappedTypes = types.map((name: string, idx: number) => ({ id: idx + 1, name }));
        return { success: true, data: mappedTypes };
      }

      const response = await apiService.getConnectionTypes({
        pageNumber: 1,
        pageSize: 100,
        isActive: true,
      });
      // Map backend to { id, name }
      const types = response.items.map((type: any) => ({ id: type.connectionTypeID, name: type.connectionTypeName }));
      return { success: true, data: types };
    } catch (error) {
      // Fallback to mock data on error
      console.warn('API call failed for connection types, falling back to mock data:', error);
      const types = await mockDataService.connectionTypes.getAll();
      const mappedTypes = types.map((name: string, idx: number) => ({ id: idx + 1, name }));
      return { success: true, data: mappedTypes };
    }
  },

  addConnectionType: async (name: string): Promise<ActionResult<string>> => {
    try {
      if (!name || !name.trim()) {
        throw new Error("Connection type name is required");
      }

      // Use real API endpoint
      const response = await apiService.createConnectionType({
        connectionTypeName: name.trim(),
        description: `${name.trim()} connection`,
        isActive: true,
        createdBy: CURRENT_USER_ID,
      });
      toast.success("✅ Connection type added successfully");
      return { success: true, data: response.connectionTypeName };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add connection type";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  deleteConnectionType: async (id: number): Promise<ActionResult<void>> => {
    try {
      await apiService.deleteConnectionType(id);
      toast.success("✅ Connection type deleted successfully");
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete connection type";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },
};


/**
 * Ward Actions
 */
export const wardActions = {
  fetchWards: async (): Promise<ActionResult<{ id: number; name: string }[]>> => {
    try {
      // Use mock data if API is unavailable
      if (USE_MOCK_DATA) {
        const wards = await mockDataService.wards.getAll();
        const mappedWards = wards.map((name: string, idx: number) => ({ id: idx + 1, name }));
        return { success: true, data: mappedWards };
      }

      const response = await apiService.getWards({
        pageNumber: 1,
        pageSize: 100,
        isActive: true,
      });
      const wards = response.items.map((ward: any) => ({ id: ward.wardID ?? ward.id, name: ward.wardName ?? ward.name }));
      return { success: true, data: wards };
    } catch (error) {
      // Fallback to mock data on error
      console.warn('API call failed for wards, falling back to mock data:', error);
      const wards = await mockDataService.wards.getAll();
      const mappedWards = wards.map((name: string, idx: number) => ({ id: idx + 1, name }));
      return { success: true, data: mappedWards };
    }
  },

  // Accept wardData object for backend compatibility
  addWard: async (wardData: {
    wardName: string;
    wardCode: string;
    zoneID: number;
    isActive: boolean;
    createdBy: number;
  }): Promise<ActionResult<string>> => {
    try {
      if (!wardData.wardName || !wardData.wardName.trim()) {
        throw new Error("Ward name is required");
      }
      if (!wardData.zoneID) {
        throw new Error("Zone is required");
      }
      const response = await apiService.createWard(wardData);
      // Success if backend returns success or wardName
      if (response?.success || response?.wardName) {
        toast.success("✅ Ward added successfully");
        return { success: true, data: response.wardName || wardData.wardName };
      }
      throw new Error(response?.message || "Failed to add ward");
    } catch (error: any) {
      const message = error?.message || "Failed to add ward";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  deleteWard: async (id: number): Promise<ActionResult<void>> => {
    try {
      await apiService.deleteWard(id);
      toast.success("✅ Ward deleted successfully");
      return { success: true };
    } catch (error: any) {
      const message = error?.message || "Failed to delete ward";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },
};

export const tapSizeActions = {
  // Fetch all pipe sizes
  fetchTapSizes: async (): Promise<ActionResult<{ id: number; name: string }[]>> => {
    try {
      const response = await apiService.getPipeSizes({
        pageNumber: 1,
        pageSize: 100,
        isActive: true,
      });
      const sizes = response.items.map((item: any) => ({
        id: item.id ?? item.pipeSizeID ?? item.PipeSizeID,
        name: item.name ?? item.sizeName ?? item.SizeName,
      }));
      return { success: true, data: sizes };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch pipe sizes";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  // Add a new pipe size
  addTapSize: async (name: string): Promise<ActionResult<{ id: number; name: string }>> => {
    try {
      if (!name || !name.trim()) {
        throw new Error("Pipe size is required");
      }
      const response = await apiService.createPipeSize({
        sizeName: name.trim(),
        diameterMM: parseFloat(name.trim()), // TODO: Replace 0 with actual diameter value if available
        isActive: true,
        createdBy: CURRENT_USER_ID,
      });
      toast.success("✅ Pipe size added successfully");
      return { success: true, data: { id: response.pipeSizeID , name: response.sizeName} };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add pipe size";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  // Get a single pipe size by ID
  fetchTapSizeById: async (id: number): Promise<ActionResult<{ id: number; name: string }>> => {
    try {
      const response = await apiService.getPipeSizeById(id);
      return { success: true, data: { id: response.pipeSizeID, name: response.sizeName } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch pipe size";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  // Update a pipe size by ID
  updateTapSize: async (id: number, name: string): Promise<ActionResult<{ id: number; name: string }>> => {
    try {
      const response = await apiService.updatePipeSize(id, {
        sizeName: name.trim(),
        diameterMM: 0, // TODO: Replace 0 with actual diameter value if available
        updatedBy: CURRENT_USER_ID,
      });
      toast.success("✅ Pipe size updated successfully");
      return { success: true, data: { id: response.pipeSizeID, name: response.sizeName } };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update pipe size";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },

  // Delete a pipe size by ID
  deleteTapSize: async (id: number): Promise<ActionResult<void>> => {
    try {
      await apiService.deletePipeSize(id);
      toast.success("✅ Pipe size deleted successfully");
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete pipe size";
      toast.error(`❌ ${message}`);
      return { success: false, error: message };
    }
  },
};



