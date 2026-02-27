import { Calendar as BigCalendar, dateFnsLocalizer, type Event, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { RendezVous } from '../types'

const locales = {
  'fr': fr,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent extends Event {
  resource: RendezVous
}

interface AppointmentCalendarProps {
  appointments: RendezVous[]
  onSelectEvent: (appointment: RendezVous) => void
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void
  date?: Date
  onNavigate?: (date: Date) => void
  view?: View
  onView?: (view: View) => void
}

export default function AppointmentCalendar({ appointments, onSelectEvent, onSelectSlot, date, onNavigate, view, onView }: AppointmentCalendarProps) {
  // Transform appointments to calendar events
  const events: CalendarEvent[] = appointments.map((rdv) => {
    // Combine date + heureDebut/heureFin to create full datetime
    const dateStr = rdv.date.split('T')[0] // YYYY-MM-DD
    const startDateTime = new Date(`${dateStr}T${rdv.heureDebut}:00`)
    const endDateTime = new Date(`${dateStr}T${rdv.heureFin}:00`)
    
    return {
      title: rdv.patientNom,
      start: startDateTime,
      end: endDateTime,
      resource: rdv,
    }
  })

  // Event style based on status
  const eventStyleGetter = (event: CalendarEvent) => {
    const statut = event.resource.statut
    let backgroundColor = '#3b82f6' // default blue
    
    switch (statut) {
      case 'planifie':
        backgroundColor = '#6366f1' // indigo
        break
      case 'confirme':
        backgroundColor = '#10b981' // green
        break
      case 'termine':
        backgroundColor = '#6b7280' // gray
        break
      case 'annule':
        backgroundColor = '#ef4444' // red
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '11px',
        fontWeight: 500,
        padding: '2px',
      }
    }
  }

  const messages = {
    allDay: 'Journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Rendez-vous',
    noEventsInRange: 'Aucun rendez-vous dans cette période',
    showMore: (total: number) => `+ ${total} rendez-vous`,
  }

  return (
    <div className="h-[600px] sm:h-[750px] p-1 sm:p-2">
      <style>{`
        .rbc-calendar {
          font-family: system-ui, -apple-system, sans-serif;
        }
        .rbc-header {
          padding: 8px 4px;
          font-weight: 600;
          font-size: 11px;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          border-bottom: 1px solid #e5e7eb;
        }
        @media (min-width: 640px) {
          .rbc-header {
            padding: 12px 6px;
            font-size: 13px;
          }
        }
        .rbc-allday-cell {
          display: none;
        }
        .rbc-time-header-content > .rbc-row.rbc-row-resource {
          display: none;
        }
        /* Masquer le dimanche en vue semaine (7ème jour) */
        .rbc-time-header-content .rbc-header:nth-child(7) {
          display: none;
        }
        .rbc-time-content > .rbc-day-slot:nth-child(7) {
          display: none;
        }
        .rbc-time-content {
          border-top: 1px solid #e5e7eb;
        }
        .rbc-toolbar {
          padding: 6px 0 8px;
          flex-wrap: wrap;
          gap: 6px;
        }
        @media (min-width: 640px) {
          .rbc-toolbar {
            padding: 8px 0 12px;
            gap: 12px;
          }
        }
        .rbc-toolbar button {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #374151;
          font-weight: 500;
          font-size: 12px;
          transition: all 150ms;
        }
        @media (min-width: 640px) {
          .rbc-toolbar button {
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
          }
        }
        .rbc-toolbar button:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }
        .rbc-toolbar button.rbc-active {
          background: linear-gradient(to bottom, #8b5cf6, #7c3aed);
          color: white;
          border-color: #7c3aed;
          box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3);
        }
        .rbc-today {
          background-color: #fef3c7 !important;
        }
        .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        .rbc-event {
          padding: 4px 8px;
        }
        .rbc-event:focus {
          outline: 2px solid #8b5cf6;
          outline-offset: 2px;
        }
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f3f4f6;
        }
        .rbc-time-header-content {
          border-left: 1px solid #e5e7eb;
        }
        .rbc-current-time-indicator {
          background-color: #8b5cf6;
          height: 2px;
        }
      `}</style>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        culture="fr"
        messages={messages}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event: CalendarEvent) => onSelectEvent(event.resource)}
        onSelectSlot={({ start, end }: { start: Date; end: Date }) => onSelectSlot({ start, end })}
        selectable
        views={['month', 'week', 'day', 'agenda']}
        view={view || 'week'}
        onView={onView}
        step={15}
        timeslots={4}
        min={new Date(2024, 0, 1, 9, 0)}
        max={new Date(2024, 0, 1, 17, 0)}
        date={date}
        onNavigate={onNavigate}
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
            `${format(start, 'HH:mm', { locale: fr })} - ${format(end, 'HH:mm', { locale: fr })}`,
          agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => 
            `${format(start, 'HH:mm', { locale: fr })} - ${format(end, 'HH:mm', { locale: fr })}`,
        }}
      />
    </div>
  )
}
