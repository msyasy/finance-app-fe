// src/services/sso.js
// Memulai login lewat LowonganKita.
// Alur dimulai dari LapKeu supaya kita bisa membuat dan memeriksa `state`.
// Tanpa state, orang lain bisa mengirim link callback berisi kodenya sendiri,
// lalu korban tanpa sadar mengisi data keuangan di akun milik penyerang.

import API from "./api";

const LOWKIT_URL = import.meta.env.VITE_LOWKIT_URL || "https://lowkit.my.id";

function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Backend di Render (paket gratis) tidur setelah 15 menit tanpa traffic dan
// butuh puluhan detik untuk bangun. Dibangunkan sekarang, selagi user masih
// login di lowkit, supaya tidak menunggu lama di halaman callback.
// sendBeacon tetap terkirim walau halaman langsung berpindah; /api/health
// memakai api.Any, jadi menerima POST.
function warmUpBackend() {
  try {
    const url = `${API.defaults.baseURL}/health`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url);
    } else {
      fetch(url, { mode: "no-cors", keepalive: true });
    }
  } catch {
    // abaikan, ini hanya optimasi
  }
}

export function startLowkitSSO() {
  warmUpBackend();
  const state = randomState();
  sessionStorage.setItem("sso_state", state);
  window.location.href = `${LOWKIT_URL}/sso/authorize?client=lapkeu&state=${state}`;
}
