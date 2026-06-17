"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal, Pencil, CheckCircle, XCircle, MapPin, Plus,
  ChevronRight, ChevronDown, Warehouse, Snowflake, Archive,
  Layers, Box, Home, Thermometer, Package, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import {
  useSamples, useSampleTypes, useCreateSample, useReceiveSample, useRejectSample,
  useDisposeSample, useAssignStorage, useRemoveStorage,
  useStorageLocations, useSamplesAtLocation,
  useCreateStorageLocation, useUpdateStorageLocation, useDeleteStorageLocation,
  useCreateSampleType, useUpdateSampleType, useDeleteSampleType,
  useUpdateSample,
} from "./samples.queries";
import type {
  SampleRead, SampleCreate, SampleUpdate, SampleCondition,
  StorageLocation, StorageLocationCreate, StorageLocationUpdate,
  LocationType, SampleTypeRead, SampleTypeCreate, SampleTypeUpdate,
} from "./samples.api";

const CONDITION_OPTIONS: { value: SampleCondition; label: string }[] = [
  { value: "GOOD", label: "Good" },
  { value: "ACCEPTABLE", label: "Acceptable" },
  { value: "DAMAGED", label: "Damaged" },
  { value: "COMPROMISED", label: "Compromised" },
  { value: "HAEMOLYSED", label: "Haemolysed" },
  { value: "LIPAEMIC", label: "Lipaemic" },
  { value: "ICTERIC", label: "Icteric" },
];

