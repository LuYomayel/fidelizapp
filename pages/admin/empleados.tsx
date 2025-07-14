import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Filters } from "@/components/ui/filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Star,
  UserCheck,
  Search,
  RefreshCw,
} from "lucide-react";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { api } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import { IEmployee, ICreateEmployeeDto, IUpdateEmployeeDto } from "@shared";

export default function EmpleadosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(
    null
  );

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    isDefault: false,
  });

  useEffect(() => {
    loadEmployees();
  }, [currentPage, itemsPerPage, statusFilter]);

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        loadEmployees();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setCurrentPage(1);
      loadEmployees();
    }
  }, [searchTerm]);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await api.employees.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        isDefault:
          statusFilter === "default"
            ? true
            : statusFilter === "normal"
            ? false
            : undefined,
      });

      if (response.success && response.data) {
        setEmployees(response.data.employees || []);
        setTotalItems(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      } else {
        toast.error("Error al cargar los empleados");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los empleados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("El nombre y apellido son requeridos");
        return;
      }

      const response = await api.employees.create({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        isDefault: formData.isDefault,
      });

      if (response.success) {
        toast.success("Empleado creado exitosamente");
        setIsCreateDialogOpen(false);
        resetForm();
        loadEmployees();
      } else {
        toast.error(response.error || "Error al crear el empleado");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear el empleado");
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("El nombre y apellido son requeridos");
        return;
      }

      const response = await api.employees.update(selectedEmployee.id, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        isDefault: formData.isDefault,
      });

      if (response.success) {
        toast.success("Empleado actualizado exitosamente");
        setIsEditDialogOpen(false);
        resetForm();
        loadEmployees();
      } else {
        toast.error(response.error || "Error al actualizar el empleado");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el empleado");
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await api.employees.delete(selectedEmployee.id);

      if (response.success) {
        toast.success("Empleado eliminado exitosamente");
        setIsDeleteDialogOpen(false);
        setSelectedEmployee(null);
        loadEmployees();
      } else {
        toast.error(response.error || "Error al eliminar el empleado");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar el empleado");
    }
  };

  const handleToggleDefault = async (employee: IEmployee) => {
    try {
      if (employee.isDefault) {
        // No se puede desactivar el empleado por defecto directamente
        toast.error(
          "Para cambiar el empleado por defecto, selecciona otro empleado"
        );
        return;
      }

      const response = await api.employees.setDefault(employee.id);

      if (response.success) {
        toast.success("Empleado establecido como predeterminado");
        loadEmployees();
      } else {
        toast.error(
          response.error || "Error al establecer empleado por defecto"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al establecer empleado por defecto");
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (employee: IEmployee) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      isDefault: employee.isDefault,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: IEmployee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      isDefault: false,
    });
    setSelectedEmployee(null);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const statusOptions = [
    { value: "default", label: "Por defecto" },
    { value: "normal", label: "Normal" },
  ];

  const activeFiltersCount = [searchTerm, statusFilter].filter(Boolean).length;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={["admin"]}>
        <AuthenticatedLayout title="Empleados">
          <LoadingState message="Cargando empleados..." />
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={["admin"]}>
      <AuthenticatedLayout title="Empleados">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Empleados
              </h1>
              <p className="text-gray-600 mt-1">
                Administra los empleados de tu negocio
              </p>
            </div>
            <Button
              onClick={openCreateDialog}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Empleado
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Empleados
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalItems}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Empleado Por Defecto
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {employees.find((e) => e.isDefault)?.firstName || "N/A"}{" "}
                      {employees.find((e) => e.isDefault)?.lastName || ""}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Empleados Activos
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {totalItems}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Filters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            //statusFilter={statusFilter}
            //onStatusChange={setStatusFilter}
            //statusOptions={statusOptions}
            onRefresh={loadEmployees}
            onClearFilters={handleClearFilters}
            isLoading={isLoading}
            //activeFiltersCount={activeFiltersCount}
          />

          {/* Tabla de empleados */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empleado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Registro
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {employee.firstName.charAt(0)}
                              {employee.lastName.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {employee.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                employee.isDefault ? "default" : "secondary"
                              }
                              className={
                                employee.isDefault
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                            >
                              {employee.isDefault ? (
                                <>
                                  <Star className="w-3 h-3 mr-1" />
                                  Por Defecto
                                </>
                              ) : (
                                "Normal"
                              )}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(employee.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {!employee.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleDefault(employee)}
                                title="Establecer como predeterminado"
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(employee)}
                              title="Editar empleado"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(employee)}
                              title="Eliminar empleado"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Estado vacío */}
          {employees.length === 0 && (
            <EmptyState
              icon={Users}
              title="No hay empleados registrados"
              description="Agrega empleados para gestionar los canjes de recompensas"
              action={{
                label: "Agregar Empleado",
                onClick: openCreateDialog,
              }}
            />
          )}

          {/* Paginación */}
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              isLoading={isLoading}
            />
          )}

          {/* Dialog para crear empleado */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Empleado</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo empleado a tu negocio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="Nombre del empleado"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Apellido del empleado"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isDefault: checked }))
                    }
                  />
                  <Label htmlFor="isDefault">
                    Establecer como empleado por defecto
                  </Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateEmployee}>Crear Empleado</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog para editar empleado */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Empleado</DialogTitle>
                <DialogDescription>
                  Modifica los datos del empleado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-firstName">Nombre *</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="Nombre del empleado"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Apellido *</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Apellido del empleado"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isDefault: checked }))
                    }
                  />
                  <Label htmlFor="edit-isDefault">
                    Establecer como empleado por defecto
                  </Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdateEmployee}>
                  Actualizar Empleado
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog para eliminar empleado */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  el empleado{" "}
                  <strong>
                    {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                  </strong>{" "}
                  de tu negocio.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEmployee}>
                  Eliminar Empleado
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
