"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ImageSwiper from "@/components/ImageSwiper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SwipingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get("batchId");
  const returnUrl = searchParams.get("returnUrl") || "/batches";

  const handleGoBack = () => {
    router.push(returnUrl);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center">
        {batchId && (
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="flex items-center gap-1 text-gray-700 h-8 px-3 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Batches
          </Button>
        )}
        <h1 className="text-xl font-semibold text-gray-800 ml-4">
          {batchId ? `Review Batch: ${batchId}` : "Review All Images"}
        </h1>
      </header>
      
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
          <ImageSwiper 
            batchId={batchId || undefined} 
            onReviewComplete={batchId ? handleGoBack : undefined} 
          />
        </div>
      </div>
    </div>
  );
};

export default SwipingPage;