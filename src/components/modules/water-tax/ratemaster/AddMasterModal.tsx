'use client';

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/common/ratemaster/button";
import { Input } from "@/components/common/ratemaster/input";
import { Label } from "@/components/common/ratemaster/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/common/ratemaster/dialog";
import { toast } from "sonner";

interface AddMasterModalProps {
  type: "category" | "type" | "size";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: string[];
  setItems: (items: string[]) => void;
  language: string;
}

const translations = {
  en: {
    category: "Category",
    type: "Connection Type",
    size: "Tap Size",
    addCategory: "Add New Category",
    addType: "Add New Type",
    addSize: "Add New Size",
    categoryName: "Category Name",
    typeName: "Type Name",
    sizeName: "Size Name",
    enterCategoryName: "Enter category name",
    enterTypeName: "Enter type name",
    enterSizeName: "Enter size in mm (e.g. 15, 20, 25)",
    save: "Save",
    close: "Close",
    existing: "Existing",
    action: "Action",
    srNo: "Sr. No",
    alreadyExists: "Already exists",
    pleaseEnter: "Please enter",
    deleted: "Deleted!",
  },
  mr: {
    category: "वर्ग",
    type: "कनेक्शन प्रकार",
    size: "नळ आकार",
    addCategory: "नवीन वर्ग जोडा",
    addType: "नवीन प्रकार जोडा",
    addSize: "नवीन आकार जोडा",
    categoryName: "वर्ग नाव",
    typeName: "प्रकार नाव",
    sizeName: "आकार नाव",
    enterCategoryName: "वर्ग नाव प्रविष्ट करा",
    enterTypeName: "प्रकार नाव प्रविष्ट करा",
    enterSizeName: "मिमी मध्ये आकार प्रविष्ट करा (उदा. 15, 20, 25)",
    save: "जतन करा",
    close: "बंद करा",
    existing: "विद्यमान",
    action: "कृती",
    srNo: "अ.क्र.",
    alreadyExists: "आधीच अस्तित्वात आहे",
    pleaseEnter: "कृपया प्रविष्ट करा",
    deleted: "हटवला गेला!",
  },
  hi: {
    category: "वर्ग",
    type: "कनेक्शन प्रकार",
    size: "नल आकार",
    addCategory: "नया वर्ग जोड़ें",
    addType: "नया प्रकार जोड़ें",
    addSize: "नया आकार जोड़ें",
    categoryName: "वर्ग का नाम",
    typeName: "प्रकार का नाम",
    sizeName: "आकार का नाम",
    enterCategoryName: "वर्ग का नाम दर्ज करें",
    enterTypeName: "प्रकार का नाम दर्ज करें",
    enterSizeName: "मिमी में आकार दर्ज करें (जैसे 15, 20, 25)",
    save: "सहेजें",
    close: "बंद करें",
    existing: "मौजूदा",
    action: "कार्रवाई",
    srNo: "क्र. सं.",
    alreadyExists: "पहले से मौजूद है",
    pleaseEnter: "कृपया दर्ज करें",
    deleted: "हटाया गया!",
  },
};

export function AddMasterModal({
  type,
  open,
  onOpenChange,
  items,
  setItems,
  language,
}: AddMasterModalProps) {
  const t = translations[language] || translations.en;
  const [inputValue, setInputValue] = useState("");

  const getTitle = () => {
    if (type === "category") return t.addCategory;
    if (type === "type") return t.addType;
    return t.addSize;
  };

  const getLabel = () => {
    if (type === "category") return t.categoryName;
    if (type === "type") return t.typeName;
    return t.sizeName;
  };

  const getPlaceholder = () => {
    if (type === "category") return t.enterCategoryName;
    if (type === "type") return t.enterTypeName;
    return t.enterSizeName;
  };

  const handleAdd = () => {
    const value = inputValue.trim();
    if (!value) {
      toast.error(`${t.pleaseEnter} ${getLabel()}`);
      return;
    }
    let formattedValue = value;
    if (type === "size") {
      const num = parseInt(value);
      if (isNaN(num) || num <= 0) {
        toast.error(t.enterSizeName);
        return;
      }
      formattedValue = `${num}mm`;
    }
    if (items.includes(formattedValue)) {
      toast.error(`${getLabel()} ${t.alreadyExists}`);
      return;
    }
    setItems([...items, formattedValue]);
    toast.success(`✅ ${getLabel()} ${t.save}!`);
    setInputValue("");
  };

  const handleDelete = (item: string) => {
    setItems(items.filter((i) => i !== item));
    toast.success(`✅ ${getLabel()} ${t.deleted}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-2xl shadow-2xl border-0 w-[95vw] sm:w-[90vw] md:max-w-md p-0 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-br from-blue-50 via-white to-transparent">
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-br ${
              type === "category"
                ? "from-blue-500 to-blue-600"
                : type === "type"
                ? "from-green-500 to-green-600"
                : "from-purple-500 to-purple-600"
            } p-2.5 rounded-xl shadow-lg`}>
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className={`${
                type === "category"
                  ? "text-[#005A9C]"
                  : type === "type"
                  ? "text-green-700"
                  : "text-purple-700"
              } text-base sm:text-lg mb-0.5`}>
                {getTitle()}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {getPlaceholder()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/30">
          <div className="space-y-2">
            <Label className="text-xs text-gray-700 font-semibold">
              {getLabel()}
            </Label>
            <div className="flex gap-2">
              <Input
                type={type === "size" ? "number" : "text"}
                placeholder={getPlaceholder()}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAdd();
                  }
                }}
                className={`h-10 text-sm bg-white border-gray-300 hover:border-${
                  type === "category"
                    ? "[#005A9C]"
                    : type === "type"
                    ? "green-500"
                    : "purple-500"
                } transition-colors flex-1`}
                min={type === "size" ? "1" : undefined}
                step={type === "size" ? "1" : undefined}
              />
              <Button
                onClick={handleAdd}
                size="default"
                className={`h-10 px-4 text-sm bg-gradient-to-r ${
                  type === "category"
                    ? "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    : type === "type"
                    ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    : "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                } shadow-md`}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t.save}
              </Button>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="space-y-3">
            <Label className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
              {t.existing} {getLabel()} ({items.length})
            </Label>
            <div className={`border ${
              type === "category"
                ? "border-blue-200"
                : type === "type"
                ? "border-green-200"
                : "border-purple-200"
            } rounded-lg overflow-hidden`}>
              <table className="w-full">
                <thead className={`${
                  type === "category"
                    ? "bg-blue-100 border-b border-blue-200"
                    : type === "type"
                    ? "bg-green-100 border-b border-green-200"
                    : "bg-purple-100 border-b border-purple-200"
                }`}>
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide w-16">
                      {t.srNo}
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide">
                      {getLabel()}
                    </th>
                    <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide w-20">
                      {t.action}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors group">
                      <td className="px-3 py-2.5 text-xs text-gray-700 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-800 font-medium">
                        {item}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Button
                          onClick={() => handleDelete(item)}
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
              onOpenChange(false);
              setInputValue("");
            }}
            variant="outline"
            size="default"
            className="h-10 px-6 text-sm border-gray-300 hover:bg-gray-100"
          >
            {t.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
