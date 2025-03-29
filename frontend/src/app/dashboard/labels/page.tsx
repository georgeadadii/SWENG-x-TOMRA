"use client";

import { useState } from "react";
import LabelList from "@/components/LabelList"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Box } from "@/components/ui/box";
import { Info } from "lucide-react";

const LabelsPage: React.FC = () => {
  const [selectedLabels, setSelectedLabels] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-screen">
        
        {/* Compact header section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 flex-shrink-0">
          <div className="p-4 flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-800">Label View</h1>
            <Dialog>
              <DialogTrigger>
                <Box variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                </Box>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About Label View</DialogTitle>
                  <DialogDescription>
                    The Label View page shows you a comprehensive overview of all labels used in your image classification system.
                  </DialogDescription>
                </DialogHeader>
                <p className="my-4 text-sm">
                  You can see which labels are currently in use and how many images are associated with each label.
                  This helps you understand the distribution of labels in your dataset and identify any unused labels.
                </p>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Content area */}
        <div className="flex-grow">
          <LabelList />
        </div>
      </div>
    </div>
  );
};

export default LabelsPage;