import { useEffect, useState } from "react";
import axios from "../lib/axios";

export default function MechanicsAdmin() {
  const [mechanics, setMechanics] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMechanics = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/mechanics");
      setMechanics(res.data.mechanics);
    } catch (e) {
      setError("Eroare la încărcarea mecanicilor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post("/mechanics", { name, email, phone });
      setName(""); setEmail(""); setPhone("");
      setSuccess("Mecanic adăugat cu succes!");
      fetchMechanics();
    } catch (e) {
      setError(e.response?.data?.message || "Eroare la adăugare");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi acest mecanic?")) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(`/mechanics/${id}`);
      setSuccess("Mecanic șters!");
      fetchMechanics();
    } catch (e) {
      setError(e.response?.data?.message || "Eroare la ștergere");
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Administrare Mecanici</h2>
      <form className="flex flex-col md:flex-row gap-4 mb-6" onSubmit={handleAdd}>
        <input
          className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white flex-1"
          placeholder="Nume mecanic*"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white flex-1"
          placeholder="Email (opțional)"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white flex-1"
          placeholder="Telefon (opțional)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#2B4EE6] hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
          disabled={loading}
        >Adaugă</button>
      </form>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {success && <div className="text-green-400 mb-2">{success}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-gray-300">Nume</th>
              <th className="px-4 py-2 text-left text-gray-300">Email</th>
              <th className="px-4 py-2 text-left text-gray-300">Telefon</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {mechanics.map(m => (
              <tr key={m._id} className="border-t border-gray-700">
                <td className="px-4 py-2 text-white">{m.name}</td>
                <td className="px-4 py-2 text-gray-300">{m.email || '-'}</td>
                <td className="px-4 py-2 text-gray-300">{m.phone || '-'}</td>
                <td className="px-4 py-2">
                  <button
                    className="bg-red-600 hover:bg-red-800 text-white px-3 py-1 rounded-lg"
                    onClick={() => handleDelete(m._id)}
                  >Șterge</button>
                </td>
              </tr>
            ))}
            {mechanics.length === 0 && (
              <tr><td colSpan={4} className="text-center text-gray-400 py-4">Nici un mecanic înregistrat.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 