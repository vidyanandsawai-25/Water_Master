'use client';

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Droplet,
  TrendingUp,
  Activity,
  CheckCircle2,
  X,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/common/ratemaster/dialog";
import { Language } from "@/app/page";
import { Button } from "@/components/common/ratemaster/button";
import { Input } from "@/components/common/ratemaster/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ratemaster/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Settings, IndianRupee, FileText, Zap } from "lucide-react";
import { Badge } from "@/components/common/ratemaster/badge";
import { BillingCycleTab } from "./BillingCycleTab";
import apiService, { BackendRate, Zone, Ward, ConnectionType, ConnectionCategory, PipeSize } from "@/lib/api/services";
import { useMasterData } from "@/hooks/water-master/useMasterData";
import { RateTable } from "@/components/modules/water-tax/ratemaster/RateTable"; // Adjust path as needed
import { categoryActions, connectionTypeActions, tapSizeActions, waterRateActions } from "@/app/ratemaster/action"; // Adjust path if needed
import { Label } from "@/components/common/ratemaster/label";

interface RateMasterProps {
  language: Language;
}

interface WaterRate {
  id: number;
  category: string;
  connectionType: "Meter" | "No Meter";
  tapSize: string;
  ratePerKL: number;
  annualFlatRate: number;
  minimumCharge: number;
  meterOffPenalty: number;
  status: "Active" | "Inactive";
}

