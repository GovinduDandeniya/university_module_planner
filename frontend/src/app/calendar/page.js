'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { assignmentsApi } from '@/lib/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadAssignments();
  }, [user]);

  const loadAssignments = async () => {
    try {
      const data = await assignmentsApi.getAll();
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  const events = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    date: a.deadline?.split('T')[0],
    backgroundColor: a.moduleColor || '#8b5cf6',
    borderColor: 'transparent',
    extendedProps: {
      description: a.description,
      moduleName: a.moduleName,
      moduleCode: a.moduleCode,
      status: a.status,
      moduleColor: a.moduleColor,
    },
  }));

  const handleEventClick = (info) => {
    const { title, extendedProps, startStr } = info.event;
    setSelectedEvent({
      title,
      date: startStr,
      ...extendedProps,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Visualize your assignment deadlines</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading calendar...</p>
      ) : (
        <div className="glass-card calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek',
            }}
            height="auto"
            dayMaxEvents={3}
            eventDisplay="block"
          />
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '100%',
              height: '4px',
              background: selectedEvent.moduleColor || '#8b5cf6',
              borderRadius: '4px',
              marginBottom: '20px'
            }} />
            <h2 className="modal-title">{selectedEvent.title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', minWidth: '80px' }}>Module</span>
                <span style={{
                  padding: '4px 12px',
                  background: (selectedEvent.moduleColor || '#8b5cf6') + '20',
                  color: selectedEvent.moduleColor || '#8b5cf6',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {selectedEvent.moduleCode} · {selectedEvent.moduleName}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', minWidth: '80px' }}>Deadline</span>
                <span style={{ fontSize: '14px' }}>{formatDate(selectedEvent.date)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', minWidth: '80px' }}>Status</span>
                <span className={selectedEvent.status === 'Submitted' ? 'badge-submitted' : 'badge-pending'}>
                  {selectedEvent.status}
                </span>
              </div>
              {selectedEvent.description && (
                <div style={{ marginTop: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Description</span>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {selectedEvent.description}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
