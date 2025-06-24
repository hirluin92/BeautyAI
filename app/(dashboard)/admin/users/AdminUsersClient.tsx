'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Modal from '@/components/ui/Modal'
import { Users, Plus, Edit, Trash2, Lock, Unlock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

interface AdminUsersClientProps {
  users: User[]
}

export default function AdminUsersClient({ users: initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [showModal, setShowModal] = useState(false)
  const [modalUser, setModalUser] = useState<User | null>(null)
  const [form, setForm] = useState({ email: '', role: 'staff' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  async function loadUsers() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('users').select('id, email, role, is_active, created_at')
      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      setError(err.message || 'Errore nel caricamento utenti')
    }
  }

  function openAddModal() {
    setModalUser(null)
    setForm({ email: '', role: 'staff' })
    setShowModal(true)
  }

  function openEditModal(user: User) {
    setModalUser(user)
    setForm({ email: user.email, role: user.role })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      if (modalUser) {
        // Modifica ruolo
        const { error } = await supabase.from('users').update({ role: form.role }).eq('id', modalUser.id)
        if (error) throw error
        toast.success('Ruolo utente aggiornato')
      } else {
        // Invio invito (placeholder, implementare invio reale)
        const { error } = await supabase.from('users').insert([{ email: form.email, role: form.role, is_active: true }])
        if (error) throw error
        toast.success('Nuovo utente aggiunto')
      }
      setShowModal(false)
      loadUsers()
    } catch (err: any) {
      setError(err.message || 'Errore nel salvataggio')
      toast.error(err.message || 'Errore nel salvataggio')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user: User) {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('users').delete().eq('id', user.id)
      if (error) throw error
      toast.success('Utente eliminato')
      loadUsers()
    } catch (err: any) {
      setError(err.message || 'Errore nell\'eliminazione')
      toast.error(err.message || 'Errore nell\'eliminazione')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(user: User) {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('users').update({ is_active: !user.is_active }).eq('id', user.id)
      if (error) throw error
      toast.success(user.is_active ? 'Utente bloccato' : 'Utente sbloccato')
      loadUsers()
    } catch (err: any) {
      setError(err.message || 'Errore nell\'aggiornamento')
      toast.error(err.message || 'Errore nell\'aggiornamento')
    } finally {
      setSaving(false)
    }
  }

  // Filtraggio utenti
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? user.is_active : !user.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" /> Gestione Utenti
        </h1>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nuovo Utente
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Utenti di Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Cerca per email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full md:w-64"
                  aria-label="Cerca per email"
                />
                <select
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  className="border rounded px-2 py-1 md:ml-2 focus:ring-2 focus:ring-indigo-500"
                  aria-label="Filtro ruolo"
                >
                  <option value="all">Tutti i ruoli</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="border rounded px-2 py-1 md:ml-2 focus:ring-2 focus:ring-indigo-500"
                  aria-label="Filtro stato"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="active">Attivi</option>
                  <option value="blocked">Bloccati</option>
                </select>
              </div>
              <table className="min-w-full text-sm md:text-base border rounded-lg overflow-hidden">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-2 py-2 md:px-4 md:py-2 text-left">Email</th>
                    <th className="px-2 py-2 md:px-4 md:py-2 text-left">Ruolo</th>
                    <th className="px-2 py-2 md:px-4 md:py-2 text-left">Stato</th>
                    <th className="px-2 py-2 md:px-4 md:py-2 text-left">Creato il</th>
                    <th className="px-2 py-2 md:px-4 md:py-2 text-left">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 focus-within:bg-indigo-50">
                      <td className="px-2 py-2 md:px-4 md:py-2 break-all">{user.email}</td>
                      <td className="px-2 py-2 md:px-4 md:py-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Admin' : 'Staff'}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 md:px-4 md:py-2">
                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                          {user.is_active ? 'Attivo' : 'Bloccato'}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 md:px-4 md:py-2 text-xs">
                        {new Date(user.created_at).toLocaleDateString('it-IT')}
                      </td>
                      <td className="px-2 py-2 md:px-4 md:py-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(user)}
                            disabled={saving}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(user)}
                            disabled={saving}
                            className="h-8 w-8 p-0"
                          >
                            {user.is_active ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(user)}
                            disabled={saving}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  Nessun utente trovato
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={modalUser ? 'Modifica Utente' : 'Nuovo Utente'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              disabled={!!modalUser}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ruolo
            </label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Annulla
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.email}
              className="flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {modalUser ? 'Aggiorna' : 'Crea'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
} 