/**
 * API Service
 * Handles all HTTP requests to the WTIS backend
 */

import { appConfig } from "@/config/app.config";
import { Service } from "@/types/service.types";

/**
 * Fetches the list of available services from the API
 * @returns Promise<Service[]> - Array of service objects
 */
export async function getServices(): Promise<Service[]> {
  try {
    // In Next.js, we need to configure the fetch differently for self-signed certs
    const fetchOptions: RequestInit = {
      cache: "no-store", // Use 'force-cache' for static data or 'no-store' for dynamic data
      headers: {
        "Content-Type": "application/json",
      },
    };

    // For development with self-signed certificates, we need to use a custom agent
    if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
      // Server-side only
      const https = await import("https");
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });
      // @ts-expect-error - Node.js fetch accepts agent
      fetchOptions.agent = agent;
    }

    const response = await fetch(`${appConfig.api.baseUrl}/Services`, fetchOptions);

    if (!response.ok) {

      return [];
    }

    const data: Service[] = await response.json();
    return data;
  } catch {

    return [];
  }
}

/**
 * API Service
 * Handles all HTTP requests to the WTIS backend
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:44346/api/wtis';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  items?: T;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  items: [
     {
      billingCycleMasterID: number;
      "zoneID": 1,
      "zoneName": "Zone A",
      "zoneCode": "Z-A",
      "connectionCategoryID": 1,
      categoryName: String;
      cycleType: String;
      financialYear: number;
      "billGenerationDate": "2026-01-17T05:41:08.767",
      billPeriodStartDate: number;
      billPeriodEndDate: number;
      "currentPenaltyStartDate": "2026-01-17T05:41:08.767",
      "currentPenaltyEndDate": "2026-01-17T05:41:08.767",
      "pendingPenaltyStartDate": "2026-01-17T05:41:08.767",
      "pendingPenaltyEndDate": "2026-01-17T05:41:08.767",
      "currentPenaltyPercent": 0,
      "pendingPenaltyPercent": 1,
      "isReadingApproved": true,
      "approvedBy": "Ram",
      "numberOfCycles": 1,
      "isActive": true,
      "createdDate": "2026-01-17T05:41:08.767",
      "updatedDate": "2026-01-17T05:42:24.06",
      "createdBy": 1,
      "updatedBy": 0
    }
  ];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Backend Rate structure (matches API)
export interface BackendRate {
  id: number;
  rateID: number;
  zoneID: number;
  zoneName: string;
  zoneCode: string;
  wardID: number;
  wardName: string;
  wardCode: string;
  tapSizeID: number;
  tapSize: string;
  category: string;
  connectionType: string;
  categoryID: number;
  status: string;
  diameterMM: number;
  connectionTypeID: number;
  connectionTypeName: string;
  connectionCategoryID: number;
  categoryName: string;
  minReading: number;
  maxReading: number;
  perLiter: number;
  minimumCharge: number;
  meterOffPenalty: number;
  rate: number;
  year: number;
  remark?: string;
  isActive: boolean;
  createdBy: number;
  ratePerKL: number;
  annualFlatRate: number;
  createdDate: string;
  updatedBy?: number;
  updatedDate?: string;
}

export interface Zone {
  zoneID: number;
  zoneName: string;
  zoneCode: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  updatedBy?: number;
  updatedDate?: string;
}

export interface Ward {
  wardID: number;
  wardName: string;
  wardCode: string;
  zoneID: number;
  zoneName: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  updatedBy?: number;
  updatedDate?: string;
}

export interface ConnectionType {
  connectionTypeID: number;
  connectionTypeName: string;
  description?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  updatedBy?: number;
  updatedDate?: string;
}

export interface ConnectionCategory {
  CategoryID: number;
  CategoryName: string;
  Description?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  updatedBy?: number;
  updatedDate?: string;
}

export interface PipeSize {
  pipeSizeID: number;
  sizeName: string;
  diameterMM: number;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  updatedBy?: number;
  updatedDate?: string;
}

// Billing Cycle Master APIs
export interface BillingCycle {
  id: number;
  zone: string;
  zoneID: number;
  connectionTypeID: number;
  connectionCategoryID: number;
  cycleType: string;
  financialYear: number;
  billGenerationDate: string;
  billPeriodStart: number;
  billPeriodEnd: number;
  currentPenalty: number;
  pendingPenalty: number;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  updatedBy?: number;
  updatedDate?: string;
}

class ApiService {
  private async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (USE_MOCK_DATA) {
      throw new Error('Backend API not available. Using mock data mode.');
    }

    const url = `${BASE_URL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      // Debugging: Log response details
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorData = null;
        try {
          errorData = await response.json();
          console.log("Error response data:", errorData); // Log error response data
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Rate Master APIs
  async getRates(params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    zoneID?: number;
    wardID?: number;
    tapSizeID?: number;
    connectionTypeID?: number;
    connectionCategoryID?: number;
    year?: number;
    isActive?: boolean;
  }): Promise<PaginatedResponse<BackendRate>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/rate-master${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.fetchWithAuth<PaginatedResponse<BackendRate>>(endpoint);
  }

  async getRateById(id: number): Promise<BackendRate> {
    return this.fetchWithAuth<BackendRate>(`/rate-master/${id}`);
  }

  async createRate(data: {
    zoneID: number;
    wardID: number;
    tapSizeID: number;
    connectionTypeID: number;
    connectionCategoryID: number;
    minReading: number;
    maxReading: number;
    perLiter: number;
    minimumCharge: number;
    meterOffPenalty: number;
    rate: number;
    year: number;
    remark?: string;
    isActive: boolean;
    createdBy: number;
  }): Promise<BackendRate> {
    return this.fetchWithAuth<BackendRate>('/rate-master', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRate(
    id: number,
    data: Partial<{
      zoneID: number;
      wardID: number;
      tapSizeID: number;
      connectionTypeID: number;
      connectionCategoryID: number;
      minReading: number;
      maxReading: number;
      perLiter: number;
      minimumCharge: number;
      meterOffPenalty: number;
      rate: number;
      year: number;
      remark: string;
      isActive: boolean;
      updatedBy: number;
    }>
  ): Promise<BackendRate> {
    return this.fetchWithAuth<BackendRate>(`/rate-master/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRate(id: number): Promise<void> {
    await this.fetchWithAuth<void>(`/rate-master/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteMultipleRates(ids: number[]): Promise<void> {
    await Promise.all(
      ids.map(id => this.deleteRate(id))
    );
  }

  // Zone Master APIs
  async getZones(params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Zone>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/zone-master${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.fetchWithAuth<PaginatedResponse<Zone>>(endpoint);
  }

  async createZone(data: {
    zoneName: string;
    zoneCode: string;
    isActive: boolean;
    createdBy: number;
  }): Promise<ApiResponse<Zone>> {
    return this.fetchWithAuth<ApiResponse<Zone>>('/zone-master', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteZone(id: number): Promise<void> {
    await this.fetchWithAuth<void>(`/zone-master/${id}`, { method: "DELETE" });
  }

  // Ward Master APIs
  async getWards(params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Ward>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/ward-master${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.fetchWithAuth<PaginatedResponse<Ward>>(endpoint);
  }

  async createWard(data: {
    wardName: string;
    wardCode: string;
    zoneID: number;
    isActive: boolean;
    createdBy: number;
  }): Promise<ApiResponse<Ward>> {
    return this.fetchWithAuth<ApiResponse<Ward>>('/ward-master', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteWard(id: number): Promise<void> {
    await this.fetchWithAuth<void>(`/ward-master/${id}`, { method: "DELETE" });
  }

  // Connection Type APIs
  async getConnectionTypes(params?: {
    pageNumber?: number;
    pageSize?: number;
    isActive?: boolean;
  }): Promise<PaginatedResponse<ConnectionType>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/connection-type${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.fetchWithAuth<PaginatedResponse<ConnectionType>>(endpoint);
  }

  async createConnectionType(data: {
    connectionTypeName: string;
    description?: string;
    isActive: boolean;
    createdBy: number;
  }): Promise<ConnectionType> {
    return this.fetchWithAuth<ConnectionType>('/connection-type', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteConnectionType(id: number): Promise<void> {
    return this.fetchWithAuth<void>(`/connection-type/${id}`, {
      method: 'DELETE',
    });
  }

  // Connection Category APIs
  async getConnectionCategories(params?: {
    pageNumber?: number;
    pageSize?: number;
    isActive?: boolean;
  }): Promise<PaginatedResponse<ConnectionCategory>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/connection-category${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.fetchWithAuth<PaginatedResponse<ConnectionCategory>>(endpoint);
  }

  async createConnectionCategory(data: {
    categoryName: string;
    description?: string;
    isActive: boolean;
    createdBy: number;
  }): Promise<ConnectionCategory> {
    return this.fetchWithAuth<ConnectionCategory>('/connection-category', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteConnectionCategory(id: number): Promise<void> {
    await this.fetchWithAuth<void>(`/connection-category/${id}`, {
      method: 'DELETE',
    });
  }

  // Pipe Size APIs
  async getPipeSizes(params?: { pageNumber?: number; pageSize?: number; isActive?: boolean }): Promise<PaginatedResponse<PipeSize>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/pipe-size${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.fetchWithAuth<PaginatedResponse<PipeSize>>(endpoint);
  }

  async createPipeSize(data: { sizeName: string; diameterMM: number; isActive: boolean; createdBy: number }): Promise<PipeSize> {
    return this.fetchWithAuth<PipeSize>('/pipe-size', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPipeSizeById(id: number): Promise<PipeSize> {
    return this.fetchWithAuth<PipeSize>(`/pipe-size/${id}`);
  }

  async updatePipeSize(id: number, data: { sizeName: string; diameterMM: number; updatedBy: number }): Promise<PipeSize> {
    return this.fetchWithAuth<PipeSize>(`/pipe-size/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePipeSize(id: number): Promise<void> {
    await this.fetchWithAuth<void>(`/pipe-size/${id}`, {
      method: 'DELETE',
    });
  }

  // Billing Cycle Master APIs
  async getBillingCycles(params?: {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    zoneID?: number;
    connectionTypeID?: number;
    financialYear?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<BillingCycle>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/billing-cycle-master${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await this.fetchWithAuth<PaginatedResponse<BillingCycle>>(endpoint);

    // Debugging: Log the raw API response
    console.log("Raw API response:", response);

    // Ensure all fields are mapped correctly
    if (response.items) {
      response.items = response.items.map((item) => ({
        id: item.id,
        zone: item.zone || item.zoneName || "N/A", // Map zone or fallback to zoneName
        connectionType: item.connectionType || item.categoryName || "N/A", // Map connectionType or fallback to connectionTypeName
        connectionCategory: item.connectionCategory || item.connectionCategoryName || "N/A", // Map connectionCategory or fallback to connectionCategoryName
        cycleType: item.cycleType || "N/A", // Map cycleType
        financialYear: item.financialYear || "N/A", // Map financialYear
        billGenerationDate: item.billGenerationDate || "N/A", // Map billGenerationDate
        billPeriodStart: item.billPeriodStartDate || "N/A", // Map billPeriodStart
        billPeriodEnd: item.billPeriodEndDate || "N/A", // Map billPeriodEnd
        currentPenalty: item.currentPenalty || 0, // Default to 0 if missing
        pendingPenalty: item.pendingPenalty || 0, // Default to 0 if missing
        status: item.isActive ? "Active" : "Inactive", // Map isActive to status
      }));
    }

    return response;
  }

  async createBillingCycle(data: {
    zoneID: number;
    connectionTypeID: number;
    connectionCategoryID: number; // Added connectionCategoryID
    cycleType: string;
    financialYear: string;
    billGenerationDate: string;
    billPeriodStart: string;
    billPeriodEnd: string;
    currentPenalty: number;
    pendingPenalty: number;
    isActive: boolean;
    createdBy: number;
    createdDate: string; // Added createdDate
    updatedDate: string; // Added updatedDate
  }): Promise<ApiResponse<BillingCycle>> {
    // Ensure the endpoint matches the backend API
    return this.fetchWithAuth<ApiResponse<BillingCycle>>('/billing-cycle-master', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Ensure correct headers
      },
      body: JSON.stringify({
        zoneID: data.zoneID,
        connectionTypeID: data.connectionTypeID,
        connectionCategoryID: data.connectionCategoryID, // Include connectionCategoryID
        cycleType: data.cycleType,
        financialYear: data.financialYear,
        billGenerationDate: data.billGenerationDate,
        billPeriodStart: data.billPeriodStart,
        billPeriodEnd: data.billPeriodEnd,
        currentPenalty: data.currentPenalty,
        pendingPenalty: data.pendingPenalty,
        isActive: data.isActive,
        createdBy: data.createdBy,
        createdDate: data.createdDate, // Include createdDate
        updatedDate: data.updatedDate, // Include updatedDate
      }),
    });
  }

  async updateBillingCycle(
    id: number,
    data: Partial<{
      zoneID: number;
      connectionTypeID: number;
      cycleType: string;
      financialYear: string;
      billGenerationDate: string;
      billPeriodStart: string;
      billPeriodEnd: string;
      currentPenalty: number;
      pendingPenalty: number;
      isActive: boolean;
      updatedBy: number;
    }>
  ): Promise<ApiResponse<BillingCycle>> {
    return this.fetchWithAuth<ApiResponse<BillingCycle>>(`/billing-cycle/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBillingCycle(id: number): Promise<void> {
    if (!id) {
      throw new Error("Invalid ID: Cannot delete billing cycle without a valid ID.");
    }

    await this.fetchWithAuth<void>(`/billing-cycle/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance of ApiService
const apiService = new ApiService();
export default apiService;
