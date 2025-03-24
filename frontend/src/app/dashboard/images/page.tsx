"use client";

import { useState } from "react";
import { ImageClassificationFilter } from "@/components/filter";
import ImageGrid from "@/components/ImageGrid";
import { MultiSelect, type Option } from "@/components/ui/multi-select";

type StatusFilter = 'all' | 'correct' | 'misclassified' | 'not reviewed';
type DateFilter = 'today' | 'yesterday' | 'last7days' | 'last30days'| 'all';

const DashboardPage: React.FC = () => {
  const [selectedLabels, setSelectedLabels] = useState<Option[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const handleSelectedLabelsChange = (labels: Option[]) => {
    console.log(labels);
    setSelectedLabels(labels);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">Gallery</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6">
            <ImageClassificationFilter
              selectedLabels={selectedLabels}
              setSelectedLabels={handleSelectedLabelsChange}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
            />
          </div>
        </div>

        <ImageGrid 
          selectedLabels={selectedLabels} 
          setSelectedLabels={handleSelectedLabelsChange} 
          statusFilter={statusFilter} 
          dateFilter={dateFilter}
        />
      </div>
    </div>
  );
};

export default DashboardPage;