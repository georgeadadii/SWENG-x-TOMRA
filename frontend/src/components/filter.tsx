"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, CheckCircle, CircleSlash, ChevronDown, Filter, XCircle, Info } from "lucide-react"

import { Box } from "@/components/ui/box"
import { Dropdown, DropdownItem } from "@/components/ui/dropdown"
import { MultiSelect, type Option } from "@/components/ui/multi-select"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

type StatusFilter = 'all' | 'correct' | 'misclassified' | 'not reviewed';
type DateFilter = 'today' | 'yesterday' | 'last7days' | 'last30days'|'all';

const GRAPHQL_ENDPOINT = "http://localhost:8000/graphql";

type FilterOption = {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

const batchFilters:FilterOption[] = [
  { value: "batch1", label: "Batch 1" },
  { value: "batch2", label: "Batch 2" },
  { value: "batch3", label: "Batch 3" },
]

const dateFilters: { value: DateFilter; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 days" },
  { value: "last30days", label: "Last 30 days" },
  { value: "all", label: "Any date" },
]

const statusFilters: { value: StatusFilter; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
  { value: "all", label: "All statuses" },
  { value: "correct", label: "Correct", icon: CheckCircle },
  { value: "misclassified", label: "Misclassified", icon: XCircle },
  { value: "not reviewed", label: "Not reviewed", icon: CircleSlash },
]

/*const confidenceFilters: FilterOption[] = [
  { value: "all", label: "All confidence levels" },
  { value: "high", label: "High confidence (>90%)" },
  { value: "medium", label: "Medium confidence (70-90%)" },
  { value: "low", label: "Low confidence (<70%)" },
]*/


const labelOptions: Option[] = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "sheep", label: "Sheep" },
  { value: "cow", label: "Cow" },
  { value: "person", label: "Person" },
  { value: "car", label: "Car" },
  { value: "animal", label: "Animal" },
  { value: "building", label: "Building" },
  { value: "nature", label: "Nature" },
  { value: "food", label: "Food" },
  { value: "technology", label: "Technology" },
]

export function ImageClassificationFilter({ 
  selectedLabels = [],  
  setSelectedLabels,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
}: { 
  selectedLabels?: Option[], 
  setSelectedLabels: (labels: Option[]) => void,
  statusFilter: StatusFilter,
  setStatusFilter: (status: StatusFilter) => void,
  dateFilter: DateFilter,
  setDateFilter: (status: DateFilter) => void
}) { 
  //const [dateFilter, setDateFilter] = useState<FilterOption>(dateFilters[2])
  //const [confidenceFilter, setConfidenceFilter] = useState<FilterOption>(confidenceFilters[0])
  //const [selectedLabels, setSelectedLabels] = useState<Option[]>([])

  return (
    <div className="w-full max-w-7xl mx-auto p-5">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Image Classification Filters</h2>
          <p className="text-muted-foreground">Filter classification images based on various criteria.</p>
        </div>
        <Dialog>
          <DialogTrigger>
            <Box variant="outline" size="icon">
              <Info className="h-4 w-4" />
            </Box>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>About Image Classification Filters</DialogTitle>
              <DialogDescription>
                This tool allows you to filter and sort through classified images based on various criteria such as
                date of creation, classification status and labels.
              </DialogDescription>
            </DialogHeader>
            <p className="my-4 text-sm">
              Use the dropdown menus and multi-select options to refine your search and find the exact images you're
              looking for.
            </p>
            
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap items-start gap-4 mb-6">
        <Dropdown
          trigger={
            <Box variant="outline" className="w-[200px] justify-between">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilters.find(f => f.value === dateFilter)?.label || 'Any date'}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Box>
          }
        >
          {dateFilters.map((filter) => (
            <DropdownItem key={filter.value} onClick={() => setDateFilter(filter.value)}>
              {filter.label}
              {filter.value === dateFilter && 
                <CheckCircle className="ml-auto h-4 w-4 opacity-50" />
              }
            </DropdownItem>
          ))}
        </Dropdown>

        <Dropdown
          trigger={
            <Box variant="outline" className="w-[200px] justify-between">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilters.find(f => f.value === statusFilter)?.label || 'All statuses'}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Box>
          }
        >
          {statusFilters.map((filter) => (
            <DropdownItem 
              key={filter.value} 
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.icon && <filter.icon className="h-4 w-4 mr-2" />}
              {filter.label}
              {filter.value === statusFilter && 
                <CheckCircle className="ml-auto h-4 w-4 opacity-50" />
              }
            </DropdownItem>
          ))}
        </Dropdown>

        {/*<Dropdown
          trigger={
            <Box variant="outline" className="w-[200px] justify-between">
              <Filter className="mr-2 h-4 w-4" />
              {confidenceFilter.label}
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Box>
          }
        >
          {confidenceFilters.map((filter) => (
            <DropdownItem key={filter.value} onClick={() => setConfidenceFilter(filter)}>
              {filter.label}
              {filter.value === confidenceFilter.value && <CheckCircle className="ml-auto h-4 w-4 opacity-50" />}
            </DropdownItem>
          ))}
        </Dropdown>*/}

        <div className="w-full sm:w-[300px]">
          <MultiSelect
            options={labelOptions}
            selected={selectedLabels}
            onChange={setSelectedLabels}
            placeholder="Search labels..."
            className="w-full"
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-6">
        Showing results for: {dateFilters.find(f => f.value === dateFilter)?.label || 'Any date'}, {statusFilters.find(f => f.value === statusFilter)?.label || 'All statuses'},
        {selectedLabels.length > 0 && <> Labels: {selectedLabels.map((label) => label.label).join(", ")}</>}
      </div>

    </div>
  )
}