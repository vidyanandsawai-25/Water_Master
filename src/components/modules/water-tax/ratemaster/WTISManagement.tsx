'use client';

import React, { useState } from "react";
import { Language } from "@/app/page";
import  {RateMaster}  from "./RateMaster";
import { BillingCycleTab } from "./BillingCycleTab";
import { Settings, IndianRupee, FileText, Zap } from "lucide-react";
import { Badge } from "@/components/common/ratemaster/badge";
import { Button } from "@/components/common/ratemaster/button";

// Dummy translation object for header
const translations = {
  en: {
    title: "WTIS Management",
    rateMaster: "Rate Master",
    billingCycleMaster: "Billing Cycle Master",
    filtersActive: "Active Filters",
  },
  hi: {
    title: "WTIS प्रबंधन",
    rateMaster: "दर मास्टर",
    billingCycleMaster: "बिलिंग सायकल मास्टर",
    filtersActive: "सक्रिय फिल्टर",
  },
  mr: {
    title: "WTIS व्यवस्थापन",
    rateMaster: "दर मास्टर",
    billingCycleMaster: "बिलिंग सायकल मास्टर",
    filtersActive: "सक्रिय फिल्टर",
  },
};

export function WTISManagement({ language }: { language: Language }) {
  const [activeTab, setActiveTab] = useState<"rateMaster" | "billingCycle">("rateMaster");
  // For header badge, you may want to lift this state up from RateMaster if needed
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const t = translations[language] || translations.en;

  return (
    <div className="flex-1 h-screen overflow-auto p-2 md:p-3 bg-gradient-to-br from-[#F8FBFF] via-[#EEF5FC] to-[#E9F1FA]">
      <div className="max-w-[1800px] mx-auto w-full">
        {/* Header with Gradient - Compact */}
        <div className="relative bg-gradient-to-r from-[#005A9C] via-[#0077CC] to-[#005A9C] text-white p-1.5 md:p-2 rounded-lg mb-2 md:mb-3 shadow-xl overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-1.5">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm p-1 rounded-lg shadow-lg">
                <Settings className="h-3 w-3 md:h-4 md:w-4" />
              </div>
              <div>
                <h1 className="text-xs md:text-sm mb-0">{t.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-1.5 py-0.5 shadow-lg text-[10px] md:text-xs">
                  <Zap className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                  {t.filtersActive}: {activeFiltersCount}
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
                {t.rateMaster}
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
                {t.billingCycleMaster}
              </Button>
            </div>
          </div>
        </div>
        {/* Tabs */}
        {activeTab === "rateMaster" && (
          <RateMaster language={language} setActiveFiltersCount={setActiveFiltersCount} />
        )}
        {activeTab === "billingCycle" && (
          <BillingCycleTab language={language} />
        )}
      </div>
    </div>
  );
}
