"use client";
import React, { useState } from "react";
import Modal from "@/components/ui/Modal";

interface Client {
  id: string;
  full_name: string;
  phone?: string;
}
interface Service {
  id: string;
  name: string;
  category?: string;
}

interface DashboardClientModalsProps {
  clientsToday: Client[];
  servicesToday: Service[];
}

export default function DashboardClientModals({ clientsToday, servicesToday }: DashboardClientModalsProps) {
  const [showClientsModal, setShowClientsModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

  return (
    <>
      <Modal open={showClientsModal} onClose={() => setShowClientsModal(false)} title="Clienti di oggi" widthClass="max-w-xl">
        {clientsToday.length === 0 ? (
          <div className="text-gray-500 text-center">Nessun cliente con appuntamento oggi.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {clientsToday.map((client) => (
              <li key={client.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="font-medium text-gray-900">{client.full_name}</span>
                {client.phone && <span className="text-gray-500 text-sm">{client.phone}</span>}
              </li>
            ))}
          </ul>
        )}
      </Modal>
      <Modal open={showServicesModal} onClose={() => setShowServicesModal(false)} title="Servizi di oggi" widthClass="max-w-xl">
        {servicesToday.length === 0 ? (
          <div className="text-gray-500 text-center">Nessun servizio erogato oggi.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {servicesToday.map((service) => (
              <li key={service.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                <span className="font-medium text-gray-900">{service.name}</span>
                {service.category && <span className="text-gray-500 text-sm">{service.category}</span>}
              </li>
            ))}
          </ul>
        )}
      </Modal>
      {/* Funzioni per apertura modali */}
      <button type="button" className="hidden" onClick={() => setShowClientsModal(true)} id="openClientsModalBtn" />
      <button type="button" className="hidden" onClick={() => setShowServicesModal(true)} id="openServicesModalBtn" />
    </>
  );
} 