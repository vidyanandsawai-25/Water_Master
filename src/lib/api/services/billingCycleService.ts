// import axios from "axios";
// import  PaginatedResponse  from "@/lib/api/services";
// import { BillingCycle, BillingCyclePayload } from "@/lib/api/interfaces/billingCycle";

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:44346/api/wtis/billing-cycle-master";

// class BillingCycleService {
//   private async fetchWithAuth<T>(
//     endpoint: string,
//     options: RequestInit = {}
//   ): Promise<T> {
//     const url = `${BASE_URL}${endpoint}`;
//     const defaultHeaders = {
//       "Content-Type": "application/json",
//     };

//     try {
//       const response = await fetch(url, {
//         ...options,
//         headers: {
//           ...defaultHeaders,
//           ...options.headers,
//         },
//       });

//       if (!response.ok) {
//         let errorMessage = `HTTP error! status: ${response.status}`;
//         let errorData = null;
//         try {
//           errorData = await response.json();
//         } catch {
//           errorMessage = response.statusText || errorMessage;
//         }
//         if (errorData?.message) {
//           errorMessage = errorData.message;
//         }
//         throw new Error(errorMessage);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error("API Error:", error);
//       throw error;
//     }
//   }

//   // Fetch all billing cycles with pagination
//   async getAll(params?: {
//     pageNumber?: number;
//     pageSize?: number;
//     sortBy?: string;
//     sortOrder?: string;
//     zoneID?: number;
//     connectionCategoryID?: number;
//     cycleType?: string;
//     financialYear?: number;
//     isActive?: boolean;
//   }): Promise<PaginatedResponse<BillingCycle>> {
//     const queryParams = new URLSearchParams();

//     if (params) {
//       Object.entries(params).forEach(([key, value]) => {
//         if (value !== undefined && value !== null) {
//           queryParams.append(key, value.toString());
//         }
//       });
//     }

//     const endpoint = `?${queryParams.toString()}`;
//     return this.fetchWithAuth<PaginatedResponse<BillingCycle>>(endpoint);
//   }

//   // Fetch a billing cycle by ID
//   async getById(id: number): Promise<BillingCycle> {
//     return this.fetchWithAuth<BillingCycle>(`/${id}`);
//   }

//   // Create a new billing cycle
//   async create(data: BillingCyclePayload): Promise<BillingCycle> {
//     return this.fetchWithAuth<BillingCycle>("", {
//       method: "POST",
//       body: JSON.stringify(data),
//     });
//   }

//   // Update an existing billing cycle by ID
//   async update(id: number, data: Partial<BillingCyclePayload>): Promise<BillingCycle> {
//     return this.fetchWithAuth<BillingCycle>(`/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(data),
//     });
//   }

//   // Delete a billing cycle by ID
//   async delete(id: number): Promise<void> {
//     await this.fetchWithAuth<void>(`/${id}`, {
//       method: "DELETE",
//     });
//   }
// }

// // Create and export a singleton instance of BillingCycleService
// const billingCycleService = new BillingCycleService();
// export default billingCycleService;