export function RateMaster({ language }: RateMasterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedConnectionType, setSelectedConnectionType] = useState("all");
  const [selectedTapSize, setSelectedTapSize] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<WaterRate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [rates, setRates] = useState<BackendRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [wardSearch, setWardSearch] = useState("");
  const [selectedZoneID, setSelectedZoneID] = useState("");
  const [editingWardId, setEditingWardId] = useState<number | null>(null);
  const [editingWardValue, setEditingWardValue] = useState("");

  // New state for search queries
  const [zoneSearchQuery, setZoneSearchQuery] = useState("");
  const [wardSearchQuery, setWardSearchQuery] = useState("");

  // Use custom hook for master data
  const {
    categories,
    connectionTypes,
    tapSizes,
    zones,
    wards,
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
    isLoading: masterLoading,
  } = useMasterData();

  // Helper arrays for searchable dropdowns (move here, after zones/wards are initialized)
  const filteredZones = zones
    .filter(z => z.zoneName?.toLowerCase().includes(zoneSearchQuery.toLowerCase()))
    .map(z => z.zoneName);

  const filteredWards = wards
    .filter(w => w.wardName?.toLowerCase().includes(wardSearchQuery.toLowerCase()))
    .map(w => w.wardName);

  // Translations
  const translations = {
    mr: {
      title: "पाणी दर मास्टर",
      subtitle: "Category, Connection Type आणि Tap Size नुसार दर व्यवस्थापन",
      totalRates: "एकूण दर",
      meterRates: "मीटर कनेक्शन दर",
      nonMeterRates: "नॉन-मीटर दर",
      activeRates: "सक्रिय दर",
      searchPlaceholder: "Category / Type / Tap Size शोधा",
      category: "Category",
      connectionType: "Connection Type",
      tapSize: "Tap Size",
      addNewRate: "नवीन दर जोडा",
      allCategories: "सर्व Categories",
      allTypes: "सर्व Types",
      allSizes: "सर्व Sizes",
      tableCategory: "Category",
      tableConnectionType: "Connection Type",
      tableTapSize: "Tap / Pipe Size",
      tableRatePerKL: "Rate per KL",
      tableAnnualRate: "Annual Flat Rate",
      tableMinCharge: "Minimum Charge",
      tableMeterPenalty: "Meter Off Penalty",
      tableStatus: "Status",
      tableActions: "Actions",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      edit: "Edit",
      disable: "Disable",
      enable: "Enable",
      previous: "मागील",
      next: "पुढील",
      meter: "Meter",
      noMeter: "No Meter",
      modalTitleAdd: "नवीन दर जोडा",
      modalTitleEdit: "दर संपादित करा",
      categoryLabel: "Category",
      connectionTypeLabel: "Connection Type",
      tapSizeLabel: "Tap / Pipe Size",
      ratePerKLLabel: "Rate per KL (₹)",
      annualFlatRateLabel: "Annual Flat Rate (₹)",
      minimumChargeLabel: "Minimum Charge (₹)",
      meterOffPenaltyLabel: "Meter Off Penalty (₹)",
      statusLabel: "Status",
      cancel: "रद्द करा",
      saveRate: "दर जतन करा",
      residential: "निवासी",
      commercial: "व्यावसायिक",
      industrial: "औद्योगिक",
      institutional: "संस्थात्मक",
    },
    hi: {
      title: "पानी दर मास्टर",
      subtitle: "Category, Connection Type और Tap Size के अनुसार दर प्रबंधन",
      totalRates: "कुल दर",
      meterRates: "मीटर कनेक्शन दर",
      nonMeterRates: "नॉन-मीटर दर",
      activeRates: "सक्रिय दर",
      searchPlaceholder: "Category / Type / Tap Size खोजें",
      category: "Category",
      connectionType: "Connection Type",
      tapSize: "Tap Size",
      addNewRate: "नया दर जोड़ें",
      allCategories: "सभी Categories",
      allTypes: "सभी Types",
      allSizes: "सभी Sizes",
      tableCategory: "Category",
      tableConnectionType: "Connection Type",
      tableTapSize: "Tap / Pipe Size",
      tableRatePerKL: "Rate per KL",
      tableAnnualRate: "Annual Flat Rate",
      tableMinCharge: "Minimum Charge",
      tableMeterPenalty: "Meter Off Penalty",
      tableStatus: "Status",
      tableActions: "Actions",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      edit: "Edit",
      disable: "Disable",
      enable: "Enable",
      previous: "पिछला",
      next: "अगला",
      meter: "Meter",
      noMeter: "No Meter",
      modalTitleAdd: "नया दर जोड़ें",
      modalTitleEdit: "दर संपादित करें",
      categoryLabel: "Category",
      connectionTypeLabel: "Connection Type",
      tapSizeLabel: "Tap / Pipe Size",
      ratePerKLLabel: "Rate per KL (₹)",
      annualFlatRateLabel: "Annual Flat Rate (₹)",
      minimumChargeLabel: "Minimum Charge (₹)",
      meterOffPenaltyLabel: "Meter Off Penalty (₹)",
      statusLabel: "Status",
      cancel: "रद्द करें",
      saveRate: "दर सहेजें",
      residential: "आवासीय",
      commercial: "व्यावसायिक",
      industrial: "औद्योगिक",
      institutional: "संस्थागत",
    },
    en: {
      title: "Water Rate Master",
      subtitle: "Manage rates by Category, Connection Type and Tap Size",
      totalRates: "Total Rates",
      meterRates: "Meter Connection Rates",
      nonMeterRates: "Non-Meter Rates",
      activeRates: "Active Rates",
      searchPlaceholder: "Search Category / Type / Tap Size",
      category: "Category",
      connectionType: "Connection Type",
      tapSize: "Tap Size",
      addNewRate: "Add New Rate",
      allCategories: "All Categories",
      allTypes: "All Types",
      allSizes: "All Sizes",
      tableCategory: "Category",
      tableConnectionType: "Connection Type",
      tableTapSize: "Tap / Pipe Size",
      tableRatePerKL: "Rate per KL",
      tableAnnualRate: "Annual Flat Rate",
      tableMinCharge: "Minimum Charge",
      tableMeterPenalty: "Meter Off Penalty",
      tableStatus: "Status",
      tableActions: "Actions",
      active: "Active",
      inactive: "Inactive",
      edit: "Edit",
      disable: "Disable",
      enable: "Enable",
      previous: "Previous",
      next: "Next",
      meter: "Meter",
      noMeter: "No Meter",
      modalTitleAdd: "Add New Rate",
      modalTitleEdit: "Edit Rate",
      categoryLabel: "Category",
      connectionTypeLabel: "Connection Type",
      tapSizeLabel: "Tap / Pipe Size",
      ratePerKLLabel: "Rate per KL (₹)",
      annualFlatRateLabel: "Annual Flat Rate (₹)",
      minimumChargeLabel: "Minimum Charge (₹)",
      meterOffPenaltyLabel: "Meter Off Penalty (₹)",
      statusLabel: "Status",
      cancel: "Cancel",
      saveRate: "Save Rate",
      residential: "Residential",
      commercial: "Commercial",
      industrial: "Industrial",
      institutional: "Institutional",
    },
  };

  const t = translations[language];

  // Fetch all master data and rates on mount or filter change
  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getRates({
        // Add filter params as needed
        connectionCategoryID: selectedCategory !== "all" ? Number(selectedCategory) : undefined,
        connectionTypeID: selectedConnectionType !== "all" ? Number(selectedConnectionType) : undefined,
        tapSizeID: selectedTapSize !== "all" ? Number(selectedTapSize) : undefined,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
      }),
      apiService.getConnectionCategories(),
      apiService.getConnectionTypes(),
      apiService.getPipeSizes(),
      apiService.getZones(),
      apiService.getWards(),
    ])
      .then(([rateRes, catRes, typeRes, sizeRes, zoneRes, wardRes]) => {
        // Map backend fields to frontend fields expected by the table
        const mappedRates = (rateRes.items || []).map((item: any) => ({
          id: item.rateID ?? item.id,
          category: item.categoryName ?? item.category ?? "",
          connectionType: item.connectionTypeName ?? item.connectionType ?? "",
          tapSize: item.tapSizeName ?? item.tapSize ?? item.pipeSizeName ?? "",
          ratePerKL: item.ratePerKL ?? 0,
          annualFlatRate: item.annualFlatRate ?? 0,
          minimumCharge: item.minimumCharge ?? 0,
          meterOffPenalty: item.meterOffPenalty ?? 0,
          status: item.status ?? "Inactive",
          zoneNo: item.zoneNo ?? item.zoneName ?? "", // Add zoneNo for table
          wardNo: item.wardNo ?? item.wardName ?? "", // Add wardNo for table
        }));
        setRates(mappedRates);
        // setCategories(catRes.items || []);
        // setConnectionTypes(typeRes.items || []);
        // setTapSizes(sizeRes.items || []);
        // setZones(zoneRes.items || []);
        // setWards(wardRes.items || []);
      })
      .catch((err) => {
        toast.error("Failed to load data");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedConnectionType, selectedTapSize, currentPage]);

  // Filter and search logic
  const filteredRates = rates.filter((rate) => {
    const matchesSearch =
      (rate.category?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
        rate.connectionType?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
        rate.tapSize?.toLowerCase?.().includes(searchQuery.toLowerCase()));

    // Compare by ID for filters
    const matchesCategory =
      selectedCategory === "all" || rate.categoryID?.toString() === selectedCategory;
    const matchesConnectionType =
      selectedConnectionType === "all" || rate.connectionTypeID?.toString() === selectedConnectionType;
    const matchesTapSize =
      selectedTapSize === "all" || rate.tapSizeID?.toString() === selectedTapSize;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesConnectionType &&
      matchesTapSize
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRates = filteredRates.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Statistics
  const stats = {
    total: rates.length,
    meter: rates.filter((r) => r.connectionType === "Meter").length,
    nonMeter: rates.filter((r) => r.connectionType === "No Meter").length,
    active: rates.filter((r) => r.status === "Active").length,
  };

  // Modal state
  const [formData, setFormData] = useState({
    category: "Residential",
    connectionType: "Meter" as "Meter" | "No Meter",
    tapSize: "15mm",
    ratePerKL: 0,
    annualFlatRate: 0,
    minimumCharge: 0,
    meterOffPenalty: 0,
    status: "Active" as "Active" | "Inactive",
  });

  // Add modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [showAddSizeModal, setShowAddSizeModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showAddWardModal, setShowAddWardModal] = useState(false);

  // New item input states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [newSizeName, setNewSizeName] = useState("");
  const [newZoneName, setNewZoneName] = useState("");
  const [newWardName, setNewWardName] = useState("");

  // Helper translations for modal titles/descriptions
  const modalTranslations = {
    addCategoryModalTitle: t.addCategory || "Add Category",
    addCategoryModalDesc: t.enterCategoryName || "Enter category name",
    addTypeModalTitle: t.addType || "Add Type",
    addTypeModalDesc: t.enterTypeName || "Enter type name",
    addSizeModalTitle: t.addSize || "Add Size",
    addSizeModalDesc: t.enterSizeName || "Enter tap size in mm",
    addZoneModalTitle: "Add Zone",
    addZoneModalDesc: "Enter new zone name",
    addWardModalTitle: "Add Ward",
    addWardModalDesc: "Enter new ward name",
    categoryName: t.categoryName || "Category Name",
    typeName: t.typeName || "Type Name",
    sizeName: t.sizeName || "Size Name",
    zoneName: "Zone Name",
    wardName: "Ward Name",
    save: t.saveRate || "Save",
    close: t.close || "Close",
  };

  // Add handlers
  const handleAddCategory = async () => {
    const value = newCategoryName.trim();
    if (!value) {
      toast.error(t.enterCategoryName);
      return;
    }
    // Check for duplicate by name
    if (categories.some((cat) => cat.name === value)) {
      toast.error("Already exists");
      return;
    }
    // Call API to add category
    const result = await categoryActions.addCategory(value);
    if (result.success) {
      toast.success("Category added!");
      setNewCategoryName("");
      // Optionally refresh categories from API
      await refreshAll();
    } else {
      toast.error(result.error || "Failed to add category");
    }
  };

  const handleAddType = async () => {
    const value = newTypeName.trim();
    if (!value) {
      toast.error(t.enterTypeName);
      return;
    }
    // Check for duplicate by name
    if (connectionTypes.some((type) => type.name === value)) {
      toast.error("Already exists");
      return;
    }
    // Call API to add connection type
    const result = await connectionTypeActions.addConnectionType(value);
    if (result.success) {
      toast.success("Type added!");
      setNewTypeName("");
      await refreshAll();
    } else {
      toast.error(result.error || "Failed to add type");
    }
  };

  const handleAddSize = async () => {
    const value = newSizeName.trim();
    if (!value || isNaN(Number(value))) {
      toast.error(t.enterSizeName);
      return;
    }
    const formatted = `${parseInt(value, 10)}mm`;
    // Check for duplicate by name
    if (tapSizes.some((size) => size.name === formatted)) {
      toast.error("Already exists");
      return;
    }
    // Call API to add pipe size
    const result = await tapSizeActions.addTapSize(formatted);
    if (result.success) {
      toast.success("Size added!");
      setNewSizeName("");
      await refreshAll();
    } else {
      toast.error(result.error || "Failed to add size");
    }
  };

  const handleAddZone = () => {
    const value = newZoneName.trim();
    if (!value) {
      toast.error("Please enter zone name");
      return;
    }
    addZone(value)
      .then((result: any) => {
        if (result.success) {
          toast.success("Zone added!");
          setNewZoneName("");
          refreshAll();
        } else {
          toast.error(result.error || "Failed to add zone");
        }
      })
      // .catch(() => toast.error(""));
  };

 const handleAddWard = async () => {
  const value = newWardName.trim();

  if (!value) {
    toast.error("Please enter ward name");
    return;
  }

  if (!selectedZoneID) {
    toast.error("Please select a zone");
    return;
  }

  // Duplicate check
  if (
    wards.some(
      (ward) =>
        ward.zoneID?.toString() === selectedZoneID &&
        ward.wardName?.toLowerCase() === value.toLowerCase()
    )
  ) {
    toast.error("Ward already exists in this zone");
    return;
  }

  setLoading(true);

  try {
    await addWard({
      wardName: value,
      wardCode: value,
      zoneID: Number(selectedZoneID),
      isActive: true,
      createdBy: 1,
    });

    toast.success("Ward added!");
    setNewWardName("");
    await refreshAll();
  } catch (err: any) {
    toast.error(err?.message || "Failed to add ward");
  } finally {
    setLoading(false);
  }
};


  // Delete zone
  const handleDeleteZone = async (id: number) => {
    setLoading(true);
    try {
      const result = await deleteZone(id);
      if (result?.success) {
        toast.success("Zone deleted!");
        await refreshAll();
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (err: any) {
      if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete zone");
      }
    }
    setLoading(false);
  };

  // Delete ward
  const handleDeleteWard = async (id: number) => {
    setLoading(true);
    try {
      const result = await deleteWard(id);
      if (result?.success) {
        toast.success("Ward deleted!");
        await refreshAll();
      } else if (result?.error) {
        toast.error(result.error);
      } else {
        toast.error("Failed to delete ward");
      }
    } catch (err: any) {
      if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete ward");
      }
    }
    setLoading(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedConnectionType("all");
    setSelectedTapSize("all");
    setSearchQuery("");
  };

  // Translate helpers
  const translateCategory = (cat: any) => {
    if (typeof cat === "string") {
      return t[cat.toLowerCase()] || cat;
    }
    // If cat is an object (e.g., ConnectionCategory), try to use its name property
    if (cat && typeof cat === "object" && (cat.CategoryName || cat.categoryName)) {
      const name = cat.CategoryName || cat.categoryName;
      return t[name?.toLowerCase?.()] || name || "";
    }
    return "";
  };

  const translateConnectionType = (type: any) => {
    if (typeof type === "string") {
      return t[type.replace(" ", "").toLowerCase()] || type;
    }
    if (type && typeof type === "object" && (type.connectionTypeName || type.ConnectionTypeName)) {
      const name = type.connectionTypeName || type.ConnectionTypeName;
      return t[name?.replace?.(" ", "")?.toLowerCase?.()] || name || "";
    }
    return "";
  };

  // Count active filters
  const activeFiltersCount = [
    selectedCategory !== "all" ? 1 : 0,
    selectedConnectionType !== "all" ? 1 : 0,
    selectedTapSize !== "all" ? 1 : 0,
    searchQuery ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleAddNew = () => {
    setEditingRate(null);
    setFormData({
      category: "Residential",
      connectionType: "Meter",
      tapSize: "15mm",
      ratePerKL: 0,
      annualFlatRate: 0,
      minimumCharge: 0,
      meterOffPenalty: 0,
      status: "Active",
    });
    setShowModal(true);
  };

  const handleEdit = (rate: WaterRate) => {
    setEditingRate(rate);
    setFormData({
      category: rate.category,
      connectionType: rate.connectionType,
      tapSize: rate.tapSize,
      ratePerKL: rate.ratePerKL,
      annualFlatRate: rate.annualFlatRate,
      minimumCharge: rate.minimumCharge,
      meterOffPenalty: rate.meterOffPenalty,
      status: rate.status,
    });
    setShowModal(true);
  };

  // Update the handleSave function to connect with the backend
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        zoneNo: formData.zoneNo,
        wardNo: formData.wardNo,
        category: formData.category,
        connectionType: formData.connectionType,
        tapSize: formData.tapSize,
        ratePerKL: formData.ratePerKL,
        annualFlatRate: formData.annualFlatRate,
        minimumCharge: formData.minimumCharge,
        meterOffPenalty: formData.connectionType === "Meter" ? formData.meterOffPenalty : 0,
        status: formData.status,
      };

      // Find the selected category object
      const selectedCategory = categories.find(
        c => c.CategoryID.toString() === formData.category
      );

      let result;
      if (editingRate) {
        result = await waterRateActions.updateRate(editingRate.id, payload);
      } else {
        result = await waterRateActions.createRate({
          ...payload,
          connectionCategoryID: selectedCategory?.CategoryID, // Add this line
        });
      }

      if (result.success) {
        toast.success(editingRate ? "Rate updated successfully!" : "Rate added successfully!");
        setShowModal(false);
        await refreshAll(); // Refresh data after saving
      } else {
        toast.error(result.error || "Failed to save rate");
      }
    } catch (error) {
      toast.error("An error occurred while saving the rate");
    } finally {
      setLoading(false);
    }
  };

  // Example for delete
  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await apiService.deleteRate(id);
      toast.success("Rate deleted!");
      // Refresh data
      const rateRes = await apiService.getRates({
        connectionCategoryID: selectedCategory !== "all" ? Number(selectedCategory) : undefined,
        connectionTypeID: selectedConnectionType !== "all" ? Number(selectedConnectionType) : undefined,
        tapSizeID: selectedTapSize !== "all" ? Number(selectedTapSize) : undefined,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
      });
      setRates(rateRes.items || []);
    } catch (err) {
      toast.error("Failed to delete rate");
    }
    setLoading(false);
  };

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<"rateMaster" | "billingCycle">("rateMaster");

  // Selection handlers for RateTable
  const onSelectAll = () => {
    if (selectedRows.length === paginatedRates.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedRates.map((r) => r.id));
    }
  };
  const onSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Translation helpers for RateTable
  const tableTranslations = {
    srNo: "Sr. No.",
    zoneNo: "Zone No.",
    wardNo: "Ward No.",
    tableCategory: t.tableCategory,
    tableConnectionType: t.tableConnectionType,
    tableTapSize: t.tableTapSize,
    tableRatePerKL: t.tableRatePerKL,
    tableAnnualRate: t.tableAnnualRate,
    tableMinCharge: t.tableMinCharge,
    tableMeterPenalty: t.tableMeterPenalty,
    tableStatus: t.tableStatus,
    tableActions: t.tableActions,
    active: t.active,
    inactive: t.inactive,
    edit: t.edit,
    disable: t.disable,
    enable: t.enable,
  };

  // Add this function before your return statement
  const toggleStatus = async (id: number) => {
    setLoading(true);
    try {
      // Find the rate to toggle
      const rate = rates.find((r) => r.id === id);
      if (!rate) return;
      const newStatus = rate.status === "Active" ? "Inactive" : "Active";
      // Call your API to update status (assuming updateRate accepts partial updates)
      await apiService.updateRate(id, { ...rate, status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
      // Refresh data
      const rateRes = await apiService.getRates({
        connectionCategoryID: selectedCategory !== "all" ? Number(selectedCategory) : undefined,
        connectionTypeID: selectedConnectionType !== "all" ? Number(selectedConnectionType) : undefined,
        tapSizeID: selectedTapSize !== "all" ? Number(selectedTapSize) : undefined,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
      });
      setRates(
        (rateRes.items || []).map((item: any) => ({
          id: item.rateID ?? item.id,
          category: item.categoryName ?? item.category ?? "",
          connectionType: item.connectionTypeName ?? item.connectionType ?? "",
          tapSize: item.tapSizeName ?? item.tapSize ?? item.pipeSizeName ?? "",
          ratePerKL: item.ratePerKL ?? 0,
          annualFlatRate: item.annualFlatRate ?? 0,
          minimumCharge: item.minimumCharge ?? 0,
          meterOffPenalty: item.meterOffPenalty ?? 0,
          status: item.status ?? "Inactive",
          zoneNo: item.zoneNo ?? item.zoneName ?? "",
          wardNo: item.wardNo ?? item.wardName ?? "",
        }))
      );
    } catch (err) {
      toast.error("Failed to update status");
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 bg-[#F5F9FC] p-4 sm:p-6 lg:p-8">
      {/* Tab Navigation Header */}
      <div className="relative bg-gradient-to-r from-[#005A9C] via-[#0077CC] to-[#005A9C] text-white p-1.5 md:p-2 rounded-lg mb-2 md:mb-3 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5">
          <div className="flex items-center gap-2">
            <motion.div
              className="bg-white/20 backdrop-blur-sm p-1 rounded-lg shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
            </motion.div>
            <div>
              <h1 className="text-xs md:text-sm mb-0">{t.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-1.5 py-0.5 shadow-lg text-[10px] md:text-xs">
                <Zap className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                {t.filtersActive || "Filters"}: {activeFiltersCount}
              </Badge>
            )}
            <Button
              onClick={() => setActiveTab("rateMaster")}
              size="sm"
              className={`${
                activeTab === "rateMaster"
                  ? "bg-white text-blue-600 hover:bg-white/90"
                  : "bg-white/20 text-white hover:bg-white/30"
              } transition-all text-[10px] md:text-xs px-2 md:px-3 py-1 h-auto`}
            >
              <IndianRupee className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
              {t.rateMaster || "Rate Master"}
            </Button>
            <Button
              onClick={() => setActiveTab("billingCycle")}
              size="sm"
              className={`${
                activeTab === "billingCycle"
                  ? "bg-white text-blue-600 hover:bg-white/90"
                  : "bg-white/20 text-white hover:bg-white/30"
              } transition-all text-[10px] md:text-xs px-2 md:px-3 py-1 h-auto`}
            >
              <FileText className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
              {t.billingCycleMaster || "Billing Cycle Master"}
            </Button>
          </div>
        </div>
      </div>

      {/* Conditionally render Rate Master or Billing Cycle Master */}
      {activeTab === "rateMaster" ? (
        <>
          {/* Rate Master UI */}
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Rates Card */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-60"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-blue-600 text-sm mb-1 font-medium">{t.totalRates}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg shadow-lg">
                  <Droplet className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Meter Rates Card */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-60"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-green-600 text-sm mb-1 font-medium">{t.meterRates}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.meter}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg shadow-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Non-Meter Rates Card */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-60"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-orange-600 text-sm mb-1 font-medium">{t.nonMeterRates}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.nonMeter}</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-lg shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Active Rates Card */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-60"></div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-purple-600 text-sm mb-1 font-medium">{t.activeRates}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-lg shadow-md p-2 mb-2 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-1.5 items-stretch lg:items-center w-full justify-between">
              {/* Search */}
              <div className="relative w-full lg:flex-shrink-0 lg:w-[200px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-8 text-xs border-gray-300 focus:border-[#005A9C] focus:ring-[#005A9C] w-full"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-1.5 flex-1 items-center justify-end">
                {/* Category Filter */}
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="h-8 text-xs w-[110px] border-gray-300">
                    <SelectValue placeholder={t.category} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCategories}</SelectItem>
                    {categories
                      .filter(cat => cat && typeof cat.CategoryID !== "undefined" && cat.CategoryID !== null)
                      .map((cat) => (
                        <SelectItem key={cat.CategoryID} value={cat.CategoryID.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Connection Type Filter */}
                <Select
                  value={selectedConnectionType}
                  onValueChange={setSelectedConnectionType}
                >
                  <SelectTrigger className="h-8 text-xs w-[120px] border-gray-300">
                    <SelectValue placeholder={t.connectionType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allTypes}</SelectItem>
                    {connectionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tap Size Filter */}
                <Select value={selectedTapSize} onValueChange={setSelectedTapSize}>
                  <SelectTrigger className="h-8 text-xs w-[95px] border-gray-300">
                    <SelectValue placeholder={t.tapSize} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allSizes}</SelectItem>
                    {tapSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id.toString()}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeFiltersCount > 0 && (
                  <Button
                    onClick={handleClearFilters}
                    size="sm"
                    className="h-8 px-3 text-xs bg-red-500 text-white hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    {t.clearFilters}
                  </Button>
                )}

                {/* Add Buttons - Filled Style */}
                <div className="hidden lg:flex gap-1.5">
                  <Button
                    onClick={() => setShowAddCategoryModal(true)}
                    size="sm"
                    className="h-8 px-3 text-xs bg-blue-500 text-white hover:bg-blue-600"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {t.category}
                  </Button>
                  <Button
                    onClick={() => setShowAddTypeModal(true)}
                    size="sm"
                    className="h-8 px-3 text-xs bg-green-500 text-white hover:bg-green-600"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {t.connectionType}
                  </Button>
                  <Button
                    onClick={() => setShowAddSizeModal(true)}
                    size="sm"
                    className="h-8 px-3 text-xs bg-purple-500 text-white hover:bg-purple-600"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {t.tapSize}
                  </Button>
                  <Button
                    onClick={handleAddNew}
                    size="sm"
                    className="h-8 px-3 text-xs bg-[#005A9C] text-white hover:bg-[#004080]"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {t.addNewRate}
                  </Button>
                  <Button
                    onClick={() => setShowAddZoneModal(true)}
                    size="sm"
                    className="h-8 px-3 text-xs bg-cyan-500 text-white hover:bg-cyan-600"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Zone
                  </Button>
                  <Button
                    onClick={() => setShowAddWardModal(true)}
                    size="sm"
                    className="h-8 px-3 text-xs bg-teal-500 text-white hover:bg-teal-600"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Ward
                  </Button>
                </div>

                {/* Mobile: Icon only buttons */}
                <div className="flex lg:hidden gap-1">
                  <Button
                    onClick={() => setShowAddCategoryModal(true)}
                    size="sm"
                    className="h-8 px-2 text-xs bg-blue-500 text-white hover:bg-blue-600"
                    title={t.addCategory}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => setShowAddTypeModal(true)}
                    size="sm"
                    className="h-8 px-2 text-xs bg-green-500 text-white hover:bg-green-600"
                    title={t.addType}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => setShowAddSizeModal(true)}
                    size="sm"
                    className="h-8 px-2 text-xs bg-purple-500 text-white hover:bg-purple-600"
                    title={t.addSize}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={handleAddNew}
                    size="sm"
                    className="h-8 px-2 text-xs bg-[#005A9C] text-white hover:bg-[#004080]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => setShowAddZoneModal(true)}
                    size="sm"
                    className="h-8 px-2 text-xs bg-cyan-500 text-white hover:bg-cyan-600"
                    title="Add Zone"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    onClick={() => setShowAddWardModal(true)}
                    size="sm"
                    className="h-8 px-2 text-xs bg-teal-500 text-white hover:bg-teal-600"
                    title="Add Ward"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <RateTable
              rates={paginatedRates}
              selectedRows={selectedRows}
              startIndex={startIndex}
              onSelectAll={onSelectAll}
              onSelectRow={onSelectRow}
              onEdit={handleEdit}
              onToggleStatus={toggleStatus}
              translations={tableTranslations}
              translateCategory={translateCategory}
              translateConnectionType={translateConnectionType}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredRates.length)} of{" "}
                {filteredRates.length} rates
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-white px-6 py-5 border-b-2 border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-blue-600" />
                    <div>
                      <h2 className="text-xl text-[#005AA7] font-semibold">
                        {editingRate ? t.modalTitleEdit : t.modalTitleAdd}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Fill the details below and save the rate
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-5 space-y-4 bg-gray-50/30">
                  {/* Zone Number and Ward Number - Side by Side */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Zone Number */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-700 font-semibold">
                        {t.zoneNo || "Zone Number"}
                      </Label>
                      <Select
                        value={formData.zoneNo}
                        onValueChange={(value) => {
                          setFormData({ ...formData, zoneNo: value });
                          setZoneSearchQuery("");
                        }}
                        onOpenChange={(open) => {
                          if (!open) setZoneSearchQuery("");
                        }}
                      >
                        <SelectTrigger className="h-10 text-sm bg-white border-gray-300 hover:border-[#005A9C] transition-colors">
                          <SelectValue placeholder="Select Zone" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1.5 border-b">
                            <Input
                              type="text"
                              placeholder="Search zone..."
                              value={zoneSearchQuery}
                              onChange={(e) => setZoneSearchQuery(e.target.value)}
                              className="h-8 text-xs"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {filteredZones.length > 0 ? (
                              filteredZones.map((zone) => (
                                <SelectItem key={zone} value={zone}>
                                  {zone}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-3 text-xs text-center text-gray-500">
                                No zones found
                              </div>
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Ward Number */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-700 font-semibold">
                        {t.wardNo || "Ward Number"}
                      </Label>
                      <Select
                        value={formData.wardNo}
                        onValueChange={(value) => {
                          setFormData({ ...formData, wardNo: value });
                          setWardSearchQuery("");
                        }}
                        onOpenChange={(open) => {
                          if (!open) setWardSearchQuery("");
                        }}
                      >
                        <SelectTrigger className="h-10 text-sm bg-white border-gray-300 hover:border-[#005A9C] transition-colors">
                          <SelectValue placeholder="Select Ward" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1.5 border-b">
                            <Input
                              type="text"
                              placeholder="Search ward..."
                              value={wardSearchQuery}
                              onChange={(e) => setWardSearchQuery(e.target.value)}
                              className="h-8 text-xs"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-[200px] overflow-y-auto">
                            {filteredWards.length > 0 ? (
                              filteredWards.map((ward) => (
                                <SelectItem key={ward} value={ward}>
                                  {ward}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-3 text-xs text-center text-gray-500">
                                No wards found
                              </div>
                            )}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-700 font-semibold">
                      {t.categoryLabel}
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger className="h-10 text-sm bg-white border-gray-300 hover:border-[#005A9C] transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Connection Type */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-700 font-semibold">
                      {t.connectionTypeLabel}
                    </Label>
                    <div className="flex gap-4 bg-white p-3 rounded-lg border border-gray-200">
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="connectionType"
                          checked={formData.connectionType === "Meter"}
                          onChange={() =>
                            setFormData({ ...formData, connectionType: "Meter" })
                          }
                          className="w-4 h-4 text-[#005A9C] border-gray-300 focus:ring-[#005A9C]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#005A9C] transition-colors">
                          {t.meter}
                        </span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="radio"
                          name="connectionType"
                          checked={formData.connectionType === "No Meter"}
                          onChange={() =>
                            setFormData({ ...formData, connectionType: "No Meter" })
                          }
                          className="w-4 h-4 text-[#005A9C] border-gray-300 focus:ring-[#005A9C]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#005A9C] transition-colors">
                          {t.noMeter}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Tap Size */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-700 font-semibold">
                      {t.tapSizeLabel}
                    </Label>
                    <Select
                      value={formData.tapSize}
                      onValueChange={(value) =>
                        setFormData({ ...formData, tapSize: value })
                      }
                    >
                      <SelectTrigger className="h-10 text-sm bg-white border-gray-300 hover:border-[#005A9C] transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tapSizes.map((size) => (
                          <SelectItem key={size.name} value={size.name}>
                            {size.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rate per KL and Annual Flat Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-700 font-semibold">
                        {t.ratePerKLLabel}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <Input
                          type="number"
                          value={formData.ratePerKL}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ratePerKL: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="h-10 pl-7 text-sm bg-white border-gray-300 focus:border-[#005A9C]"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-700 font-semibold">
                        {t.annualFlatRateLabel}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <Input
                          type="number"
                          value={formData.annualFlatRate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              annualFlatRate: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="h-10 pl-7 text-sm bg-white border-gray-300 focus:border-[#005A9C]"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Minimum Charge and Meter Off Penalty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-700 font-semibold">
                        {t.minimumChargeLabel}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <Input
                          type="number"
                          value={formData.minimumCharge}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minimumCharge: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="h-10 pl-7 text-sm bg-white border-gray-300 focus:border-[#005A9C]"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    {formData.connectionType === "Meter" && (
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-700 font-semibold">
                          {t.meterOffPenaltyLabel}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                          <Input
                            type="number"
                            value={formData.meterOffPenalty}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                meterOffPenalty: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="h-10 pl-7 text-sm bg-white border-gray-300 focus:border-[#005A9C]"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-700 font-semibold">
                      {t.statusLabel}
                    </Label>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            status:
                              formData.status === "Active" ? "Inactive" : "Active",
                          })
                        }
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                          formData.status === "Active" ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                            formData.status === "Active"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span
                        className={`text-sm font-medium ${
                          formData.status === "Active"
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        {formData.status === "Active" ? t.active : t.inactive}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                  <Button
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    size="default"
                    className="h-10 px-6 text-sm border-gray-300 hover:bg-gray-100"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="default"
                    className="h-10 px-6 text-sm bg-gradient-to-r from-[#005A9C] to-[#0077CC] hover:from-[#004080] hover:to-[#005A9C] shadow-md"
                  >
                    {t.saveRate}
                  </Button>
                </div>
              </div>
            </div>
          )}

         
          

          {/* Add Category Modal */}
          <Dialog open={showAddCategoryModal} onOpenChange={setShowAddCategoryModal}>
            <DialogContent className="bg-white rounded-2xl shadow-2xl border-0 w-[95vw] sm:w-[90vw] md:max-w-md p-0 max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-br from-blue-50 via-white to-transparent">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-[#005A9C] text-base sm:text-lg mb-0.5">
                      {modalTranslations.addCategoryModalTitle}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                      {modalTranslations.addCategoryModalDesc}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/30">
                <div className="space-y-2">
                  <label className="text-xs text-gray-700 font-semibold">
                    {modalTranslations.categoryName}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={modalTranslations.addCategoryModalDesc}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddCategory();
                        }
                      }}
                      className="h-10 text-sm bg-white border-gray-300 hover:border-[#005A9C] transition-colors flex-1"
                    />
                    <Button
                      onClick={handleAddCategory}
                      size="default"
                      className="h-10 px-4 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {modalTranslations.save}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <div className="space-y-3">
                  <label className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                    Existing Categories ({categories.length})
                  </label>
                  <div className="border border-blue-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-blue-100 border-b border-blue-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-blue-800 uppercase tracking-wide w-16">
                            Sr. No
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-blue-800 uppercase tracking-wide">
                            Category Name
                          </th>
                          <th className="px-3 py-2 text-center text-[10px] font-bold text-blue-800 uppercase tracking-wide w-20">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-blue-100">
                        {categories.map((cat, index) => (
                          <tr key={cat.id || index} className="hover:bg-blue-50 transition-colors group">
                            <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2.5 text-sm text-gray-800 font-medium">
                              {cat.name}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <Button
                                onClick={async () => {
                                  const result = await categoryActions.deleteCategory(cat.id);
                                  if (result.success) {
                                    toast.success("Category deleted!");
                                    await refreshAll();
                                  } else {
                                    toast.error(result.error || "Failed to delete category");
                                  }
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-red-600 hover:bg-red-100 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                <Button
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setNewCategoryName("");
                  }}
                  variant="outline"
                  size="default"
                  className="h-10 px-6 text-sm border-gray-300 hover:bg-gray-100"
                >
                  {modalTranslations.close}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Type Modal */}
          <Dialog open={showAddTypeModal} onOpenChange={setShowAddTypeModal}>
            <DialogContent className="bg-white rounded-2xl shadow-2xl border-0 w-[95vw] sm:w-[90vw] md:max-w-md p-0 max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-br from-green-50 via-white to-transparent">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-2.5 rounded-xl shadow-lg">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-green-700 text-base sm:text-lg mb-0.5">
                      {modalTranslations.addTypeModalTitle}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                      {modalTranslations.addTypeModalDesc}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/30">
                <div className="space-y-2">
                  <label className="text-xs text-gray-700 font-semibold">
                    {modalTranslations.typeName}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={modalTranslations.addTypeModalDesc}
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddType();
                        }
                      }}
                      className="h-10 text-sm bg-white border-gray-300 hover:border-green-500 transition-colors flex-1"
                    />
                    <Button
                      onClick={handleAddType}
                      size="default"
                      className="h-10 px-4 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {modalTranslations.save}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <div className="space-y-3">
                  <label className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                    Existing Types ({connectionTypes.length})
                  </label>
                  <div className="border border-green-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-green-100 border-b border-green-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-green-800 uppercase tracking-wide w-16">
                            Sr. No
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-green-800 uppercase tracking-wide">
                            Type Name
                          </th>
                          <th className="px-3 py-2 text-center text-[10px] font-bold text-green-800 uppercase tracking-wide w-20">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-green-100">
                        {connectionTypes.map((type, index) => (
                          <tr key={type.id || index} className="hover:bg-green-50 transition-colors group">
                            <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2.5 text-sm text-gray-800 font-medium">
                              {type.name}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <Button
                                onClick={async () => {
                                  const result = await connectionTypeActions.deleteConnectionType(type.id);
                                  if (result.success) {
                                    toast.success("Type deleted!");
                                    await refreshAll();
                                  } else {
                                    toast.error(result.error || "Failed to delete type");
                                  }
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-red-600 hover:bg-red-100 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                <Button
                  onClick={() => {
                    setShowAddTypeModal(false);
                    setNewTypeName("");
                  }}
                  variant="outline"
                  size="default"
                  className="h-10 px-6 text-sm border-gray-300 hover:bg-gray-100"
                >
                  {modalTranslations.close}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Size Modal */}
          <Dialog open={showAddSizeModal} onOpenChange={setShowAddSizeModal}>
            <DialogContent className="bg-white rounded-2xl shadow-2xl border-0 w-[95vw] sm:w-[90vw] md:max-w-md p-0 max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-br from-purple-50 via-white to-transparent">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-purple-700 text-base sm:text-lg mb-0.5">
                      {modalTranslations.addSizeModalTitle}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                      {modalTranslations.addSizeModalDesc}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/30">
                <div className="space-y-2">
                  <label className="text-xs text-gray-700 font-semibold">
                    {modalTranslations.sizeName}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={modalTranslations.addSizeModalDesc}
                      value={newSizeName}
                      onChange={(e) => setNewSizeName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddSize();
                        }
                      }}
                      className="h-10 text-sm bg-white border-gray-300 hover:border-purple-500 transition-colors flex-1"
                      min="1"
                      step="1"
                    />
                    <Button
                      onClick={handleAddSize}
                      size="default"
                      className="h-10 px-4 text-sm bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {modalTranslations.save}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <div className="space-y-3">
                  <label className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                    Existing Sizes ({tapSizes.length})
                  </label>
                  <div className="border border-purple-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-purple-100 border-b border-purple-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-purple-800 uppercase tracking-wide w-16">
                            Sr. No
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-purple-800 uppercase tracking-wide">
                            Size Name
                          </th>
                          <th className="px-3 py-2 text-center text-[10px] font-bold text-purple-800 uppercase tracking-wide w-20">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-purple-100">
                        {tapSizes.map((size, index) => (
                          <tr key={size.id || index} className="hover:bg-purple-50 transition-colors group">
                            <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2.5 text-sm text-gray-800 font-medium">
                              {size.name}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <Button
                                onClick={async () => {
                                  const result = await tapSizeActions.deleteTapSize(size.id);
                                  if (result.success) {
                                    toast.success("Size deleted!");

                                    await refreshAll();
                                  } else {
                                                                       toast.error(result.error || "Failed to delete size");
                                  }
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-red-600 hover:bg-red-100 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                <Button
                  onClick={() => {
                    setShowAddSizeModal(false);
                    setNewSizeName("");
                  }}
                  variant="outline"
                  size="default"
                  className="h-10 px-6 text-sm border-gray-300 hover:bg-gray-100"
                >
                  {modalTranslations.close}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Zone Modal */}
          <Dialog open={showAddZoneModal} onOpenChange={setShowAddZoneModal}>
            <DialogContent className="bg-white rounded-2xl shadow-2xl border-0 w-[95vw] sm:w-[90vw] md:max-w-md p-0 max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-br from-cyan-50 via-white to-transparent">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-cyan-700 text-base sm:text-lg mb-0.5">
                      Add Zone
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                      Enter new zone name
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/30">
                <div className="space-y-2">
                  <label className="text-xs text-gray-700 font-semibold">Zone Name</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter zone name"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      onKeyDown={async (e) => { if (e.key === 'Enter') await handleAddZone(); }}
                      className="h-10 text-sm bg-white border-gray-300 hover:border-cyan-500 transition-colors flex-1"
                      disabled={loading}
                    />
                    <Button
                      onClick={handleAddZone}
                      size="default"
                      className="h-10 px-4 text-sm bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 shadow-md"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <div className="space-y-3">
                  <label className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                    Existing Zones ({zones.length})
                  </label>
                  <div className="border border-cyan-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-cyan-100 border-b border-cyan-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-cyan-800 uppercase tracking-wide w-16">Sr. No</th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-cyan-800 uppercase tracking-wide">Zone Name</th>
                          <th className="px-3 py-2 text-center text-[10px] font-bold text-cyan-800 uppercase tracking-wide w-20">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-cyan-100">
                        {zones.map((zone, index) => (
                          <tr key={zone.zoneID ?? index}>
                            <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">{index + 1}</td>
                            <td className="px-3 py-2.5 text-sm text-gray-800 font-medium">{zone.zoneName}</td>
                            <td className="px-3 py-2.5 text-center">
                              <Button
                                onClick={async () => {
                                  await handleDeleteZone(zone.zoneID);
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-red-600 hover:bg-red-100 hover:text-red-700"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                <Button
                  onClick={() => {
                    setShowAddZoneModal(false);
                    setNewZoneName("");
                  }}
                  variant="outline"
                  size="default"
                  className="h-10 px-6 text-sm border-gray-300 hover:bg-gray-100"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Ward Modal */}
          <Dialog open={showAddWardModal} onOpenChange={setShowAddWardModal}>
            <DialogContent className="bg-white rounded-2xl shadow-2xl border-0 w-[95vw] sm:w-[90vw] md:max-w-md p-0 max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-br from-teal-50 via-white to-transparent">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-2.5 rounded-xl shadow-lg">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-teal-700 text-base sm:text-lg mb-0.5">
                      Add New Ward
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                      Enter new ward name
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              {/* Add New Ward Input */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/30">
                <div className="space-y-2">
                  <label className="text-xs text-gray-700 font-semibold">Zone</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      placeholder="Search Ward..."
                      value={wardSearch}
                      onChange={e => setWardSearch(e.target.value)}
                      className="h-8 text-sm border-gray-300"
                    />
                  </div>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={selectedZoneID}
                      onChange={(e) => setSelectedZoneID(e.target.value)}
                      className="h-10 text-sm bg-white border border-gray-300 rounded px-2 flex-1"
                    >
                      <option value="">Select zone</option>
                      {zones.map((zone) => (
                        <option key={zone.zoneID} value={zone.zoneID}>
                          {zone.zoneName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="text-xs text-gray-700 font-semibold">Ward Name</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter ward name"
                      value={newWardName}
                      onChange={(e) => setNewWardName(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') { handleAddWard(); } }}
                      className="h-10 text-sm bg-white border-gray-300 hover:border-teal-500 transition-colors flex-1"
                    />
                    <Button
                      onClick={handleAddWard}
                      size="md"
                      className="h-10 px-4 text-sm bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-md"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
              {/* List of Existing Wards */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <div className="space-y-3">
                  <label className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                    Existing Wards ({wards.length})
                  </label>
                  <div className="border border-teal-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-teal-100 border-b border-teal-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-teal-800 uppercase tracking-wide w-16">
                            Sr. No
                          </th>
                          <th className="px-3 py-2 text-left text-[10px] font-bold text-teal-800 uppercase tracking-wide">
                            Ward Name
                          </th>
                          <th className="px-3 py-2 text-center text-[10px] font-bold text-teal-800 uppercase tracking-wide w-20">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-teal-100">
                        {wards
                          .filter(w => w.wardName.toLowerCase().includes(wardSearch.toLowerCase()))
                          .map((ward, index) => (
                            <tr key={ward.wardID} className="hover:bg-teal-50 transition-colors group">
                              <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">{index + 1}</td>
                              <td className="px-3 py-2.5 text-sm text-gray-800 font-medium">
                                {editingWardId === ward.wardID ? (
                                  <div className="flex gap-2 items-center">
                                    <Input
                                      type="text"
                                      value={editingWardValue}
                                      onChange={e => setEditingWardValue(e.target.value)}
                                      className="h-8 text-sm border-gray-300 flex-1"
                                    />
                                    <Button size="sm" className="h-8 px-2 bg-green-500 text-white" onClick={async () => {
                                      // TODO: Implement updateWard API
                                      setEditingWardId(null);
                                      setEditingWardValue("");
                                      if (typeof refreshAll === 'function') await refreshAll();
                                      toast.success("Ward updated successfully");
                                    }}>Save</Button>
                                    <Button size="sm" className="h-8 px-2 bg-gray-300" onClick={() => {
                                      setEditingWardId(null);
                                      setEditingWardValue("");
                                    }}>Cancel</Button>
                                  </div>
                                ) : (
                                  ward.wardName
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-center flex gap-1 justify-center">
                                {editingWardId === ward.wardID ? null : (
                                  <Button
                                    onClick={() => {
                                      setEditingWardId(ward.wardID);
                                      setEditingWardValue(ward.wardName);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  onClick={async () => {
                                    try {
                                      await deleteWard(ward.wardID);
                                      toast.success(`Ward "${ward.wardName}" deleted successfully.`);
                                      if (typeof refreshAll === 'function') await refreshAll();
                                    } catch (error) {
                                      toast.error(`Failed to delete ward "${ward.wardName}".`);
                                    }
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-red-600 hover:bg-red-100 hover:text-red-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))}

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                <Button
                  onClick={() => setShowAddWardModal(false)}
                  variant="outline"
                  size="md"
                  className="h-10 px-6 text-sm border-gray-300 hover:bg-gray-100"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        // Billing Cycle Master UI
        <>
          <BillingCycleTab language={language} />
        </>
      )}
    </div>
  );
}

export default RateMaster;