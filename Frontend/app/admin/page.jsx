"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/utils/adminApi";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [totals, setTotals] = useState({
    students: 0,
    teachers: 0,
    notices: 0,
  });
  const [notices, setNotices] = useState([]);

  async function loadStudents() {
    try {
      const data = await adminApi.getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setStudents([]);
    }
  }

  async function loadNotices() {
    try {
      const data = await adminApi.getNotices();
      setNotices(data); 
    } catch (err) {
      console.error(err);
      setNotices([]);
    }
  }

  async function loadTotals() {
    try {
      const studentsData = await adminApi.getStudents();
      const teachersData = await adminApi.getTeachers();
      const noticesData = await adminApi.getNotices();

      setTotals({
        students: Array.isArray(studentsData) ? studentsData.length : 0,
        teachers: Array.isArray(teachersData) ? teachersData.length : 0,
        notices: Array.isArray(noticesData) ? noticesData.length : 0,
      });
    } catch (err) {
      console.error(err);
    }
  }

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  async function assignBatch(e) {
    e.preventDefault();
    const batch = e.target.batch.value.trim();
    if (!batch) return alert("Enter batch");
    if (selected.length === 0) return alert("Select students first");

    try {
      await Promise.all(selected.map((id) => adminApi.assignBatch(id, batch)));
      alert("Batch assigned successfully");
      setSelected([]);
      e.target.reset();
      loadStudents();
      loadTotals();
    } catch (err) {
      console.error(err);
      alert("Failed to assign batch");
    }
  }

  async function postNotice(e) {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const description = e.target.description.value.trim(); 
    if (!title || !description) return alert("Fill title and content");

    try {
      const json = await adminApi.postNotice(title, description);
      alert(json.message || "Notice posted");
      e.target.reset();
      loadNotices();
      loadTotals();
    } catch (err) {
      console.error(err);
      alert("Failed to post notice");
    }
  }

  // Initial load
  useEffect(() => {
    loadStudents();
    loadTotals();
  }, []);

  // Load notices 
  useEffect(() => {
    if (activeTab === "notices") loadNotices();
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(loadTotals, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#0a0f14] text-white">

      {/* Sidebar */}
      <aside className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 p-6">
        <h2 className="text-2xl font-bold mb-8 text-orange-400">Admin Panel</h2>
        <nav className="space-y-3">
          <button
            className={`block px-4 py-2 rounded-lg ${activeTab === "overview" ? "bg-orange-600" : "bg-white/5"}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`block px-4 py-2 rounded-lg ${activeTab === "students" ? "bg-orange-600" : "bg-white/5"}`}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>
          <button
            className={`block px-4 py-2 rounded-lg ${activeTab === "notices" ? "bg-orange-600" : "bg-white/5"}`}
            onClick={() => setActiveTab("notices")}
          >
            Notices
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-orange-400">Admin Dashboard</h1>
          <p className="text-white/70 mt-1">Manage students, batches & notices</p>
        </header>

        {/* Overview */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
                <h3 className="text-sm text-white/70">Total Students</h3>
                <p className="text-2xl font-bold text-orange-300 mt-2">{totals.students}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
                <h3 className="text-sm text-white/70">Total Teachers</h3>
                <p className="text-2xl font-bold text-orange-300 mt-2">{totals.teachers}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl border border-white/10">
                <h3 className="text-sm text-white/70">Total Notices</h3>
                <p className="text-2xl font-bold text-orange-300 mt-2">{totals.notices}</p>
              </div>
            </div>

            {/* Students + Assign Batch */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl mb-8">
              <h2 className="text-xl font-semibold text-orange-300 mb-4">Students</h2>
              <div className="space-y-3 max-h-96 overflow-auto mb-6">
                {students.map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-3 bg-[#07110f] rounded-md">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-white/60">{s.email}</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={selected.includes(s._id)}
                        onChange={() => toggle(s._id)}
                      />
                      <div className="w-10 h-5 bg-white/20 rounded-full relative transition peer-checked:bg-orange-600">
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <form onSubmit={assignBatch} className="flex gap-3">
                <input
                  name="batch"
                  placeholder="Enter batch (e.g. A1)"
                  className="flex-1 p-3 rounded-lg bg-[#07110f] border border-white/10 outline-none"
                />
                <button className="px-5 py-2 bg-orange-600 rounded-lg font-semibold">Assign</button>
              </form>
            </div>

            {/* Post Notice */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl">
              <h2 className="text-xl font-semibold text-orange-300 mb-4">Post Notice</h2>
              <form onSubmit={postNotice} className="space-y-3">
                <input name="title" placeholder="Title" className="w-full p-3 rounded-lg bg-[#07110f] border border-white/10" />
                <textarea name="description" placeholder="Content" className="w-full p-3 rounded-lg bg-[#07110f] border border-white/10 h-28" />
                <div className="flex justify-end">
                  <button className="px-6 py-2 bg-orange-600 rounded-lg text-white font-semibold">Post</button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold text-orange-300 mb-4">Students</h2>
            <div className="space-y-3 max-h-96 overflow-auto">
              {students.map((s) => (
                <div key={s._id} className="flex items-center justify-between p-3 bg-[#07110f] rounded-md">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-white/60">{s.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notices Tab */}
        {activeTab === "notices" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-semibold text-orange-300 mb-4">Notices</h2>
            <div className="space-y-3 max-h-96 overflow-auto">
              {notices.length === 0 ? (
                <p className="text-white/70">No notices posted yet.</p>
              ) : (
                notices.map((n) => (
                  <div key={n._id} className="p-3 bg-[#07110f] rounded-md">
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-white/60">{n.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
