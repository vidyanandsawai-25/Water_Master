'use client';

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Activity,
  X,
} from "lucide-react";
import { Language } from "@/app/page";
import { toast } from "sonner";
import apiService, { Zone, BillingCycle } from "@/lib/api/services";

interface BillingCycleTabProps {
  language: Language;
}

export function BillingCycleTab({ language }: BillingCycleTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedConnectionCategory, setSelectedConnectionCategory] = useState("all"); // Updated state for connection category
  const [selectedCycleType, setSelectedCycleType] = useState("all");
  const [zones, setZones] = useState<Zone[]>([]); // State to store zones
  const [connectionCategories, setConnectionCategories] = useState<ConnectionCategory>([]); // State to store connection categories
  const [showModal, setShowModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<BillingCycle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [cycles, setCycles] = useState<BillingCycle[]>([]); // Correctly define the state for cycles
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Translations
  const translations = {
    mr: {
      title: "बिलिंग सायकल मास्टर",
      subtitle: "Zone, Connection Type आणि Financial Year नुसार बिलिंग सायकल व्यवस्थापन",
      activeCycles: "सक्रिय सायकल",
      pendingCycles: "प्रलंबित सायकल",
      completedCycles: "पूर्ण सायकल",
      totalCycles: "एकूण सायकल",
      searchPlaceholder: "झोन / वर्ग / आर्थिक वर्ष शोधा",
      allZones: "सर्व Zones",
      allTypes: "सर्व Types",
      allCycleTypes: "सर्व Cycle Types",
      addNewCycle: "नवीन सायकल जोडा",
      zone: "Zone",
      connectionType: "Connection Type",
      cycleType: "Cycle Type",
      financialYear: "Financial Year",
      billGenerationDate: "Bill Generation Date",
      billPeriodStart: "Bill Period Start",
      billPeriodEnd: "Bill Period End",
      currentPenalty: "Current Penalty %",
      pendingPenalty: "Pending Penalty %",
      status: "Status",
      actions: "Actions",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      edit: "Edit",
      disable: "Disable",
      enable: "Enable",
      meter: "Meter",
      noMeter: "No Meter",
      previous: "मागील",
      next: "पुढील",
      modalTitleAdd: "नवीन सायकल जोडा",
      modalTitleEdit: "सायकल संपादित करा",
      zoneLabel: "Zone",
      connectionTypeLabel: "Connection Type",
      cycleTypeLabel: "Cycle Type",
      financialYearLabel: "Financial Year",
      billGenerationDateLabel: "Bill Generation Date",
      billPeriodStartLabel: "Bill Period Start",
      billPeriodEndLabel: "Bill Period End",
      currentPenaltyLabel: "Current Penalty %",
      pendingPenaltyLabel: "Pending Penalty %",
      statusLabel: "Status",
      cancel: "रद्द करा",
      saveCycle: "सायकल जतन करा",
    },
    hi: {
      title: "बिलिंग चक्र मास्टर",
      subtitle: "ज़ोन, कनेक्शन प्रकार और वित्तीय वर्ष के अनुसार बिलिंग चक्र प्रबंधन",
      activeCycles: "सक्रिय चक्र",
      pendingCycles: "लंबित चक्र",
      completedCycles: "पूर्ण चक्र",
      totalCycles: "कुल चक्र",
      searchPlaceholder: "ज़ोन / वर्ग / वित्तीय वर्ष खोजें",
      allZones: "सभी ज़ोन",
      allTypes: "सभी प्रकार",
      allCycleTypes: "सभी चक्र प्रकार",
      addNewCycle: "नया चक्र जोड़ें",
      zone: "ज़ोन",
      connectionType: "कनेक्शन प्रकार",
      cycleType: "चक्र प्रकार",
      financialYear: "वित्तीय वर्ष",
      billGenerationDate: "बिल जनरेशन तिथि",
      billPeriodStart: "बिल अवधि प्रारंभ",
      billPeriodEnd: "बिल अवधि समाप्त",
      currentPenalty: "वर्तमान दंड %",
      pendingPenalty: "लंबित दंड %",
      status: "स्थिति",
      actions: "क्रियाएँ",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      edit: "संपादित करें",
      disable: "अक्षम करें",
      enable: "सक्षम करें",
      meter: "मीटर",
      noMeter: "कोई मीटर नहीं",
      previous: "पिछला",
      next: "अगला",
      modalTitleAdd: "नया चक्र जोड़ें",
      modalTitleEdit: "चक्र संपादित करें",
      zoneLabel: "ज़ोन",
      connectionTypeLabel: "कनेक्शन प्रकार",
      cycleTypeLabel: "चक्र प्रकार",
      financialYearLabel: "वित्तीय वर्ष",
      billGenerationDateLabel: "बिल जनरेशन तिथि",
      billPeriodStartLabel: "बिल अवधि प्रारंभ",
      billPeriodEndLabel: "बिल अवधि समाप्त",
      currentPenaltyLabel: "वर्तमान दंड %",
      pendingPenaltyLabel: "लंबित दंड %",
      statusLabel: "स्थिति",
      cancel: "रद्द करें",
      saveCycle: "चक्र सहेजें",
    },
    en: {
      title: "Billing Cycle Master",
      subtitle: "Manage billing cycles by zone, connection type, and financial year",
      activeCycles: "Active Cycles",
      pendingCycles: "Pending Cycles",
      completedCycles: "Completed Cycles",
      totalCycles: "Total Cycles",
      searchPlaceholder: "Search by zone / class / financial year",
      allZones: "All Zones",
      allTypes: "All Types",
      allCycleTypes: "All Cycle Types",
      addNewCycle: "Add New Cycle",
      zone: "Zone",
      connectionType: "Connection Type",
      cycleType: "Cycle Type",
      financialYear: "Financial Year",
      billGenerationDate: "Bill Generation Date",
      billPeriodStart: "Bill Period Start",
      billPeriodEnd: "Bill Period End",
      currentPenalty: "Current Penalty %",
      pendingPenalty: "Pending Penalty %",
      status: "Status",
      actions: "Actions",
      active: "Active",
      inactive: "Inactive",
      edit: "Edit",
      disable: "Disable",
      enable: "Enable",
      meter: "Meter",
      noMeter: "No Meter",
      previous: "Previous",
      next: "Next",
      modalTitleAdd: "Add New Cycle",
      modalTitleEdit: "Edit Cycle",
      zoneLabel: "Zone",
      connectionTypeLabel: "Connection Type",
      cycleTypeLabel: "Cycle Type",
      financialYearLabel: "Financial Year",
      billGenerationDateLabel: "Bill Generation Date",
      billPeriodStartLabel: "Bill Period Start",
      billPeriodEndLabel: "Bill Period End",
      currentPenaltyLabel: "Current Penalty %",
      pendingPenaltyLabel: "Pending Penalty %",
      statusLabel: "Status",
      cancel: "Cancel",
      saveCycle: "Save Cycle",
      noDataFound: "No data found",
      showing: "Showing",
      of: "of",
      cycles: "cycles",
    },
  };

  const t = translations[language];

  // Fetch billing cycles from API
  useEffect(() => {
    fetchBillingCycles();
  }, [currentPage]);

  // Fetch zones from the API
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await apiService.getZones();
        setZones(response.items || []);
      } catch (error) {
        console.error("Error fetching zones:", error);
      }
    };

    fetchZones();
  }, []);

  // Fetch connection categories from the API
  useEffect(() => {
    const fetchConnectionCategories = async () => {
      try {
        const response = await apiService.getConnectionCategories();
        setConnectionCategories(response.items || []);
      } catch (error) {
        console.error("Error fetching connection categories:", error);
      }
    };

    fetchConnectionCategories();
  }, []);

  const fetchBillingCycles = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBillingCycles();
      setCycles(response.items || []); // Ensure cycles are updated correctly
      setTotalCount(response.totalCount || 0); // Update total count for pagination
    } catch (error) {
      console.error("Error fetching billing cycles:", error);
      toast.error(`Failed to fetch billing cycles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredCycles = cycles.filter((cycle) => {
    const matchesSearch =
      (cycle.zone?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (cycle.connectionType?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (cycle.cycleType?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (cycle.financialYear?.toString().toLowerCase().includes(searchQuery.toLowerCase()) || false);

    const matchesZone = selectedZone === "all" || cycle.zone === selectedZone;
    const matchesCategory = selectedConnectionCategory === "all" || cycle.connectionType === selectedConnectionCategory;
    const matchesCycleType = selectedCycleType === "all" || cycle.cycleType === selectedCycleType;

    return matchesSearch && matchesZone && matchesCategory && matchesCycleType;
  });

  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCycles = filteredCycles.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: cycles.length,
    active: cycles.filter((c) => c.status === "Active").length,
    pending: 0,
    completed: 0,
  };

  // Modal state
  const [formData, setFormData] = useState({
    zone: "",
    connectionType: "Meter" as "Meter" | "No Meter",
    cycleType: "Quarterly",
    financialYear: "2024-25",
    billGenerationDate: "",
    billPeriodStart: "",
    billPeriodEnd: "",
    currentPenaltyPercent: 5,
    pendingPenaltyPercent: 10,
    status: "Active" as "Active" | "Inactive",
  });

  const handleAddNew = async () => {
    setShowModal(true);
    try {
      // Validate form data
      if (
        !formData.zone ||
        !formData.connectionType ||
        !formData.cycleType ||
        !formData.financialYear ||
        !formData.billGenerationDate ||
        !formData.billPeriodStart ||
        !formData.billPeriodEnd
      ) {
        toast.error("Please fill in all required fields.");
        return;
      }

      const selectedZone = zones.find((zone) => zone.zoneID === parseInt(formData.zone));
      if (!selectedZone) {
        toast.error("Invalid zone selected.");
        return;
      }

      const payload: BillingCycle = {
        zoneID: selectedZone.zoneID,
        connectionTypeID: formData.connectionType === "Meter" ? 1 : 2,
        connectionCategoryID: 3, // Example value; replace with actual logic
        cycleType: formData.cycleType,
        financialYear: parseInt(formData.financialYear.split("-")[0]), // Convert to integer
        billGenerationDate: new Date(formData.billGenerationDate).toISOString(),
        billPeriodStart: new Date(formData.billPeriodStart).toISOString(),
        billPeriodEnd: new Date(formData.billPeriodEnd).toISOString(),
        currentPenalty: formData.currentPenaltyPercent || 0,
        pendingPenalty: formData.pendingPenaltyPercent || 0,
        isActive: formData.status === "Active",
        createdBy: 1, // Replace with actual user ID
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };

      // Debugging: Log payload to verify structure
      console.log("Payload being sent:", payload);

      await apiService.createBillingCycle(payload);
      toast.success("Billing cycle added successfully");
      fetchBillingCycles(); // Refresh the list after adding a new cycle
      setShowModal(false);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("A billing cycle already exists for the selected zone and connection type.");
      } else {
        console.error("Error saving billing cycle:", error);
        toast.error("Failed to save billing cycle");
      }
    }
  };

  const handleEdit = (cycle: BillingCycle) => {
    setEditingCycle(cycle);
    setFormData({
      zone: cycle.zone,
      connectionType: cycle.connectionType,
      cycleType: cycle.cycleType,
      financialYear: cycle.financialYear,
      billGenerationDate: cycle.billGenerationDate,
      billPeriodStart: cycle.billPeriodStart,
      billPeriodEnd: cycle.billPeriodEnd,
      currentPenaltyPercent: cycle.currentPenalty,
      pendingPenaltyPercent: cycle.pendingPenalty,
      status: cycle.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Validate form data
      if (
        !formData.zone ||
        !formData.connectionType ||
        !formData.cycleType ||
        !formData.financialYear ||
        !formData.billGenerationDate ||
        !formData.billPeriodStart ||
        !formData.billPeriodEnd
      ) {
        toast.error("Please fill in all required fields.");
        return;
      }

      const selectedZone = zones.find((zone) => zone.zoneID === parseInt(formData.zone));
      if (!selectedZone) {
        toast.error("Invalid zone selected.");
        return;
      }

      const payload = {
        zoneID: selectedZone.zoneID,
        connectionCategoryID: 3, // Example value; replace with actual logic
        cycleType: formData.cycleType,
        financialYear: parseInt(formData.financialYear.split("-")[0]), // Convert to integer
        billGenerationDate: new Date(formData.billGenerationDate).toISOString(), // Convert to ISO format
        billPeriodStartDate: new Date(formData.billPeriodStart).toISOString(), // Convert to ISO format
        billPeriodEndDate: new Date(formData.billPeriodEnd).toISOString(), // Convert to ISO format
        currentPenaltyPercent: formData.currentPenaltyPercent || 0,
        pendingPenaltyPercent: formData.pendingPenaltyPercent || 0,
        numberOfCycles: 1, // Example value; replace with actual logic
        isActive: formData.status === "Active",
        createdBy: 1, // Replace with actual user ID
        createdDate: new Date().toISOString(), // Ensure ISO format
        updatedDate: new Date().toISOString(), // Ensure ISO format
      };

      // Debugging: Log payload to verify structure
      console.log("Payload being sent:", payload);

      if (editingCycle) {
        await apiService.updateBillingCycle(editingCycle.id, payload);
        toast.success("Billing cycle updated successfully");
      } else {
        await apiService.createBillingCycle(payload);
        toast.success("Billing cycle added successfully");
      }

      fetchBillingCycles(); // Refresh the list after adding/updating a cycle
      setShowModal(false);
    } catch (error) {
      // Debugging: Log error details
      console.error("Error saving billing cycle:", error);
      toast.error("Failed to save billing cycle");
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const cycle = cycles.find((c) => c.id === id);
      if (cycle) {
        const updatedCycle = await apiService.updateBillingCycle(id, {
          ...cycle,
          isActive: !cycle.isActive,
        });
        setCycles(cycles.map((c) => (c.id === id ? updatedCycle : c)));
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteBillingCycle(id);
      fetchBillingCycles();
      toast.success("Billing cycle deleted successfully");
    } catch {
      toast.error("Failed to delete billing cycle");
    }
  };

  return (
    <div className="flex-1 bg-[#F5F9FC] p-4 sm:p-6 lg:p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Cycles Card */}
        <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 rounded-lg p-2.5 flex-shrink-0">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {cycles.length} {/* Display the total number of cycles */}
              </p>
              <p className="text-sm text-gray-600 truncate">
                Total Cycles
              </p>
            </div>
          </div>
        </div>
        {/* Active Cycles Card */}
        <div className="bg-white rounded-xl p-5 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="bg-green-500 rounded-lg p-2.5 flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stats.active}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {t.activeCycles}
              </p>
            </div>
          </div>
        </div>
        {/* Pending Cycles Card */}
        <div className="bg-white rounded-xl p-5 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="bg-orange-500 rounded-lg p-2.5 flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stats.pending}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {t.pendingCycles}
              </p>
            </div>
          </div>
        </div>
        {/* Completed Cycles Card */}
        <div className="bg-white rounded-xl p-5 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500 rounded-lg p-2.5 flex-shrink-0">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stats.completed}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {t.completedCycles}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Zones Dropdown */}
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="all">{t.allZones}</option>
              {zones.map((zone) => (
                <option key={zone.zoneID} value={zone.zoneID}>
                  {zone.zoneName}
                </option>
              ))}
            </select>
            {/* Connection Categories Dropdown */}
            <select
              value={selectedConnectionCategory}
              onChange={(e) => setSelectedConnectionCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="all">{t.allTypes}</option>
              <option value="Meter">{t.meter}</option>
              <option value="No Meter">{t.noMeter}</option>
            </select>
            {/* Cycle Types Dropdown */}
            <select
              value={selectedCycleType}
              onChange={(e) => setSelectedCycleType(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="all">{t.allCycleTypes}</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-Yearly">Half-Yearly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          {/* Add Button */}
          <button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-[#005AA7] via-[#0077B6] to-[#00C6FF] text-white px-6 py-2.5 rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2 justify-center whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            {t.addNewCycle}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#005A9C] to-[#0077CC] text-white">
              <tr>
                <th className="px-4 py-4 text-left text-sm">{t.zone}</th>
                <th className="px-4 py-4 text-left text-sm">{t.connectionType}</th>
                <th className="px-4 py-4 text-left text-sm">{t.cycleType}</th>
                <th className="px-4 py-4 text-left text-sm">{t.financialYear}</th>
                <th className="px-4 py-4 text-left text-sm">{t.billGenerationDate}</th>
                <th className="px-4 py-4 text-left text-sm">{t.billPeriodStart}</th>
                <th className="px-4 py-4 text-left text-sm">{t.billPeriodEnd}</th>
                <th className="px-4 py-4 text-center text-sm">{t.currentPenalty}</th>
                <th className="px-4 py-4 text-center text-sm">{t.pendingPenalty}</th>
                <th className="px-4 py-4 text-center text-sm">{t.status}</th>
                <th className="px-4 py-4 text-center text-sm">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCycles.map((cycle, index) => (
                <tr
                  key={cycle.id || index} // Ensure key is unique
                  className={`hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-4 text-gray-900">{cycle.zone}</td>
                  <td className="px-4 py-4 text-gray-700">{cycle.connectionType}</td>
                  <td className="px-4 py-4 text-gray-700">{cycle.cycleType}</td>
                  <td className="px-4 py-4 text-gray-700">{cycle.financialYear}</td>
                  <td className="px-4 py-4 text-gray-700">{cycle.billGenerationDate}</td>
                  <td className="px-4 py-4 text-gray-700">{cycle.billPeriodStart}</td>
                  <td className="px-4 py-4 text-gray-700">{cycle.billPeriodEnd}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-300">
                      {cycle.currentPenalty}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 border border-orange-300">
                      {cycle.pendingPenalty}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs ${
                        cycle.status === "Active"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      {cycle.status === "Active" ? t.active : t.inactive}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(cycle)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t.edit}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(cycle.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          cycle.status === "Active"
                            ? "text-red-600 hover:bg-red-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={cycle.status === "Active" ? t.disable : t.enable}
                      >
                        {cycle.status === "Active" ? (
                          <>
                            <X className="h-4 w-4" />
                            {t.disable}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            {t.enable}
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + itemsPerPage, filteredCycles.length)} of {filteredCycles.length} cycles
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#005A9C] to-[#0077CC] px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingCycle ? t.modalTitleEdit : t.modalTitleAdd}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Zone Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.zoneLabel}
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      zone: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Zone</option>
                  {zones.map((zone) => (
                    <option key={zone.zoneID} value={zone.zoneID}>
                      {zone.zoneName}
                    </option>
                  ))}
                </select>
              </div>
              {/* Row 1: Connection Type and Cycle Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Connection Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.connectionTypeLabel}
                  </label>
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="connectionType"
                        checked={formData.connectionType === "Meter"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            connectionType: "Meter",
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">{t.meter}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="connectionType"
                        checked={formData.connectionType === "No Meter"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            connectionType: "No Meter",
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">{t.noMeter}</span>
                    </label>
                  </div>
                </div>
                {/* Cycle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.cycleTypeLabel}
                  </label>
                  <select
                    value={formData.cycleType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cycleType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              {/* Row 2: Financial Year, Bill Generation Date, Bill Period Start */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Financial Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.financialYearLabel}
                  </label>
                  <select
                    value={formData.financialYear}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        financialYear: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="2023-24">2023-24</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2025-26">2025-26</option>
                  </select>
                </div>
                {/* Bill Generation Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.billGenerationDateLabel}
                  </label>
                  <input
                    type="date"
                    value={formData.billGenerationDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billGenerationDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                {/* Bill Period Start */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.billPeriodStartLabel}
                  </label>
                  <input
                    type="date"
                    value={formData.billPeriodStart}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billPeriodStart: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              {/* Row 3: Bill Period End, Current Penalty, Pending Penalty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Bill Period End */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.billPeriodEndLabel}
                  </label>
                  <input
                    type="date"
                    value={formData.billPeriodEnd}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billPeriodEnd: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                {/* Current Penalty Percent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.currentPenaltyLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.currentPenaltyPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPenaltyPercent: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                {/* Pending Penalty Percent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.pendingPenaltyLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.pendingPenaltyPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pendingPenaltyPercent: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              {/* Row 4: Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.statusLabel}
                  </label>
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === "Active"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            status: "Active",
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">{t.active}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === "Inactive"}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            status: "Inactive",
                          })
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-gray-700">{t.inactive}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-[#005AA7] via-[#0077B6] to-[#00C6FF] text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                {t.saveCycle}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
