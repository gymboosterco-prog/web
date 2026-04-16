"use client"

import React, { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Phone,
  Building2,
  Clock,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  Calendar,
  XCircle,
} from "lucide-react"

type CallEntry = {
  at: string
  outcome: "no_answer" | "callback" | "interested" | "not_interested" | "voicemail"
  note: string
}

type Lead = {
  id: string
  name: string
  email: string
  phone: string
  gym_name: string
  status: string
  notes: string | null
  source: string
  meeting_date: string | null
  value: number
  assigned_to: string | null
  instagram_url: string | null
  member_count: number
  lead_goal: number
  call_count: number
  call_log: CallEntry[] | null
  ad_spend: number
  next_action_at: string | null
  next_action_type: 'CALL' | 'MEETING' | 'WHATSAPP' | 'PROPOSAL_FOLLOWUP' | null
  last_contact_at: string | null
  rejection_reason: string | null
  called_at: string | null
  meeting_planned_at: string | null
  won_at: string | null
  created_at: string
  updated_at: string
}

interface KanbanBoardProps {
  leads: Lead[]
  statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }>
  onUpdateLead: (id: string, updates: Partial<Lead>) => void
  onSelectLead?: (lead: Lead) => void
  userRole: string
}

const COLUMN_ORDER = [
  "new",
  "called",
  "meeting_planned",
  "meeting_done",
  "proposal",
  "won",
  "lost",
  "cool_off",
]

function LeadCard({ lead, statusConfig, isDragging, onSelect }: {
  lead: Lead
  statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }>
  isDragging?: boolean
  onSelect?: (lead: Lead) => void
}) {
  return (
    <div
      onClick={() => onSelect?.(lead)}
      className={`bg-card border border-border rounded-xl p-3 space-y-2 transition-all ${
        isDragging
          ? "opacity-50 shadow-2xl scale-105 cursor-grabbing"
          : "cursor-pointer hover:border-primary/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-tight">{lead.name}</p>
        {lead.call_count > 0 && (
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {lead.call_count}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Building2 className="w-3 h-3 shrink-0" />
        <span className="truncate">{lead.gym_name}</span>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Phone className="w-3 h-3 shrink-0" />
        <span>{lead.phone}</span>
      </div>

      {lead.value > 0 && (
        <div className="text-xs font-medium text-[#f2ff00]">
          ₺{lead.value.toLocaleString('tr-TR')}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {new Date(lead.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
      </div>
    </div>
  )
}

function SortableLeadCard({ lead, statusConfig, onSelect }: {
  lead: Lead
  statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }>
  onSelect?: (lead: Lead) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { lead, type: "lead" },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard lead={lead} statusConfig={statusConfig} isDragging={isDragging} onSelect={onSelect} />
    </div>
  )
}

function KanbanColumn({
  status,
  label,
  color,
  Icon,
  leads,
  statusConfig,
  onSelectLead,
}: {
  status: string
  label: string
  color: string
  Icon: React.ElementType
  leads: Lead[]
  statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }>
  onSelectLead?: (lead: Lead) => void
}) {
  return (
    <div className="flex flex-col min-w-[260px] max-w-[260px] bg-muted/30 border border-border rounded-2xl overflow-hidden snap-start">
      {/* Column Header */}
      <div className="px-3 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 opacity-70" />
            <span className="text-sm font-semibold truncate">{label}</span>
          </div>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">
            {leads.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 min-h-[200px] overflow-y-auto max-h-[calc(100vh-280px)]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <SortableLeadCard key={lead.id} lead={lead} statusConfig={statusConfig} onSelect={onSelectLead} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
            Boş
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanBoard({ leads, statusConfig, onUpdateLead, onSelectLead, userRole }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null

  const getLeadsForStatus = (status: string) =>
    leads.filter(l => l.status === status)

  const visibleColumns = userRole === 'STAFF'
    ? COLUMN_ORDER.filter(s => ['new', 'called', 'meeting_done'].includes(s))
    : COLUMN_ORDER

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeLeadItem = leads.find(l => l.id === active.id)
    if (!activeLeadItem) return

    // Find the target column status
    // over.id can be a lead ID (dropped on another card) or a column status
    const overLead = leads.find(l => l.id === over.id)
    const targetStatus = overLead ? overLead.status : (over.id as string)

    if (targetStatus && COLUMN_ORDER.includes(targetStatus) && activeLeadItem.status !== targetStatus) {
      onUpdateLead(activeLeadItem.id, { status: targetStatus })
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeLead = leads.find(l => l.id === active.id)
    const overLead = leads.find(l => l.id === over.id)

    if (!activeLead) return

    // If dragged over another lead in a different column, update status
    if (overLead && overLead.status !== activeLead.status) {
      // We'll handle the actual update in onDragEnd
    }
  }

  return (
    <div className="px-4 py-6">
      {/* Mobile scroll hint */}
      <p className="md:hidden text-xs text-muted-foreground mb-3 flex items-center gap-1">
        <span>←</span> Kolonlar arasında kaydırın <span>→</span>
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
          {visibleColumns.map(status => {
            const config = statusConfig[status]
            if (!config) return null
            return (
              <KanbanColumn
                key={status}
                status={status}
                label={config.label}
                color={config.color}
                Icon={config.icon}
                leads={getLeadsForStatus(status)}
                statusConfig={statusConfig}
                onSelectLead={onSelectLead}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="rotate-2 shadow-2xl">
              <LeadCard lead={activeLead} statusConfig={statusConfig} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
