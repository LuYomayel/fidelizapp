import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IEmployee } from "@shared";

interface EmployeeSelectProps {
  employees: IEmployee[];
  selectedEmployeeId: number | null;
  onEmployeeChange: (employeeId: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function EmployeeSelect({
  employees,
  selectedEmployeeId,
  onEmployeeChange,
  placeholder = "Seleccionar empleado",
  disabled = false,
}: EmployeeSelectProps) {
  return (
    <Select
      value={selectedEmployeeId?.toString() || ""}
      onValueChange={(value) => onEmployeeChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {employees.map((employee) => (
          <SelectItem key={employee.id} value={employee.id.toString()}>
            <div className="flex items-center gap-2">
              <span>
                {employee.firstName} {employee.lastName}
              </span>
              {employee.isDefault && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Por defecto
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
