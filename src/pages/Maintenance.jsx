import React from "react";
import { Wrench, RefreshCcw, Clock3 } from "lucide-react";

export default function Maintenance() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020B2D] flex items-center justify-center px-6">

      {/* Background Glow */}
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-blue-500/20 blur-[150px] rounded-full" />

      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-indigo-500/20 blur-[150px] rounded-full" />

      <div className="relative w-full max-w-2xl">

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">
                L
              </span>
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="animate-pulse w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Wrench size={30} className="text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-center text-4xl font-bold text-white mb-3">
            LapKeu Sedang Maintenance
          </h1>

          <p className="text-center text-gray-400 max-w-xl mx-auto leading-relaxed">
            Kami sedang melakukan pemeliharaan sistem untuk meningkatkan
            performa, keamanan data, dan pengalaman pengguna.
            Silakan kembali beberapa saat lagi.
          </p>

          {/* Progress */}
          <div className="mt-10">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress Maintenance</span>
              <span>80%</span>
            </div>

            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                style={{ width: "80%" }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Clock3 size={18} />
                <span className="font-medium">
                  Status Maintenance
                </span>
              </div>

              <p className="text-gray-300">
                Sistem Sedang Diperbarui
              </p>

              <p className="text-sm text-gray-500">
                Mohon tunggu beberapa saat
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-blue-400 font-medium mb-2">
                Status Sistem
              </div>

              <span className="inline-flex px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                Maintenance Mode
              </span>
            </div>

          </div>

          {/* Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <RefreshCcw size={18} />
              Refresh Halaman
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} LapKeu • Financial Management System
          </div>

        </div>

      </div>
    </div>
  );
}