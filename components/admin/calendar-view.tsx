"use client"

import React, { useState } from "react"
import { DayPicker } from "react-day-picker"
import { format, isSameDay, isPast, isToday } from "date-fns"
import { tr } from "date-fns/locale"
import { Phone, Building2, Calendar, Clock, Zap } from "lucide-react"
import "react-day-picker/style.css"

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

interface CalendarViewProps {
  leads: Lead[]
  onSelectLead: (lead: Lead) => void
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  called: "bg-yellow-500",
  meeting_planned: "bg-purple-500",
  meeting_done: "bg-indigo-500",
  proposal: "bg-orange-500",
  won: "bg-[#CCFF00]",
  lost: "bg-red-500",
  cool_off: "bg-gray-500",
}

const statusLabels: Record<string, string> = {
  new: "Yeni",
  called: "Arandı",
  meeting_planned: "Toplantı Planlandı",
  meeting_done: "Görüşme Yapıldı",
  proposal: "Teklif",
  won: "Kazanıldı",
  lost: "Kaybedildi",
  cool_off: "Beklemede",
}

export function CalendarView({ leads, onSelectLead }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Toplantı tarihleri (meeting_date)
  const meetingDates = leads
    .filter(l => l.meeting_date)
    .map(l => ({ lead: l, date: new Date(l.meeting_date!) }))

  // Aksiyon tarihleri (next_action_at)
  const actionDates = leads
    .filter(l => l.next_action_at)
    .map(l => ({ lead: l, date: new Date(l.next_action_at!) }))

  // Seçili güne ait leadler
  const selectedDayLeads = selectedDate
    ? [
        ...meetingDates
          .filter(({ date }) => isSameDay(date, selectedDate))
          .map(({ lead }) => ({ lead, type: "meeting" as const })),
        ...actionDates
          .filter(({ date }) => isSameDay(date, selectedDate))
          .map(({ lead }) => ({ lead, type: "action" as const })),
      ]
    : []

  // Tekrar eden leadleri kaldır (hem meeting hem action olan)
  const uniqueSelectedLeads = selectedDayLeads.reduce<typeof selectedDayLeads>((acc, cur) => {
    if (!acc.find(x => x.lead.id === cur.lead.id && x.type === cur.type)) {
      acc.push(cur)
    }
    return acc
  }, [])

  // Takvimde hangi günlerin highlight edileceği
  const hasMeeting = (date: Date) =>
    meetingDates.some(({ date: d }) => isSameDay(d, date))

  const hasAction = (date: Date) =>
    actionDates.some(({ date: d }) => isSameDay(d, date))

  const isOverdue = (date: Date) =>
    isPast(date) && !isToday(date) && (hasMeeting(date) || hasAction(date))

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-4 py-6 min-h-[calc(100vh-120px)]">
      {/* Takvim */}
      <div className="flex-shrink-0">
        <div className="bg-card border border-border rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Takvim
          </h2>

          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={tr}
            showOutsideDays
            modifiers={{
              meeting: meetingDates.map(({ date }) => date),
              action: actionDates.map(({ date }) => date),
              overdue: [...meetingDates, ...actionDates]
                .filter(({ date }) => isPast(date) && !isToday(date))
                .map(({ date }) => date),
            }}
            modifiersClassNames={{
              meeting: "rdp-meeting",
              action: "rdp-action",
              overdue: "rdp-overdue",
            }}
            classNames={{
              root: "rdp-custom",
              day: "rdp-day-custom",
            }}
            styles={{
              root: { "--rdp-accent-color": "#CCFF00", "--rdp-accent-background-color": "#CCFF00" } as React.CSSProperties,
            }}
            components={{
              DayButton: ({ day, modifiers, ...props }) => {
                const date = day.date
                const meeting = hasMeeting(date)
                const action = hasAction(date)
                const overdue = isOverdue(date)

                return (
                  <button
                    {...props}
                    className={`relative w-9 h-9 rounded-lg text-sm font-medium transition-colors flex items-center justify-center
                      ${modifiers.selected ? "bg-[#CCFF00] text-black font-bold" : "hover:bg-muted"}
                      ${modifiers.today && !modifiers.selected ? "border border-[#CCFF00]/50 text-[#CCFF00]" : ""}
                      ${modifiers.outside ? "opacity-30" : ""}
                    `}
                  >
                    {day.date.getDate()}
                    {/* İşaret noktaları */}
                    {(meeting || action) && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {meeting && (
                          <span className={`w-1.5 h-1.5 rounded-full ${overdue ? "bg-red-500" : "bg-purple-400"}`} />
                        )}
                        {action && (
                          <span className={`w-1.5 h-1.5 rounded-full ${overdue ? "bg-red-500" : "bg-yellow-400"}`} />
                        )}
                      </span>
                    )}
                  </button>
                )
              }
            }}
          />

          {/* Legand */}
          <div className="mt-4 space-y-1.5 border-t border-border pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Toplantı tarihi
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              Aksiyon tarihi
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Gecikmiş
            </div>
          </div>
        </div>
      </div>

      {/* Seçili gün içeriği */}
      <div className="flex-1">
        <div className="bg-card border border-border rounded-2xl p-4 h-full">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {selectedDate
              ? format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })
              : "Bir tarih seçin"}
          </h2>

          {uniqueSelectedLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Calendar className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Bu tarihte etkinlik yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uniqueSelectedLeads.map(({ lead, type }) => {
                const isOverdueItem = type === "meeting"
                  ? lead.meeting_date && isPast(new Date(lead.meeting_date)) && !isToday(new Date(lead.meeting_date))
                  : lead.next_action_at && isPast(new Date(lead.next_action_at)) && !isToday(new Date(lead.next_action_at))

                return (
                  <button
                    key={`${lead.id}-${type}`}
                    onClick={() => onSelectLead(lead)}
                    className="w-full text-left bg-muted/50 hover:bg-muted border border-border hover:border-primary/30 rounded-xl p-4 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${type === "meeting" ? "bg-purple-400" : "bg-yellow-400"} ${isOverdueItem ? "bg-red-500" : ""}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm group-hover:text-primary transition-colors">{lead.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[lead.status] ? `${statusColors[lead.status]}/10 text-current` : "bg-muted"}`}>
                            {statusLabels[lead.status] || lead.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Building2 className="w-3 h-3" />
                          {lead.gym_name}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>

                        <div className="flex items-center gap-1 text-xs mt-2">
                          {type === "meeting" ? (
                            <>
                              <Calendar className="w-3 h-3 text-purple-400" />
                              <span className={isOverdueItem ? "text-red-400" : "text-purple-400"}>
                                Toplantı: {lead.meeting_date
                                  ? format(new Date(lead.meeting_date), "HH:mm", { locale: tr })
                                  : "Saat belirsiz"}
                                {isOverdueItem && " · Gecikmiş"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-yellow-400" />
                              <span className={isOverdueItem ? "text-red-400" : "text-yellow-400"}>
                                Aksiyon: {lead.next_action_at
                                  ? format(new Date(lead.next_action_at), "HH:mm", { locale: tr })
                                  : "Saat belirsiz"}
                                {isOverdueItem && " · Gecikmiş"}
                              </span>
                            </>
                          )}
                        </div>

                        {lead.notes && (
                          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 italic">
                            {lead.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
