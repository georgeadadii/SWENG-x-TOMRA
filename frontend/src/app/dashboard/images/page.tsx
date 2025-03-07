"use client";

import { useState } from "react";
import { ImageClassificationFilter } from "@/components/filter";
import ImageGrid from "@/components/ImageGrid";
import { MultiSelect, type Option } from "@/components/ui/multi-select";

const DashboardPage: React.FC = () => {

  const [selectedLabels, setSelectedLabels] = useState<Option[]>([]);

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
        />
      </div>

      <ImageGrid selectedLabels={selectedLabels} setSelectedLabels={handleSelectedLabelsChange} />
    </div>
  );
};

export default DashboardPage;
