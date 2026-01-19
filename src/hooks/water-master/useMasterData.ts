// Custom hook for master data management (categories, connection types, tap sizes, zones, wards)

import { useState, useEffect } from "react";
import apiService from "@/lib/api/services";
import { toast } from "sonner";

export interface CategoryObj {
  id: number;
  name: string;
}

export interface TypeObj {
  id: number;
  name: string;
}

export interface TapSizeObj {
  id: number;
  name: string;
}

export function useMasterData() {
  const [categories, setCategories] = useState<CategoryObj[]>([]);
  const [connectionTypes, setConnectionTypes] = useState<TypeObj[]>([]);
  const [tapSizes, setTapSizes] = useState<TapSizeObj[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all master data on mount
  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = async () => {
    setIsLoading(true);
    try {
      const [catRes, typeRes, sizeRes, zoneRes, wardRes] = await Promise.all([
        apiService.getConnectionCategories(),
        apiService.getConnectionTypes(),
        apiService.getPipeSizes(),
        apiService.getZones(),
        apiService.getWards(),
      ]);
      setCategories(
        (catRes.items || []).map((cat: any) => ({
          id: cat.CategoryID ?? cat.categoryID ?? cat.id,
          name: cat.CategoryName ?? cat.categoryName ?? cat.name,
        }))
      );
      setConnectionTypes(
        (typeRes.items || []).map((type: any) => ({
          id: type.connectionTypeID ?? type.id,
          name: type.connectionTypeName ?? type.name,
        }))
      );
      setTapSizes(
        (sizeRes.items || []).map((size: any) => ({
          id: size.pipeSizeID ?? size.id,
          name: size.sizeName ?? size.name,
        }))
      );
      setZones(zoneRes.items || []);
      setWards(wardRes.items || []);
    } catch (error) {
      toast.error("Failed to load master data");
    }
    setIsLoading(false);
  };

  // Category operations
  const addCategory = async (category: string) => {
    setIsLoading(true);
    try {
      await apiService.createConnectionCategory({
        categoryName: category,
        isActive: true,
        createdBy: 1,
      });
      await refreshAll();
      toast.success("Category added!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to add category");
    }
    setIsLoading(false);
  };

  const deleteCategory = async (id: number) => {
    setIsLoading(true);
    try {
      await apiService.deleteConnectionCategory(id);
      await refreshAll();
      toast.success("Category deleted!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete category");
    }
    setIsLoading(false);
  };

  // Connection Type operations
  const addConnectionType = async (type: string) => {
    setIsLoading(true);
    try {
      await apiService.createConnectionType({
        connectionTypeName: type,
        isActive: true,
        createdBy: 1,
      });
      await refreshAll();
      toast.success("Connection type added!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to add connection type");
    }
    setIsLoading(false);
  };

  const deleteConnectionType = async (id: number) => {
    setIsLoading(true);
    try {
      await apiService.deleteConnectionType(id);
      await refreshAll();
      toast.success("Connection type deleted!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete connection type");
    }
    setIsLoading(false);
  };

  // Tap Size operations
  const addTapSize = async (size: string) => {
    setIsLoading(true);
    try {
      await apiService.createPipeSize({
        sizeName: size,
        diameterMM: 0,
        isActive: true,
        createdBy: 1,
      });
      await refreshAll();
      toast.success("Tap size added!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to add tap size");
    }
    setIsLoading(false);
  };

  const deleteTapSize = async (id: number) => {
    setIsLoading(true);
    try {
      await apiService.deletePipeSize(id);
      await refreshAll();
      toast.success("Tap size deleted!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete tap size");
    }
    setIsLoading(false);
  };

  // Zone operations
  const addZone = async (zoneName: string) => {
    setIsLoading(true);
    try {
      await apiService.createZone({
        zoneName,
        zoneCode: zoneName,
        isActive: true,
        createdBy: 1,
      });
      await refreshAll();
      toast.success("Zone added!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to add zone");
    }
    setIsLoading(false);
  };

  const deleteZone = async (id: number) => {
    setIsLoading(true);
    try {
      await apiService.deleteZone(id);
      await refreshAll();
      toast.success("Zone deleted!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete zone");
    }
    setIsLoading(false);
  };

  // Ward operations
  const addWard = async (payload: {
  wardName: string;
  wardCode: string;
  zoneID: number;
  isActive: boolean;
  createdBy: number;
}) => {
  return apiService.createWard(payload);
};


  const deleteWard = async (id: number) => {
    setIsLoading(true);
    try {
      await apiService.deleteWard(id);
      await refreshAll();
      toast.success("Ward deleted!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete ward");
    }
    setIsLoading(false);
  };

  return {
    categories,
    connectionTypes,
    tapSizes,
    zones,
    wards,
    isLoading,
    addCategory,
    deleteCategory,
    addConnectionType,
    deleteConnectionType,
    addTapSize,
    deleteTapSize,
    addZone,
    deleteZone,
    addWard,
    deleteWard,
    refreshAll,
  };
}
