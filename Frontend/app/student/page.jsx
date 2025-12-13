"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiCalendar, FiBook, FiBell } from "react-icons/fi";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { io } from "socket.io-client";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [student, setStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notices, setNotices] = useState([]);
  const router = useRouter();

  // Fetch student info
  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get("/student");
        setStudent(res.data.student);
      } catch (err) {
        console.error("Student fetch error:", err);
        if (err.response && err.response.status === 401) {
          router.push("/");
        }
      }
    }
    loadData();
  }, [router]);

  // Fetch notices 
  useEffect(() => {
    async function loadNotices() {
      try {
        const res = await api.get("/notices");
        setNotices(res.data.notices || []);
      } catch (err) {
        console.error("Notices fetch error:", err);
        setNotices([]);
      }
    }
    loadNotices();
  }, []);

  // Socket for live notifications
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_BASE, {
      withCredentials: true,
    });
    socket.emit("registerRole", { role: "student" });

    socket.on("notification", (data) => {
      setNotifications((prev) => [...prev, data.message]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((msg) => msg !== data.message));
      }, 5000);

      async function fetchNewNotices() {
        try {
          const res = await api.get("/notices");
          setNotices(res.data.notices || []);
        } catch (err) {
          console.error(err);
        }
      }
      fetchNewNotices();
    });

    return () => socket.disconnect();
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <FiUser size={18} /> },
    { id: "attendance", label: "Attendance", icon: <FiCalendar size={18} /> },
    { id: "marks", label: "Marks", icon: <FiBook size={18} /> },
    { id: "updates", label: "Updates", icon: <FiBell size={18} /> },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0f14] text-white">

      {/* Sidebar */}
      <aside className="w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-10 text-green-400 tracking-wide">Student Panel</h2>
        <nav className="space-y-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${activeTab === t.id
                ? "bg-green-600/90 shadow-md"
                : "bg-white/5 hover:bg-white/10"
                }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10 relative">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-green-400 drop-shadow-lg">
            Welcome, {student?.name || "Loading..."}
          </h1>
          <p className="text-white/60 mt-1 text-sm">
            Manage your performance & updates seamlessly.
          </p>
        </header>

        {/* Notification Toasts */}
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {notifications.map((msg, idx) => (
            <div
              key={idx}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
            >
              {msg}
            </div>
          ))}
        </div>


        <AnimatePresence mode="wait">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-xl">
                <h3 className="text-lg font-semibold">Attendance Summary</h3>
                <p className="text-4xl font-bold text-green-400 mt-3">
                  {student?.attendancePercentage ?? "—"}%
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-xl">
                <h3 className="text-lg font-semibold">Average Marks</h3>
                <p className="text-4xl font-bold text-green-400 mt-3">
                  {student?.averageMarks ?? "—"}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-xl shadow-xl col-span-full">
                <h3 className="text-lg font-semibold">Batch</h3>
                <p className="text-xl mt-2 text-white/80">
                  {student?.batch ?? "Not assigned"}
                </p>
              </div>
            </motion.div>
          )}

          {/* Attendance */}
          {activeTab === "attendance" && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="p-3 border border-white/10 text-left">Date</th>
                      <th className="p-3 border border-white/10 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student?.attendance &&
                      Object.entries(student.attendance).map(([date, status]) => (
                        <tr key={date} className="hover:bg-white/5 transition">
                          <td className="p-3 border border-white/10">{date}</td>
                          <td className={`p-3 border border-white/10 font-semibold ${status === "present" ? "text-green-400" : "text-red-400"
                            }`}>
                            {status}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Marks */}
          {activeTab === "marks" && (
            <motion.div
              key="marks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl shadow-xl"
            >
              <h2 className="text-xl font-semibold mb-4">Marks</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="p-3 border border-white/10 text-left">Subject</th>
                      <th className="p-3 border border-white/10 text-left">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student?.marks &&
                      Object.entries(student.marks).map(([subject, mark]) => (
                        <tr key={subject} className="hover:bg-white/5 transition">
                          <td className="p-3 border border-white/10">{subject}</td>
                          <td className="p-3 border border-white/10 text-green-300">{mark}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Updates / Notices */}
          {activeTab === "updates" && (
            <motion.div
              key="updates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {notices.length === 0 ? (
                <p className="text-white/60">No notices yet.</p>
              ) : (
                notices.map((n) => (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-xl shadow-xl"
                  >
                    <h3 className="text-lg font-semibold text-green-300">{n.title}</h3>
                    <p className="text-white/70 mt-1">{n.description}</p>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
