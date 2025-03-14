"use client";

import { useState } from "react";
import { ImageClassificationFilter } from "@/components/filter";
import ImageGrid from "@/components/ImageGrid";
import { MultiSelect, type Option } from "@/components/ui/multi-select";

type StatusFilter = 'all' | 'correct' | 'misclassified' | 'not reviewed';
type DateFilter = 'today' | 'yesterday' | 'last7days' | 'last30days'|'all';
const DashboardPage: React.FC = () => {

  const [selectedLabels, setSelectedLabels] = useState<Option[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const handleSelectedLabelsChange = (labels: Option[]) => {
    console.log(labels); // Debugging selected labels
    setSelectedLabels(labels); // Update the selected labels state
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Gallery</h1>
      <div className="container mx-auto py-10">
        <ImageClassificationFilter
          selectedLabels={selectedLabels}
          setSelectedLabels={handleSelectedLabelsChange}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}


        />
      </div>

      <ImageGrid selectedLabels={selectedLabels} setSelectedLabels={handleSelectedLabelsChange} statusFilter={statusFilter} dateFilter={dateFilter}/>
    </div>
  );
};

export default DashboardPage;
