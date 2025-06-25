import { useEffect, useState } from "react";
import axios from "../lib/axios";

const STATUS_OPTIONS = ["În așteptare", "Confirmată", "Finalizată", "Anulată"];

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMechanic, setFilterMechanic] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [mechanics, setMechanics] = useState([]);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const res = await axios.get("/mechanics");
        setMechanics(res.data.mechanics || []);
      } catch {}
    };
    fetchMechanics();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/appointments");
        setAppointments(res.data.appointments || []);
      } catch (e) {
        setError(e.response?.data?.message || "Eroare la încărcarea programărilor");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Filtrare și sortare locală
  let filtered = appointments.filter(appt => {
    return (
      (!filterStatus || appt.status === filterStatus) &&
      (!filterMechanic || (appt.mechanic && appt.mechanic._id === filterMechanic)) &&
      (!filterUser || (appt.user && (appt.user.firstName?.toLowerCase().includes(filterUser.toLowerCase()) || appt.user.lastName?.toLowerCase().includes(filterUser.toLowerCase()) || appt.user.email?.toLowerCase().includes(filterUser.toLowerCase()))))
    );
  });
  filtered.sort((a, b) => {
    let vA = a[sortField], vB = b[sortField];
    if (sortField === "date") {
      vA = new Date(vA); vB = new Date(vB);
    }
    if (vA < vB) return sortDir === "asc" ? -1 : 1;
    if (vA > vB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const handleConfirm = async (id) => {
    try {
      const res = await axios.put(`/appointments/${id}/confirm`);
      setAppointments(appts => appts.map(a => a._id === id ? res.data.appointment : a));
    } catch (e) {
      alert(e.response?.data?.message || "Eroare la confirmare");
    }
  };
  const handleCancel = async (id) => {
    if (!window.confirm("Sigur vrei să anulezi această programare?")) return;
    try {
      const res = await axios.put(`/appointments/${id}/cancel-admin`);
      setAppointments(appts => appts.map(a => a._id === id ? res.data.appointment : a));
    } catch (e) {
      alert(e.response?.data?.message || "Eroare la anulare");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi această programare?")) return;
    try {
      await axios.delete(`/appointments/${id}/admin`);
      setAppointments(appts => appts.filter(a => a._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || "Eroare la ștergere");
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-300">Se încarcă programările...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-8 overflow-x-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Toate Programările la Service</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        <select className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Toate statusurile</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white" value={filterMechanic} onChange={e => setFilterMechanic(e.target.value)}>
          <option value="">Toți mecanicii</option>
          {mechanics.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
        <input className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white" placeholder="Caută user..." value={filterUser} onChange={e => setFilterUser(e.target.value)} />
        <select className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white" value={sortField} onChange={e => setSortField(e.target.value)}>
          <option value="date">Dată/Ora</option>
          <option value="status">Status</option>
          <option value="serviceType">Tip Serviciu</option>
        </select>
        <select className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white" value={sortDir} onChange={e => setSortDir(e.target.value)}>
          <option value="desc">Descrescător</option>
          <option value="asc">Crescător</option>
        </select>
      </div>
      <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-gray-300">Data/Ora</th>
            <th className="px-4 py-2 text-left text-gray-300">User</th>
            <th className="px-4 py-2 text-left text-gray-300">Mecanic</th>
            <th className="px-4 py-2 text-left text-gray-300">Tip Serviciu</th>
            <th className="px-4 py-2 text-left text-gray-300">Vehicul</th>
            <th className="px-4 py-2 text-left text-gray-300">Status</th>
            <th className="px-4 py-2 text-left text-gray-300">Note</th>
            <th className="px-4 py-2 text-left text-gray-300">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={8} className="text-center text-gray-400 py-4">Nicio programare găsită.</td></tr>
          ) : filtered.map(appt => (
            <tr key={appt._id} className="border-t border-gray-700">
              <td className="px-4 py-2 text-white">{appt.date ? new Date(appt.date).toLocaleString() : '-'}</td>
              <td className="px-4 py-2 text-gray-300">{appt.user ? `${appt.user.firstName || ''} ${appt.user.lastName || ''}`.trim() || appt.user.email : '-'}</td>
              <td className="px-4 py-2 text-gray-300">{appt.mechanic ? appt.mechanic.name : '-'}</td>
              <td className="px-4 py-2 text-gray-300">{appt.serviceType}</td>
              <td className="px-4 py-2 text-gray-300">{appt.vehicle || '-'}</td>
              <td className="px-4 py-2 text-gray-300">{appt.status}</td>
              <td className="px-4 py-2 text-gray-300">{appt.note || '-'}</td>
              <td className="px-4 py-2 text-gray-300">
                {appt.status !== "Confirmată" && appt.status !== "Anulată" && (
                  <button className="bg-green-600 hover:bg-green-800 text-white px-3 py-1 rounded mr-2" onClick={() => handleConfirm(appt._id)}>Confirmă</button>
                )}
                {appt.status !== "Anulată" && (
                  <button className="bg-red-600 hover:bg-red-800 text-white px-3 py-1 rounded mr-2" onClick={() => handleCancel(appt._id)}>Anulează</button>
                )}
                {appt.status === "Anulată" && (
                  <button className="bg-gray-600 hover:bg-gray-800 text-white px-3 py-1 rounded" onClick={() => handleDelete(appt._id)}>Șterge</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 