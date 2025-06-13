"use client";
import React, { useState, useRef, useEffect } from "react";
import { Users, Clock, DollarSign, BarChart3, ChevronDown } from "lucide-react";

interface ServiceInfo {
  name: string;
  start_at: string;
  staff_name?: string;
}
interface ClientToday {
  id: string;
  full_name: string;
  phone?: string;
  services: ServiceInfo[];
}

interface DashboardStatsClientProps {
  clientsToday: ClientToday[];
  bookingsTodayCount: number;
  incassoOggi: number;
  incassoMese: number;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardStatsClient({
  clientsToday,
  bookingsTodayCount,
  incassoOggi,
  incassoMese,
}: DashboardStatsClientProps) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const clientsRef = useRef<HTMLDivElement>(null);

  // Chiudi la tendina cliccando fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openDropdown && clientsRef.current && !clientsRef.current.contains(event.target as Node)) {
        setOpenDropdown(false);
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Ordina i clienti per orario del primo appuntamento
  const sortedClients = [...clientsToday].sort((a, b) => {
    if (!a.services[0] || !b.services[0]) return 0;
    return new Date(a.services[0].start_at).getTime() - new Date(b.services[0].start_at).getTime();
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Clienti di oggi */}
        <div ref={clientsRef} className="relative">
          <div
            className="bg-white rounded-lg shadow p-6 cursor-pointer flex items-center justify-between"
            onClick={() => setOpenDropdown(!openDropdown)}
          >
            <div>
              <p className="text-sm font-medium text-gray-600">Clienti di oggi</p>
              <p className="text-2xl font-semibold text-gray-900">{clientsToday.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-indigo-600" />
              <ChevronDown className={`w-5 h-5 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {openDropdown && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto animate-fade-in">
              <div className="p-3 font-semibold text-gray-900 border-b">Clienti di oggi</div>
              {sortedClients.length === 0 ? (
                <div className="text-gray-500 text-center p-4">Nessun cliente con appuntamento oggi.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {sortedClients.map((client) => (
                    <li key={client.id} className="py-2 px-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <span className="font-medium text-gray-900">{client.full_name}</span>
                        {client.phone && <span className="text-gray-500 text-sm">{client.phone}</span>}
                      </div>
                      <ul className="mt-1 ml-2 text-sm text-gray-700 space-y-1">
                        {client.services.map((svc, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-500">{formatTime(svc.start_at)}</span>
                            <span>{svc.name}</span>
                            {svc.staff_name && <span className="text-gray-400">({svc.staff_name})</span>}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {/* Appuntamenti oggi */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Appuntamenti Oggi</p>
              <p className="text-2xl font-semibold text-gray-900">{bookingsTodayCount}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        {/* Incasso oggi */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incasso Previsto Oggi</p>
              <p className="text-2xl font-semibold text-gray-900">€{incassoOggi.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        {/* Incasso mensile */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incasso Mensile</p>
              <p className="text-2xl font-semibold text-gray-900">€{incassoMese.toFixed(2)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>
    </>
  );
} 