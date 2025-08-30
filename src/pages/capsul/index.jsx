import { useEffect, useState } from "react";

const TYPE_OPTIONS = [
  { id: 1, name: "Capsule" },
  { id: 2, name: "Cabin" },
];

const STATUS_MASTER = [
  "Available",
  "Occupied",
  "Cleaning In Progress",
  "Maintenance Needed",
];


function CapsulPage() {
  const [capsuls, setCapsuls] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState({ name: "", type: "1" });
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", type: "1" });
  const [statusOptions, setStatusOptions] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZES = [5, 10, 20, 50];

    const getAllowedStatusOptions = (currentStatus) => {
    if (!currentStatus) return STATUS_MASTER;
    const cur = currentStatus.toLowerCase();
    if (cur === "occupied") {
      return STATUS_MASTER.filter((s) => s.toLowerCase() !== "available");
    }
    return STATUS_MASTER;
  };

  // Fetch all units
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/units`)
      .then((res) => res.json())
      .then((data) => {
        setCapsuls(data);
        const uniqueStatuses = [...new Set(data.map((item) => item.status).filter(Boolean))];
        setStatusOptions(uniqueStatuses);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = capsuls;
    if (typeFilter) {
      data = data.filter((c) => c.type === TYPE_OPTIONS.find((t) => t.id === Number(typeFilter))?.name);
    }
    if (statusFilter) {
      data = data.filter((c) => (c.status || "").toLowerCase() === statusFilter.toLowerCase());
    }
    setFiltered(data);
    setCurrentPage(1);
  }, [capsuls, typeFilter, statusFilter]);

  // Add new unit
  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    await fetch("http://127.0.0.1:8000/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        id_type: form.type,
        status: form.status, 
      }),
    });
    setForm({ name: "", type: "1", status: "Available" });

    setAdding(false);
    setLoading(true);
    // Refresh data
    fetch("http://127.0.0.1:8000/api/units")
      .then((res) => res.json())
      .then((data) => {
        setCapsuls(data);
        const uniqueStatuses = [...new Set(data.map((item) => item.status).filter(Boolean))];
        setStatusOptions(uniqueStatuses);
        setLoading(false);
      });
  };

  // Update status
  const handleStatusChange = async (id, newStatus) => {
    if (!newStatus) return;
    // lock this row UI
    setUpdatingId(id);
    try {
      const unit = capsuls.find((c) => c.id === id);
      const response = await fetch(`http://127.0.0.1:8000/api/units/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: unit?.name || "",
          id_type: TYPE_OPTIONS.find((t) => t.name === unit?.type)?.id || 1,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        let errJson = null;
        try {
          errJson = await response.json();
        } catch (e) {
          // ignore
        }
        const message = (errJson && (errJson.detail || errJson.error)) || "Failed to update status";
        alert(message);
        const refreshResponse = await fetch("http://127.0.0.1:8000/api/units");
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setCapsuls(data);
          const uniqueStatuses = [...new Set(data.map((item) => item.status).filter(Boolean))];
          setStatusOptions(uniqueStatuses);
        }
        return;
      }

      const refreshResponse = await fetch("http://127.0.0.1:8000/api/units");
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setCapsuls(data);
        const uniqueStatuses = [...new Set(data.map((item) => item.status).filter(Boolean))];
        setStatusOptions(uniqueStatuses);
      } else {
        setCapsuls((prev) => prev.map((capsul) => (capsul.id === id ? { ...capsul, status: newStatus } : capsul)));
        setStatusOptions((prev) => {
          if (!prev.includes(newStatus)) return [...prev, newStatus];
          return prev;
        });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Start editing
  const handleEdit = (capsul) => {
    setEditingId(capsul.id);
    setEditForm({
      name: capsul.name,
      type: TYPE_OPTIONS.find((t) => t.name === capsul.type)?.id.toString() || "1",
    });
  };

  // Save edit
  const handleEditSave = async (id) => {
    setAdding(true);
    const currentCapsul = capsuls.find((c) => c.id === id);
    await fetch(`http://127.0.0.1:8000/api/units/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        id_type: editForm.type,
        status: currentCapsul.status,
      }),
    });
    setEditingId(null);
    setAdding(false);
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/units")
      .then((res) => res.json())
      .then((data) => {
        setCapsuls(data);
        const uniqueStatuses = [...new Set(data.map((item) => item.status).filter(Boolean))];
        setStatusOptions(uniqueStatuses);
        setLoading(false);
      });
  };

  // Cancel edit
  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({ name: "", type: "1" });
  };

  // Delete unit
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this unit?")) {
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/units/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        const refreshResponse = await fetch("http://127.0.0.1:8000/api/units");
        const data = await refreshResponse.json();
        setCapsuls(data);
        const uniqueStatuses = [...new Set(data.map((item) => item.status).filter(Boolean))];
        setStatusOptions(uniqueStatuses);
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "occupied":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "maintenance":
      case "maintenance needed":
        return "bg-red-100 text-red-800 border-red-200";
      case "cleaning in progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeBadgeClass = (type) => {
    return type?.toLowerCase() === "capsule"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-orange-100 text-orange-800 border-orange-200";
  };

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayed = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Capsul Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Manage your accommodations efficiently</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filter Options
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add Form Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Unit
          </h3>
          <form onSubmit={handleAdd} className="grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Name</label>
              <input
                className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter unit name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Initial Status</label>
              <select
                className="cursor-pointer w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-700 font-medium"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_MASTER.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={adding}
            >
              {adding ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </div>
              ) : (
                "Add Unit"
              )}
            </button>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H5m8 12H5" />
              </svg>
              Units Overview
              <span className="bg-gray-100 text-gray-600 text-sm font-medium px-2 py-1 rounded-full ml-2">{filtered.length} units</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-gray-500 font-medium">Loading units...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span className="text-gray-500 font-medium">No units found</span>
                        <span className="text-gray-400 text-sm">Try adjusting your filters or add a new unit</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // use paginated slice
                  displayed.map((c, index) => (
                    <tr key={c.id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="px-6 py-4">
                        {editingId === c.id ? (
                          <input
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required
                          />
                        ) : (
                          <div className="font-medium text-gray-900">{c.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === c.id ? (
                          <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          >
                            {TYPE_OPTIONS.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeBadgeClass(c.type)}`}>{c.type}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === c.id ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(c.status)}`}>{c.status}</span>
                        ) : (
                          <div className="relative">
                            <select
                              className={`appearance-none w-full border rounded-lg px-3 py-2 pr-8 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer ${getStatusBadgeClass(c.status)}`}
                              value={c.status || ""}
                              onChange={(e) => {
                                if (e.target.value && e.target.value !== c.status) {
                                  handleStatusChange(c.id, e.target.value);
                                }
                              }}
                              disabled={updatingId === c.id}
                            >
                              {getAllowedStatusOptions(c.status).map((s) => (
                                <option key={s} value={s} className="bg-white text-gray-900">
                                  {s}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {c.lastUpdated ? (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {c.lastUpdated.slice(0, 10)}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not updated</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === c.id ? (
                          <div className="flex gap-2">
                            <button
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              onClick={() => handleEditSave(c.id)}
                              disabled={adding || !editForm.name.trim()}
                            >
                              {adding ? "Saving..." : "Save"}
                            </button>
                            <button
                              className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              onClick={handleEditCancel}
                              disabled={adding}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              className="cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              onClick={() => handleEdit(c)}
                              disabled={editingId !== null}
                            >
                              Edit
                            </button>
                            <button
                              className="cursor-pointer bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              onClick={() => handleDelete(c.id)}
                              disabled={editingId !== null}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium">{totalItems}</span> units
            </div>

            <div className="flex items-center gap-3">
              <div>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="cursor-pointer border rounded px-3 py-2 text-sm"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s} / page
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="cursor-pointer px-3 py-2 rounded bg-white border text-sm disabled:opacity-50"
                >
                  Prev
                </button>

                {/* simple page numbers (show up to 5 pages, centered) */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else {
                      const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                      pageNumber = startPage + i;
                    }
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`cursor-pointer px-3 py-2 rounded text-sm border ${currentPage === pageNumber ? "bg-blue-500 text-white" : "bg-white"}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer px-3 py-2 rounded bg-white border text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CapsulPage;