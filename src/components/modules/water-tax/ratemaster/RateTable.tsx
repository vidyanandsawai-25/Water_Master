/**
 * Water Rate Table Component
 * Clean, reusable table component with proper separation of concerns
 */

import { Checkbox } from "@/components/common/ratemaster/checkbox";
import { Badge } from "@/components/common/ratemaster/badge";
import { Button } from "@/components/common/ratemaster/button";
import { Edit2, ToggleLeft, ToggleRight, CheckCircle2, X } from "lucide-react";
import { categoryActions } from "@/app/ratemaster/action"; // Adjust path as needed
import { toast } from "react-toastify";

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
  zoneNo?: string;
  wardNo?: string;
}

interface RateTableProps {
  rates: WaterRate[];
  selectedRows: number[];
  startIndex: number;
  onSelectAll: () => void;
  onSelectRow: (id: number) => void;
  onEdit: (rate: WaterRate) => void;
  onToggleStatus: (id: number) => void;
  translations: {
    srNo: string;
    zoneNo: string;
    wardNo: string;
    tableCategory: string;
    tableConnectionType: string;
    tableTapSize: string;
    tableRatePerKL: string;
    tableAnnualRate: string;
    tableMinCharge: string;
    tableMeterPenalty: string;
    tableStatus: string;
    tableActions: string;
    active: string;
    inactive: string;
    edit: string;
    disable: string;
    enable: string;
  };
  translateCategory: (category: string) => string;
  translateConnectionType: (type: string) => string;
}

export function RateTable({
  rates,
  selectedRows,
  startIndex,
  onSelectAll,
  onSelectRow,
  onEdit,
  onToggleStatus,
  translations: t,
  translateCategory,
  translateConnectionType,
}: RateTableProps) {
  const allSelected = rates.length > 0 && selectedRows.length === rates.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#005A9C] text-white text-sm">
            <th className="px-3 py-2.5 text-center w-12 font-semibold">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                className="border-white"
              />
            </th>
            <th className="px-2 py-2 text-center font-semibold">{t.srNo}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.zoneNo}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.wardNo}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.tableCategory}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.tableConnectionType}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.tableTapSize}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.tableRatePerKL}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.tableAnnualRate}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.tableMinCharge}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.tableMeterPenalty}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.tableStatus}</th>
            <th className="px-2 py-2 text-center font-semibold">{t.tableActions}</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate, index) => (
            <RateTableRow
              key={rate.id}
              rate={rate}
              index={startIndex + index}
              isSelected={selectedRows.includes(rate.id)}
              isEven={index % 2 === 0}
              onSelect={() => onSelectRow(rate.id)}
              onEdit={() => onEdit(rate)}
              onToggleStatus={() => onToggleStatus(rate.id)}
              translations={t}
              translateCategory={translateCategory}
              translateConnectionType={translateConnectionType}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface RateTableRowProps {
  rate: WaterRate;
  index: number;
  isSelected: boolean;
  isEven: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  translations: RateTableProps["translations"];
  translateCategory: (category: string) => string;
  translateConnectionType: (type: string) => string;
}

function RateTableRow({
  rate,
  index,
  isSelected,
  isEven,
  onSelect,
  onEdit,
  onToggleStatus,
  translations: t,
  translateCategory,
  translateConnectionType,
}: RateTableRowProps) {
  const bgClass = isSelected
    ? "bg-blue-50"
    : isEven
    ? "bg-white"
    : "bg-gray-50";

  return (
    <tr className={`${bgClass} hover:bg-blue-100 transition-colors`}>
      <td className="px-2 py-2 text-center">
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </td>
      <td className="px-2 py-2 text-xs text-gray-700 text-center">{index + 1}</td>
      <td className="px-2 py-2 text-xs text-gray-700 text-center font-medium">{rate.zoneNo}</td>
      <td className="px-2 py-2 text-xs text-gray-700 text-center font-medium">{rate.wardNo}</td>
      <td className="px-2 py-2 text-xs text-gray-900 text-center">{translateCategory(rate.category)}</td>
      <td className="px-2 py-2 text-xs text-gray-700 text-center">{translateConnectionType(rate.connectionType)}</td>
      <td className="px-2 py-2 text-xs text-gray-700 text-center">{rate.tapSize}</td>
      <td className="px-2 py-2 text-center text-xs text-gray-900">
        {rate.ratePerKL > 0 ? `₹${rate.ratePerKL}` : "-"}
      </td>
      <td className="px-2 py-2 text-center text-xs text-gray-900">
        {rate.annualFlatRate > 0 ? `₹${rate.annualFlatRate}` : "-"}
      </td>
      <td className="px-2 py-2 text-center text-xs text-gray-900">₹{rate.minimumCharge}</td>
      <td className="px-2 py-2 text-center text-xs text-gray-900">
        {rate.meterOffPenalty > 0 ? `₹${rate.meterOffPenalty}` : "-"}
      </td>
      <td className="px-2 py-2 text-center">
        {rate.status === "Active" ? (
          <Badge className="bg-green-500 text-white border-0 px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t.active}
          </Badge>
        ) : (
          <Badge className="bg-red-500 text-white border-0 px-3 py-1 rounded-full text-xs font-semibold flex items-center justify-center gap-1">
            <X className="h-3 w-3 mr-1" />
            {t.inactive}
          </Badge>
        )}
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={onEdit}
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
            title={t.edit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={onToggleStatus}
            size="sm"
            variant="ghost"
            className={`h-7 w-7 p-0 transition-colors ${
              rate.status === "Active"
                ? "text-red-600 hover:bg-red-50"
                : "text-green-600 hover:bg-green-50"
            }`}
            title={rate.status === "Active" ? t.disable : t.enable}
          >
            {rate.status === "Active" ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
}
