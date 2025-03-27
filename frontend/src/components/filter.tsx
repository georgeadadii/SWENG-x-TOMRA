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
  return (
    <div className="w-full max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Image Classification Filters</h2>
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
        <p className="text-sm text-muted-foreground">Filter classification images based on various criteria.</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Dropdown
          trigger={
            <Box variant="outline" className="w-[180px] justify-between h-9">
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
            <Box variant="outline" className="w-[180px] justify-between h-9">
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

        <div className="w-full sm:w-[300px]"> 
          <MultiSelect
            options={labelOptions}
            selected={selectedLabels}
            onChange={setSelectedLabels}
            placeholder="Search labels..."
            className="w-full h-9"
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        Showing results for: {dateFilters.find(f => f.value === dateFilter)?.label || 'Any date'}, {statusFilters.find(f => f.value === statusFilter)?.label || 'All statuses'} 
        {selectedLabels.length > 0 && <>, Labels: {selectedLabels.map((label) => label.label).join(", ")}</>}
      </div>
    </div>
  )
}