function ConditionBadge({ condition }: { condition: SampleCondition | null | undefined }) {
  if (!condition) return null;
  const colors: Record<SampleCondition, string> = {
    GOOD: "bg-green-100 text-green-700",
    ACCEPTABLE: "bg-blue-100 text-blue-700",
    DAMAGED: "bg-amber-100 text-amber-700",
    COMPROMISED: "bg-orange-100 text-orange-700",
    HAEMOLYSED: "bg-red-100 text-red-700",
    LIPAEMIC: "bg-purple-100 text-purple-700",
    ICTERIC: "bg-yellow-100 text-yellow-700",
  };
  const label = CONDITION_OPTIONS.find((o) => o.value === condition)?.label ?? condition;
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium ${colors[condition]}`}>
      {label}
    </span>
  );
}

// ── Location type meta ────────────────────────────────────────────────────────

const LOCATION_TYPE_OPTIONS: { value: LocationType; label: string }[] = [
  { value: "ROOM", label: "Room" },
  { value: "FREEZER", label: "Freezer" },
  { value: "REFRIGERATOR", label: "Refrigerator" },
  { value: "CABINET", label: "Cabinet" },
  { value: "RACK", label: "Rack" },
  { value: "SHELF", label: "Shelf" },
  { value: "BOX", label: "Box" },
  { value: "POSITION", label: "Position" },
];

function LocationIcon({ type, className = "h-4 w-4" }: { type: LocationType; className?: string }) {
  const icons: Record<LocationType, React.ElementType> = {
    ROOM: Home,
    FREEZER: Snowflake,
    REFRIGERATOR: Thermometer,
    CABINET: Archive,
    RACK: Layers,
    SHELF: Package,
    BOX: Box,
    POSITION: MapPin,
  };
  const Icon = icons[type] ?? Warehouse;
  return <Icon className={className} />;
}

function locationTypeLabel(type: LocationType) {
  return LOCATION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

// ── Tree builder ──────────────────────────────────────────────────────────────

interface TreeNode extends StorageLocation {
  _children: TreeNode[];
}

function buildTree(locations: StorageLocation[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  locations.forEach((loc) => map.set(loc.id, { ...loc, _children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!._children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

// ── Location tree node ────────────────────────────────────────────────────────

function LocationTreeNode({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedId: number | null;
  onSelect: (loc: StorageLocation) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node._children.length > 0;

  return (
    <div>
      <button
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-sm rounded text-left transition-colors
          ${selectedId === node.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-slate-100 text-slate-700"}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <span
            className="shrink-0 text-slate-400"
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <LocationIcon type={node.location_type} className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        <span className="truncate flex-1">{node.name}</span>
        {!node.is_active && (
          <span className="text-xs text-slate-400 shrink-0">off</span>
        )}
      </button>
      {expanded && hasChildren && (
        <div>
          {node._children.map((child) => (
            <LocationTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Location form dialog ──────────────────────────────────────────────────────

const emptyLocForm = (parentId?: number | null): StorageLocationCreate => ({
  name: "",
  code: null,
  location_type: "ROOM",
  parent_id: parentId ?? null,
  description: null,
  temperature_min: null,
  temperature_max: null,
  capacity: null,
  is_active: true,
});

function LocationFormDialog({
  open,
  onOpenChange,
  initial,
  locations,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: StorageLocationCreate & { id?: number };
  locations: StorageLocation[];
  onSave: (data: StorageLocationCreate) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const isEdit = !!initial.id;

  const set = (patch: Partial<StorageLocationCreate>) =>
    setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  // Reset when dialog reopens with new initial
  const handleOpenChange = (v: boolean) => {
    if (v) setForm(initial);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Location" : "Add Storage Location"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Name *</Label>
              <Input required value={form.name} onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Code</Label>
              <Input
                placeholder="e.g. FZ-A1"
                value={form.code ?? ""}
                onChange={(e) => set({ code: e.target.value || null })}
              />
            </div>
            <div className="space-y-1">
              <Label>Type *</Label>
              <Select
                value={form.location_type}
                onValueChange={(v) => set({ location_type: v as LocationType })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Parent Location</Label>
            <Select
              value={form.parent_id ? String(form.parent_id) : "__none__"}
              onValueChange={(v) => set({ parent_id: v === "__none__" ? null : Number(v) })}
            >
              <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None (top-level)</SelectItem>
                {locations
                  .filter((l) => l.id !== initial.id)
                  .map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              value={form.description ?? ""}
              onChange={(e) => set({ description: e.target.value || null })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Temp Min (°C)</Label>
              <Input
                type="number"
                placeholder="e.g. -80"
                value={form.temperature_min ?? ""}
                onChange={(e) => set({ temperature_min: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
            <div className="space-y-1">
              <Label>Temp Max (°C)</Label>
              <Input
                type="number"
                placeholder="e.g. -20"
                value={form.temperature_max ?? ""}
                onChange={(e) => set({ temperature_max: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
            <div className="space-y-1">
              <Label>Capacity</Label>
              <Input
                type="number"
                min={1}
                placeholder="slots"
                value={form.capacity ?? ""}
                onChange={(e) => set({ capacity: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="loc-active"
              checked={form.is_active}
              onChange={(e) => set({ is_active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="loc-active">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {isEdit ? "Save Changes" : "Add Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Assign storage dialog ─────────────────────────────────────────────────────

function AssignStorageDialog({
  open,
  onOpenChange,
  sample,
  locations,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sample: SampleRead | null;
  locations: StorageLocation[];
  onSave: (locationId: number, positionLabel: string | null) => void;
  saving: boolean;
}) {
  const [locationId, setLocationId] = useState<string>("");
  const [posLabel, setPosLabel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId) return;
    onSave(Number(locationId), posLabel || null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Assign Storage</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <p className="text-sm text-slate-600">
            Assigning storage for <strong>{sample?.barcode}</strong>
          </p>
          <div className="space-y-1">
            <Label>Location *</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger><SelectValue placeholder="Select location…" /></SelectTrigger>
              <SelectContent>
                {locations
                  .filter((l) => l.is_active)
                  .map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
                      {l.code && <span className="text-slate-400 ml-1">({l.code})</span>}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Position / Slot</Label>
            <Input
              placeholder="e.g. A1, Row 3, Slot 7"
              value={posLabel}
              onChange={(e) => setPosLabel(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!locationId || saving}>
              Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Storage location detail panel ─────────────────────────────────────────────

function LocationDetailPanel({
  location,
  locations,
  onEdit,
  onDelete,
  onAddChild,
}: {
  location: StorageLocation;
  locations: StorageLocation[];
  onEdit: () => void;
  onDelete: () => void;
  onAddChild: () => void;
}) {
  const { data: samplesHere = [], isLoading } = useSamplesAtLocation(location.id);
  const parent = locations.find((l) => l.id === location.parent_id);
  const childCount = locations.filter((l) => l.parent_id === location.id).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <LocationIcon type={location.location_type} className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-slate-900">{location.name}</h3>
            <p className="text-xs text-slate-500">
              {locationTypeLabel(location.location_type)}
              {location.code && <> · <span className="font-mono">{location.code}</span></>}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button size="sm" variant="outline" onClick={onAddChild}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Child
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {parent && (
          <div className="col-span-2">
            <span className="text-slate-500">Parent: </span>
            <span className="text-slate-700">{parent.name}</span>
          </div>
        )}
        {(location.temperature_min !== null || location.temperature_max !== null) && (
          <div>
            <span className="text-slate-500">Temp range: </span>
            <span className="text-slate-700">
              {location.temperature_min ?? "—"}°C to {location.temperature_max ?? "—"}°C
            </span>
          </div>
        )}
        {location.capacity !== null && (
          <div>
            <span className="text-slate-500">Capacity: </span>
            <span className="text-slate-700">{location.capacity} slots</span>
          </div>
        )}
        <div>
          <span className="text-slate-500">Sub-locations: </span>
          <span className="text-slate-700">{childCount}</span>
        </div>
        <div>
          <span className="text-slate-500">Status: </span>
          <Badge variant={location.is_active ? "default" : "secondary"} className="text-xs">
            {location.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {location.description && (
        <p className="text-sm text-slate-600 bg-slate-50 rounded p-2">{location.description}</p>
      )}

      {/* Samples currently here */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">
          Samples stored here
          {samplesHere.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">{samplesHere.length}</Badge>
          )}
        </h4>
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : samplesHere.length === 0 ? (
          <p className="text-sm text-slate-400">No samples currently stored here.</p>
        ) : (
          <div className="border rounded divide-y text-sm">
            {samplesHere.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2">
                <span className="font-mono font-medium text-slate-800">{s.barcode}</span>
                <div className="flex items-center gap-2">
                  {s.position_label && (
                    <span className="text-xs text-slate-500 font-mono">{s.position_label}</span>
                  )}
                  <LimsStatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Storage Locations tab ─────────────────────────────────────────────────────

function StorageLocationsTab() {
  const { data: locations = [], isLoading } = useStorageLocations();
  const createLoc = useCreateStorageLocation();
  const updateLoc = useUpdateStorageLocation();
  const deleteLoc = useDeleteStorageLocation();

  const [selectedLoc, setSelectedLoc] = useState<StorageLocation | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<StorageLocationCreate & { id?: number }>(emptyLocForm());

  const tree = buildTree(locations);

  const openCreate = (parentId?: number | null) => {
    setFormInitial(emptyLocForm(parentId));
    setFormOpen(true);
  };

  const openEdit = (loc: StorageLocation) => {
    setFormInitial({ ...loc });
    setFormOpen(true);
  };

  const handleSave = async (data: StorageLocationCreate) => {
    if (formInitial.id) {
      const updated = await updateLoc.mutateAsync({ id: formInitial.id, data });
      setSelectedLoc(updated);
    } else {
      const created = await createLoc.mutateAsync(data);
      setSelectedLoc(created);
    }
    setFormOpen(false);
  };

  const handleDelete = async (loc: StorageLocation) => {
    if (!confirm(`Delete "${loc.name}" and all its sub-locations?`)) return;
    await deleteLoc.mutateAsync(loc.id);
    if (selectedLoc?.id === loc.id) setSelectedLoc(null);
  };

  if (isLoading) {
    return <div className="p-8 text-sm text-slate-400">Loading storage locations…</div>;
  }

  return (
    <div className="flex h-full min-h-125 border rounded-lg overflow-hidden bg-white">
      {/* Left tree panel */}
      <div className="w-64 shrink-0 border-r flex flex-col">
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Locations
          </span>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openCreate(null)}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {tree.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-400 text-center">
              No locations yet.
              <br />
              <button className="mt-1 text-primary underline" onClick={() => openCreate(null)}>
                Add one
              </button>
            </div>
          ) : (
            tree.map((node) => (
              <LocationTreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedLoc?.id ?? null}
                onSelect={setSelectedLoc}
              />
            ))
          )}
        </div>
      </div>

      {/* Right detail panel */}
      {selectedLoc ? (
        <LocationDetailPanel
          key={selectedLoc.id}
          location={selectedLoc}
          locations={locations}
          onEdit={() => openEdit(selectedLoc)}
          onDelete={() => handleDelete(selectedLoc)}
          onAddChild={() => openCreate(selectedLoc.id)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Select a location to view details
        </div>
      )}

      {/* Location form */}
      <LocationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={formInitial}
        locations={locations}
        onSave={handleSave}
        saving={createLoc.isPending || updateLoc.isPending}
      />
    </div>
  );
}

// ── Sample Types tab ──────────────────────────────────────────────────────────

const emptySampleTypeForm = (): SampleTypeCreate => ({
  name: "",
  code: "",
  description: null,
  container_type: null,
  stability_hours: null,
  special_instructions: null,
  is_active: true,
});

function SampleTypesTab() {
  const { data: types = [], isLoading } = useSampleTypes(false);
  const createType = useCreateSampleType();
  const updateType = useUpdateSampleType();
  const deleteType = useDeleteSampleType();

  const [selected, setSelected] = useState<SampleTypeRead | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SampleTypeRead | null>(null);
  const [form, setForm] = useState<SampleTypeCreate>(emptySampleTypeForm());

  const set = (patch: Partial<SampleTypeCreate>) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptySampleTypeForm());
    setFormOpen(true);
  };

  useEffect(() => {
    document.addEventListener("types:open-create", openCreate);
    return () => document.removeEventListener("types:open-create", openCreate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = (t: SampleTypeRead) => {
    setEditTarget(t);
    setForm({
      name: t.name,
      code: t.code,
      description: t.description ?? null,
      container_type: t.container_type ?? null,
      stability_hours: t.stability_hours ?? null,
      special_instructions: t.special_instructions ?? null,
      is_active: t.is_active,
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      const updated = await updateType.mutateAsync({ id: editTarget.id, data: form });
      setSelected(updated);
    } else {
      await createType.mutateAsync(form);
    }
    setFormOpen(false);
  };

  const handleDelete = async (t: SampleTypeRead) => {
    if (!confirm(`Delete sample type "${t.name}"? This will fail if samples are using it.`)) return;
    await deleteType.mutateAsync(t.id);
    if (selected?.id === t.id) setSelected(null);
  };

  return (
    <div className="flex h-full min-h-125 border rounded-lg overflow-hidden bg-white">
      {/* Left list */}
      <div className="w-64 shrink-0 border-r flex flex-col">
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Sample Types
          </span>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {isLoading ? (
            <p className="px-3 py-4 text-xs text-slate-400">Loading…</p>
          ) : types.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-400 text-center">
              No sample types yet.
              <br />
              <button className="mt-1 text-primary underline" onClick={openCreate}>Add one</button>
            </div>
          ) : (
            types.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between gap-2
                  ${selected?.id === t.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                  }`}
              >
                <span className="truncate">{t.name}</span>
                {!t.is_active && <Badge variant="secondary" className="text-xs shrink-0">Off</Badge>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right detail */}
      {selected ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">{selected.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{selected.code}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" variant="outline" onClick={() => openEdit(selected)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDelete(selected)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500">Status: </span>
              <Badge variant={selected.is_active ? "default" : "secondary"} className="text-xs">
                {selected.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            {selected.container_type && (
              <div>
                <span className="text-slate-500">Container: </span>
                <span className="text-slate-700">{selected.container_type}</span>
              </div>
            )}
            {selected.stability_hours !== null && selected.stability_hours !== undefined && (
              <div>
                <span className="text-slate-500">Stability: </span>
                <span className="text-slate-700">{selected.stability_hours}h</span>
              </div>
            )}
          </div>

          {selected.description && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Description</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded p-2">{selected.description}</p>
            </div>
          )}
          {selected.special_instructions && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Special Instructions</p>
              <p className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded p-2">
                {selected.special_instructions}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Select a type to view details
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Sample Type" : "New Sample Type"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Name *</Label>
                <Input required value={form.name} onChange={(e) => set({ name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Code *</Label>
                <Input
                  required
                  placeholder="e.g. BLOOD"
                  value={form.code}
                  onChange={(e) => set({ code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1">
                <Label>Container Type</Label>
                <Input
                  placeholder="e.g. EDTA Tube"
                  value={form.container_type ?? ""}
                  onChange={(e) => set({ container_type: e.target.value || null })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={form.description ?? ""}
                onChange={(e) => set({ description: e.target.value || null })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Stability (hours)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 24"
                  value={form.stability_hours ?? ""}
                  onChange={(e) => set({ stability_hours: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div className="flex items-end pb-0.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="type-active"
                    checked={form.is_active ?? true}
                    onChange={(e) => set({ is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <Label htmlFor="type-active">Active</Label>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Special Instructions</Label>
              <Textarea
                rows={2}
                placeholder="Handling or transport notes…"
                value={form.special_instructions ?? ""}
                onChange={(e) => set({ special_instructions: e.target.value || null })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createType.isPending || updateType.isPending}>
                {editTarget ? "Save Changes" : "Create Type"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const emptySampleForm = (): SampleCreate => ({
  barcode: "",
  sample_type_id: 0,
  client_id: null,
  external_ref: null,
  collected_at: null,
  notes: null,
  collected_by: null,
});

// ── Page root ─────────────────────────────────────────────────────────────────

export function SamplesPage() {
  const [tab, setTab] = useState("samples");

  return (
    <LimsPageLayout
      title="Samples"
      description="Track sample registration, receipt, and storage"
      actionLabel={tab === "samples" ? "Register Sample" : tab === "storage" ? "Add Location" : "New Type"}
      onAction={() => {
        if (tab === "samples") {
          document.dispatchEvent(new CustomEvent("samples:open-create"));
        } else if (tab === "storage") {
          document.dispatchEvent(new CustomEvent("storage:open-create"));
        } else {
          document.dispatchEvent(new CustomEvent("types:open-create"));
        }
      }}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="storage">Storage Locations</TabsTrigger>
          <TabsTrigger value="types">Sample Types</TabsTrigger>
        </TabsList>
        <TabsContent value="samples">
          <_SamplesTabWithAction />
        </TabsContent>
        <TabsContent value="storage">
          <StorageLocationsTab />
        </TabsContent>
        <TabsContent value="types">
          <SampleTypesTab />
        </TabsContent>
      </Tabs>
    </LimsPageLayout>
  );
}

// Wrap SamplesTab so the header action button can open the create dialog
function _SamplesTabWithAction() {
  const [createOpen, setCreateOpen] = useState(false);
  const [receiveTarget, setReceiveTarget] = useState<SampleRead | null>(null);
  const [receiveCondition, setReceiveCondition] = useState<SampleCondition | "">("");
  const [receiveDiscrepancies, setReceiveDiscrepancies] = useState("");
  const [rejectTarget, setRejectTarget] = useState<SampleRead | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [disposeTarget, setDisposeTarget] = useState<SampleRead | null>(null);
  const [disposeReason, setDisposeReason] = useState("");
  const [assignTarget, setAssignTarget] = useState<SampleRead | null>(null);
  const [editTarget, setEditTarget] = useState<SampleRead | null>(null);
  const [editForm, setEditForm] = useState<SampleUpdate>({});
  const [form, setForm] = useState<SampleCreate>(emptySampleForm());

  const { data: samples = [], isLoading } = useSamples();
  const { data: types = [] } = useSampleTypes();
  const { data: locations = [] } = useStorageLocations();
  const create = useCreateSample();
  const receive = useReceiveSample();
  const reject = useRejectSample();
  const dispose = useDisposeSample();
  const assignStorage = useAssignStorage();
  const removeStorage = useRemoveStorage();
  const updateSample = useUpdateSample();

  // Listen for the custom event from the parent action button
  useState(() => {
    const handler = () => { setForm(emptySampleForm()); setCreateOpen(true); };
    document.addEventListener("samples:open-create", handler);
    return () => document.removeEventListener("samples:open-create", handler);
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form);
    setCreateOpen(false);
    setForm(emptySampleForm());
  };

  const handleReceive = async () => {
    if (!receiveTarget) return;
    await receive.mutateAsync({
      id: receiveTarget.id,
      data: {
        received_at: new Date().toISOString(),
        received_condition: receiveCondition || null,
        receipt_discrepancies: receiveDiscrepancies || null,
      },
    });
    setReceiveTarget(null);
    setReceiveCondition("");
    setReceiveDiscrepancies("");
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    await reject.mutateAsync({ id: rejectTarget.id, data: { rejection_reason: rejectReason } });
    setRejectTarget(null);
    setRejectReason("");
  };

  const handleDispose = async () => {
    if (!disposeTarget) return;
    await dispose.mutateAsync({ id: disposeTarget.id, data: { disposal_reason: disposeReason } });
    setDisposeTarget(null);
    setDisposeReason("");
  };

  const handleAssignStorage = async (locationId: number, posLabel: string | null) => {
    if (!assignTarget) return;
    await assignStorage.mutateAsync({
      id: assignTarget.id,
      data: { location_id: locationId, position_label: posLabel },
    });
    setAssignTarget(null);
  };

  const handleRemoveStorage = async (s: SampleRead) => {
    await removeStorage.mutateAsync(s.id);
  };

  const openEdit = (s: SampleRead) => {
    setEditTarget(s);
    setEditForm({
      external_ref: s.external_ref ?? null,
      collected_at: s.collected_at ?? null,
      notes: s.notes ?? null,
      collected_by: s.collected_by ?? null,
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    await updateSample.mutateAsync({ id: editTarget.id, data: editForm });
    setEditTarget(null);
  };

  const locationById = new Map(locations.map((l) => [l.id, l]));

  return (
    <>
      <LimsTable
        data={samples}
        isLoading={isLoading}
        emptyMessage="No samples registered yet."
        columns={[
          {
            header: "Barcode",
            render: (s) => <span className="font-mono text-sm font-medium">{s.barcode}</span>,
          },
          {
            header: "Type",
            render: (s) => (
              <span className="text-slate-700">
                {types.find((t) => t.id === s.sample_type_id)?.name ?? s.sample_type_id}
              </span>
            ),
          },
          {
            header: "Condition",
            render: (s) => <ConditionBadge condition={s.received_condition} />,
          },
          {
            header: "Storage",
            render: (s) => {
              const loc = s.storage_location_id ? locationById.get(s.storage_location_id) : null;
              if (!loc) return <span className="text-slate-400 text-xs">—</span>;
              return (
                <span className="flex items-center gap-1 text-xs text-slate-600">
                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate max-w-30">{loc.name}</span>
                  {s.position_label && (
                    <span className="font-mono text-slate-400">· {s.position_label}</span>
                  )}
                </span>
              );
            },
          },
          {
            header: "Collected",
            render: (s) => (
              <span className="text-slate-500">
                {s.collected_at ? new Date(s.collected_at).toLocaleDateString() : "—"}
              </span>
            ),
          },
          {
            header: "Status",
            render: (s) => <LimsStatusBadge status={s.status} />,
          },
          {
            header: "",
            className: "w-10",
            render: (s) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {s.status === "PENDING" && (
                    <DropdownMenuItem onClick={() => { setReceiveTarget(s); setReceiveCondition(""); setReceiveDiscrepancies(""); }}>
                      <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-600" /> Receive
                    </DropdownMenuItem>
                  )}
                  {(s.status === "PENDING" || s.status === "RECEIVED") && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => { setRejectTarget(s); setRejectReason(""); }}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-2" /> Reject
                    </DropdownMenuItem>
                  )}
                  {(s.status === "RECEIVED" || s.status === "REJECTED") && (
                    <DropdownMenuItem
                      className="text-red-700"
                      onClick={() => { setDisposeTarget(s); setDisposeReason(""); }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Dispose
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAssignTarget(s)}>
                    <MapPin className="h-3.5 w-3.5 mr-2 text-primary" />
                    {s.storage_location_id ? "Move Storage" : "Assign Storage"}
                  </DropdownMenuItem>
                  {s.storage_location_id && (
                    <DropdownMenuItem onClick={() => handleRemoveStorage(s)}>
                      <Warehouse className="h-3.5 w-3.5 mr-2 text-slate-500" /> Remove from Storage
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openEdit(s)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Register Sample</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Barcode *</Label>
                <Input
                  required
                  value={form.barcode}
                  onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>External Ref</Label>
                <Input
                  value={form.external_ref ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, external_ref: e.target.value || null }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Sample Type *</Label>
              <Select
                value={form.sample_type_id ? String(form.sample_type_id) : ""}
                onValueChange={(v) => setForm((f) => ({ ...f, sample_type_id: Number(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Collected At</Label>
                <Input
                  type="datetime-local"
                  value={form.collected_at?.slice(0, 16) ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, collected_at: e.target.value || null }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Collected By</Label>
                <Input
                  value={form.collected_by ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, collected_by: e.target.value || null }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={form.notes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending}>Register</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receive dialog */}
      <Dialog open={!!receiveTarget} onOpenChange={() => setReceiveTarget(null)}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Receive Sample</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-slate-600">
              Receiving <strong>{receiveTarget?.barcode}</strong>.
            </p>
            <div className="space-y-1">
              <Label>Condition at Receipt</Label>
              <Select
                value={receiveCondition}
                onValueChange={(v) => setReceiveCondition(v as SampleCondition)}
              >
                <SelectTrigger><SelectValue placeholder="Select condition…" /></SelectTrigger>
                <SelectContent>
                  {CONDITION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Discrepancies / Notes</Label>
              <Textarea
                rows={2}
                placeholder="Any issues observed on arrival…"
                value={receiveDiscrepancies}
                onChange={(e) => setReceiveDiscrepancies(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveTarget(null)}>Cancel</Button>
            <Button disabled={receive.isPending} onClick={handleReceive}>
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Confirm Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Reject Sample</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-slate-600">
              Rejecting <strong>{rejectTarget?.barcode}</strong>. Please provide a reason.
            </p>
            <div className="space-y-1">
              <Label>Reason *</Label>
              <Textarea
                rows={2}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!rejectReason || reject.isPending}
              onClick={handleReject}
            >
              Reject Sample
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispose dialog */}
      <Dialog open={!!disposeTarget} onOpenChange={() => setDisposeTarget(null)}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Dispose Sample</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-slate-600">
              Disposing <strong>{disposeTarget?.barcode}</strong>. This action is permanent.
            </p>
            <div className="space-y-1">
              <Label>Disposal Reason *</Label>
              <Textarea
                rows={2}
                required
                placeholder="e.g. Stability period exceeded, biohazard disposal…"
                value={disposeReason}
                onChange={(e) => setDisposeReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisposeTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!disposeReason || dispose.isPending}
              onClick={handleDispose}
            >
              Confirm Disposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Edit Sample</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>External Ref</Label>
              <Input
                value={editForm.external_ref ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, external_ref: e.target.value || null }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Collected At</Label>
                <Input
                  type="datetime-local"
                  value={editForm.collected_at?.slice(0, 16) ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, collected_at: e.target.value || null }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Collected By</Label>
                <Input
                  value={editForm.collected_by ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, collected_by: e.target.value || null }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={editForm.notes ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value || null }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={updateSample.isPending}>Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign storage dialog */}
      <AssignStorageDialog
        open={!!assignTarget}
        onOpenChange={(v) => { if (!v) setAssignTarget(null); }}
        sample={assignTarget}
        locations={locations}
        onSave={handleAssignStorage}
        saving={assignStorage.isPending}
      />
    </>
  );
}
