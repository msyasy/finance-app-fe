// src/pages/Landing.jsx
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "./landing.css";

// Ubah ke true setelah SSO LowonganKita terpasang dan lolos tes.
const SHOW_LOWKIT_SSO = false;

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..600;1,400..600&display=swap";
const ICONIFY_URL =
  "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";

function ensureStylesheet(id, href) {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function ensureScript(id, src) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

// iconify-icon adalah web component; atribut kelas ditulis `class`, bukan `className`.
function Icon({ name, className = "" }) {
  return <iconify-icon icon={name} class={className}></iconify-icon>;
}

const scrollToId = (id) =>
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { id: "fitur", label: "Fitur" },
  { id: "cara-kerja", label: "Cara Kerja" },
  { id: "perbandingan", label: "Perbandingan" },
  { id: "faq", label: "FAQ" },
];

const FEATURES = [
  {
    icon: "solar:chart-square-linear",
    title: "Dashboard ringkas",
    text: "Total saldo, pemasukan, pengeluaran, dan saving rate bulan ini tampil dalam satu layar.",
  },
  {
    icon: "solar:wallet-linear",
    title: "Banyak dompet",
    text: "Pisahkan saldo bank dan e-wallet, lalu kelola semuanya dari menu Dompet Saya.",
  },
  {
    icon: "solar:transfer-horizontal-linear",
    title: "Transfer saldo",
    text: "Pindahkan dana antar dompet tanpa menghitung ulang saldonya secara manual.",
  },
  {
    icon: "solar:pie-chart-2-linear",
    title: "Budget planner",
    text: "Tetapkan batas anggaran per kategori dan pantau progresnya sepanjang bulan.",
  },
  {
    icon: "solar:graph-up-linear",
    title: "Arus kas 6 bulan",
    text: "Grafik pemasukan dan pengeluaran bulanan untuk melihat tren dengan cepat.",
  },
  {
    icon: "solar:document-text-linear",
    title: "Laporan ekspor",
    text: "Unduh rekap keuanganmu dari menu Laporan Ekspor kapan pun dibutuhkan.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: "solar:shield-check-linear",
    title: "Masuk",
    text: "Daftar dengan email, lalu masuk dengan password atau passkey biometrik.",
    dark: false,
  },
  {
    n: "02",
    icon: "solar:wallet-linear",
    title: "Catat",
    text: "Tambahkan pemasukan, pengeluaran, dan transfer antar dompet beserta kategorinya.",
    dark: true,
  },
  {
    n: "03",
    icon: "solar:chart-square-linear",
    title: "Pantau",
    text: "Lihat dashboard, budget, dan arus kas, lalu ekspor laporan saat diperlukan.",
    dark: false,
  },
];

const MANUAL_POINTS = [
  "Saldo dihitung sendiri setiap akhir bulan",
  "Catatan tersebar di chat, kertas, dan spreadsheet",
  "Sulit melihat ke mana uang paling banyak pergi",
  "Merekap laporan memakan waktu",
];

const LAPKEU_POINTS = [
  "Saldo tiap dompet langsung terlihat di dashboard",
  "Semua transaksi tersimpan di satu tempat",
  "Grafik arus kas 6 bulan terakhir",
  "Laporan bisa diekspor dari menu Laporan Ekspor",
];

const SECURITY_POINTS = [
  "Password di-hash, tidak pernah disimpan sebagai teks biasa",
  "Passkey biometrik sebagai alternatif password",
  "Pembatasan percobaan untuk login dan reset password",
  "Link reset password hanya berlaku 15 menit dan sekali pakai",
];

const FAQS = [
  {
    q: "Apakah data keuanganku aman?",
    a: "Password disimpan dalam bentuk hash, bukan teks biasa. Ada pembatasan jumlah percobaan untuk login dan reset password, dan kamu bisa masuk dengan passkey biometrik tanpa mengetik password.",
  },
  {
    q: "Apa itu passkey biometrik?",
    a: "Cara masuk memakai sidik jari, wajah, atau PIN perangkat. Aktifkan lewat tombol Aktifkan Passkey Biometrik di dashboard setelah kamu masuk.",
  },
  {
    q: "Bisakah memakai lebih dari satu dompet atau rekening?",
    a: "Bisa. Buat satu dompet untuk tiap rekening bank atau e-wallet, lalu pindahkan dana lewat menu Transfer Saldo.",
  },
  {
    q: "Bagaimana kalau lupa password?",
    a: "Pilih Lupa Password di halaman masuk. Link reset dikirim ke emailmu dan berlaku selama 15 menit.",
  },
  {
    q: "Apakah ada tampilan gelap?",
    a: "Ada. Pilih tema terang atau gelap dari menu di dalam aplikasi.",
  },
];

const FOOTER_COLUMNS = [
  {
    title: "Produk",
    links: [
      { label: "Fitur", id: "fitur" },
      { label: "Cara Kerja", id: "cara-kerja" },
      { label: "Perbandingan", id: "perbandingan" },
      { label: "FAQ", id: "faq" },
    ],
  },
  {
    title: "Akun",
    links: [
      { label: "Masuk", to: "/login" },
      { label: "Daftar", to: "/register" },
      { label: "Lupa Password", to: "/forgot-password" },
    ],
  },
  {
    title: "Lainnya",
    links: [{ label: "LowonganKita", href: "https://lowkit.my.id" }],
  },
];

/* ------------------------------------------------------------------ */
/* Slide di mockup ponsel (data contoh, bukan data asli siapa pun)     */
/* ------------------------------------------------------------------ */

function SlideDashboard() {
  const bars = [35, 55, 40, 70, 50, 85];
  return (
    <div className="absolute inset-0 bg-[#0f172a] text-white px-5 pt-14 pb-6 flex flex-col">
      <p className="text-[11px] text-white/60 uppercase tracking-widest">
        Total saldo
      </p>
      <p className="text-3xl font-bold tracking-tight mt-1">Rp 12.450.000</p>
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="bg-white/10 rounded-2xl p-3">
          <p className="text-[10px] text-white/60">Pemasukan</p>
          <p className="text-sm font-semibold text-emerald-400">
            + Rp 8.000.000
          </p>
        </div>
        <div className="bg-white/10 rounded-2xl p-3">
          <p className="text-[10px] text-white/60">Pengeluaran</p>
          <p className="text-sm font-semibold text-rose-400">- Rp 3.250.000</p>
        </div>
      </div>
      <div className="mt-5 flex-1 flex items-end gap-2">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-lg bg-gradient-to-t from-sky-500/40 to-sky-400"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <h3 className="mt-5 leading-[1.8]">
        <span className="box-decoration-clone bg-white text-gray-900 px-3 py-1 text-xl font-semibold rounded-lg">
          Stop menghitung saldo manual.
        </span>
      </h3>
    </div>
  );
}

function SlideCatat() {
  const rows = [
    ["Belanja > Buah", "3 Okt", "- Rp 85.000"],
    ["Transportasi > Bensin", "2 Okt", "- Rp 50.000"],
    ["Gaji", "1 Okt", "+ Rp 8.000.000"],
    ["Makanan > Kopi", "30 Sep", "- Rp 28.000"],
  ];
  return (
    <div className="absolute inset-0 bg-[#f8f7f5] text-gray-900 px-5 pt-14 pb-6 flex flex-col">
      <p className="text-sm font-bold">Transaksi terakhir</p>
      <div className="mt-4 space-y-3">
        {rows.map(([name, date, amount]) => (
          <div
            key={name}
            className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold">{name}</p>
              <p className="text-[10px] text-gray-400">{date}</p>
            </div>
            <p
              className={`text-xs font-bold ${
                amount.startsWith("+") ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {amount}
            </p>
          </div>
        ))}
      </div>
      {/* Efek pemindaian */}
      <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.9)] animate-[slideUpBlur_2s_infinite]" />
      <h3 className="mt-auto leading-[1.8]">
        <span className="box-decoration-clone bg-black text-white px-3 py-1 text-xl font-semibold rounded-lg">
          Catat dalam hitungan detik.
        </span>
      </h3>
    </div>
  );
}

function SlideLaporan() {
  return (
    <div className="absolute inset-0 bg-black text-white px-5 pt-14 pb-6 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full border-4 border-white/20 border-t-white animate-spin" />
      <p className="mt-6 text-sm text-white/70">Menyusun laporan...</p>
      <h3 className="absolute bottom-6 left-5 right-5 text-left leading-[1.8]">
        <span className="box-decoration-clone bg-white text-gray-900 px-3 py-1 text-xl font-semibold rounded-lg">
          Laporan siap diekspor.
        </span>
      </h3>
    </div>
  );
}

const SLIDES = [SlideDashboard, SlideCatat, SlideLaporan];

/* ------------------------------------------------------------------ */
/* Visual bagian Showcase dan CTA                                      */
/* ------------------------------------------------------------------ */

function VisualHarian() {
  const rows = [
    ["Belanja > Buah", "- Rp 85.000"],
    ["Transportasi > Bensin", "- Rp 50.000"],
    ["Gaji", "+ Rp 8.000.000"],
    ["Makanan > Kopi", "- Rp 28.000"],
  ];
  return (
    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="absolute inset-x-6 top-8 space-y-3">
        {rows.map(([name, amount]) => (
          <div
            key={name}
            className="flex items-center justify-between bg-white/90 rounded-2xl px-4 py-3 text-sm"
          >
            <span className="font-semibold text-gray-800">{name}</span>
            <span
              className={`font-semibold ${
                amount.startsWith("+") ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {amount}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
        <span className="font-playfair italic text-6xl md:text-7xl text-white drop-shadow-xl">
          Harian
        </span>
      </div>
    </div>
  );
}

function VisualBulanan() {
  const budgets = [
    ["Belanja", 72],
    ["Transportasi", 45],
    ["Hiburan", 90],
  ];
  const bars = [30, 50, 38, 66, 48, 80];
  return (
    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-emerald-700 to-teal-900">
      <div className="absolute inset-x-6 top-8 space-y-3">
        {budgets.map(([name, pct]) => (
          <div key={name} className="bg-white/90 rounded-2xl px-4 py-3">
            <div className="flex justify-between text-xs font-semibold text-gray-800">
              <span>{name}</span>
              <span>{pct}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-black"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
        <div className="flex items-end gap-2 h-24 pt-2">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-white/70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
        <span className="font-playfair italic text-6xl md:text-7xl text-white drop-shadow-xl">
          Bulanan
        </span>
      </div>
    </div>
  );
}

function TimelineMock() {
  const layers = [
    {
      label: "Pemasukan",
      color: "bg-emerald-400",
      blocks: [
        [6, 24],
        [52, 30],
      ],
    },
    {
      label: "Pengeluaran",
      color: "bg-rose-400",
      blocks: [
        [10, 18],
        [34, 16],
        [60, 26],
      ],
    },
    {
      label: "Saldo",
      color: "bg-sky-400",
      blocks: [[4, 88]],
    },
  ];
  return (
    <div className="relative w-full max-w-md bg-white/10 backdrop-blur rounded-3xl p-5 border border-white/10">
      <div className="flex items-center justify-between text-white mb-4">
        <span className="text-sm font-semibold">Arus kas</span>
        <span className="text-[10px] uppercase tracking-widest text-white/50">
          6 bulan terakhir
        </span>
      </div>
      <div className="relative space-y-3">
        {layers.map((layer) => (
          <div key={layer.label}>
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-1">
              {layer.label}
            </p>
            <div className="relative h-9 bg-white/10 rounded-lg overflow-hidden">
              {layer.blocks.map(([left, width], i) => (
                <div
                  key={i}
                  className={`absolute top-1.5 bottom-1.5 rounded-md ${layer.color}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              ))}
            </div>
          </div>
        ))}
        {/* Playhead */}
        <div className="absolute -top-2 bottom-0 left-[62%] w-0.5 bg-red-500">
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-red-500" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    ensureStylesheet("lk-landing-fonts", FONTS_URL);
    ensureScript("lk-landing-iconify", ICONIFY_URL);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Geser otomatis tiap 5 detik. Interval dibuat ulang setiap `slide` berubah,
  // jadi klik manual pada titik juga mengulang hitungan 5 detik.
  useEffect(() => {
    const id = setInterval(
      () => setSlide((s) => (s + 1) % SLIDES.length),
      5000,
    );
    return () => clearInterval(id);
  }, [slide]);

  const goTo = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToId(id);
  };

  const menuTab = menuOpen ? 0 : -1;

  return (
    <div className="lk-landing min-h-screen bg-[#E3DDD7] text-gray-900 antialiased overflow-x-hidden selection:bg-black selection:text-white">
      {/* ---------------- NAVBAR ---------------- */}
      <nav
        aria-label="Navigasi utama"
        className="fixed top-0 inset-x-0 z-[500] bg-[#E3DDD7]"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center font-bold">
              L
            </span>
            <span className="text-lg font-bold tracking-tight">LapKeu</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => goTo(e, l.id)}
                className="hover:text-black transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="relative z-[501] flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline text-sm font-semibold text-gray-700 hover:text-black"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="group bg-black text-white text-sm font-semibold pl-5 pr-4 py-2.5 rounded-full flex items-center gap-2 transition-all hover:pr-6"
            >
              Daftar
              <Icon name="solar:arrow-right-linear" className="text-base" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 flex items-center justify-center text-2xl cursor-pointer"
            >
              <Icon
                name={
                  menuOpen
                    ? "solar:close-circle-linear"
                    : "solar:hamburger-menu-linear"
                }
              />
            </button>
          </div>
        </div>
      </nav>

      {/* ---------------- MENU MOBILE ---------------- */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[300] bg-[#E3DDD7] pt-28 px-6 flex flex-col gap-6 transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {NAV_LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            tabIndex={menuTab}
            onClick={(e) => goTo(e, l.id)}
            className="font-playfair italic text-4xl"
          >
            {l.label}
          </a>
        ))}
        <div className="mt-auto pb-10 flex flex-col gap-3">
          <Link
            to="/login"
            tabIndex={menuTab}
            className="text-center font-semibold border border-black/20 rounded-full py-3"
          >
            Masuk
          </Link>
          <Link
            to="/register"
            tabIndex={menuTab}
            className="text-center font-semibold bg-black text-white rounded-full py-3"
          >
            Daftar
          </Link>
        </div>
      </div>

      {/* ---------------- HERO ---------------- */}
      <section className="pt-32 md:pt-40 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="animate-enter inline-flex items-center gap-2.5 bg-white/60 border border-black/5 rounded-full pl-3 pr-4 py-1.5 text-xs font-semibold mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Passkey Biometrik Aktif
            </div>

            <h1 className="animate-enter animate-delay-100 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
              Keuangan rapi,{" "}
              <span className="font-playfair italic font-medium">
                tanpa spreadsheet.
              </span>
            </h1>

            <p className="animate-enter animate-delay-200 mt-6 text-lg text-gray-600 max-w-xl leading-relaxed">
              Catat pemasukan dan pengeluaran, pantau saldo semua dompet, dan
              lihat arus kas bulananmu dalam satu dashboard yang bersih.
            </p>

            <div className="animate-enter animate-delay-300 mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="bg-black text-white font-semibold px-7 py-3.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                Mulai Sekarang
              </Link>
              <a
                href="#fitur"
                onClick={(e) => goTo(e, "fitur")}
                className="font-semibold px-7 py-3.5 rounded-full border border-black/20 hover:bg-white/60 transition-colors"
              >
                Lihat Fitur
              </a>
              {SHOW_LOWKIT_SSO && (
                <Link
                  to="/login?sso=lowkit"
                  className="text-sm font-semibold underline underline-offset-4"
                >
                  Masuk dengan LowonganKita
                </Link>
              )}
            </div>

            <div className="animate-enter animate-delay-400 mt-14 pt-8 border-t border-gray-900/10 flex gap-14">
              <div>
                <p className="text-4xl font-semibold tracking-tight">6 bln</p>
                <p className="text-sm text-gray-600 mt-1">Tren arus kas</p>
              </div>
              <div>
                <p className="text-4xl font-semibold tracking-tight">1 tap</p>
                <p className="text-sm text-gray-600 mt-1">Masuk dengan passkey</p>
              </div>
            </div>
          </div>

          {/* Mockup ponsel */}
          <div className="animate-enter animate-delay-300 flex flex-col items-center">
            <div className="relative w-[300px] h-[600px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-sky-300/50 via-transparent to-amber-200/60 blur-3xl pointer-events-none" />
              <div className="relative w-[300px] h-[600px] bg-white rounded-[2.5rem] border-[8px] border-white shadow-2xl overflow-hidden">
                {/* Bar status */}
                <div className="absolute top-0 inset-x-0 z-20 px-6 pt-3 flex items-center justify-between text-[11px] font-semibold text-white mix-blend-difference pointer-events-none">
                  <span>9:41</span>
                  <span>LTE</span>
                </div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />

                {SLIDES.map((S, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 ${
                      i === slide ? "card-active" : "card-hidden"
                    }`}
                  >
                    <S />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Tampilkan slide ${i + 1}`}
                  aria-current={i === slide}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === slide ? "w-8 bg-black" : "w-2 bg-black/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FITUR ---------------- */}
      <section id="fitur" className="scroll-mt-24 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl leading-[1.1]">
            Semua yang kamu butuh untuk{" "}
            <span className="font-playfair italic font-medium">tertib</span>{" "}
            soal uang.
          </h2>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-[2rem] p-8 bg-white/40 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <Icon name={f.icon} />
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-gray-600 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SHOWCASE ---------------- */}
      <section className="px-6 py-24">
        <div className="max-w-7xl mx-auto space-y-28">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <VisualHarian />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Pencatatan harian
              </p>
              <h3 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
                Setiap rupiah tercatat,{" "}
                <span className="font-playfair italic font-medium">
                  tanpa repot.
                </span>
              </h3>
              <p className="mt-5 text-gray-600 text-lg leading-relaxed">
                Catat transaksi lengkap dengan kategori dan subkategori, pilih
                dompet asalnya, dan lihat daftar transaksi terakhir langsung di
                dashboard.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-8 border-t border-gray-900/10 pt-8">
                <div>
                  <p className="text-4xl font-semibold tracking-tight">Multi</p>
                  <p className="text-sm text-gray-600 mt-1">Dompet dan rekening</p>
                </div>
                <div>
                  <p className="text-4xl font-semibold tracking-tight">Sub</p>
                  <p className="text-sm text-gray-600 mt-1">Kategori bertingkat</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div className="order-2 md:order-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Perencanaan bulanan
              </p>
              <h3 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
                Pantau budget dan arus kas,{" "}
                <span className="font-playfair italic font-medium">
                  bulan demi bulan.
                </span>
              </h3>
              <p className="mt-5 text-gray-600 text-lg leading-relaxed">
                Atur anggaran per kategori di Budget Planner, lalu lihat tren
                pemasukan dan pengeluaran 6 bulan terakhir pada grafik arus kas.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-8 border-t border-gray-900/10 pt-8">
                <div>
                  <p className="text-4xl font-semibold tracking-tight">6 bln</p>
                  <p className="text-sm text-gray-600 mt-1">Tren arus kas</p>
                </div>
                <div>
                  <p className="text-4xl font-semibold tracking-tight">2 tema</p>
                  <p className="text-sm text-gray-600 mt-1">Terang dan gelap</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <VisualBulanan />
            </div>
          </div>

          {/* Kartu keamanan (menggantikan testimoni, karena belum ada testimoni nyata) */}
          <div className="rounded-[2.5rem] bg-white overflow-hidden grid md:grid-cols-2">
            <div className="p-10 md:p-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Keamanan akun
              </p>
              <h3 className="mt-4 text-4xl font-semibold tracking-tight leading-[1.1]">
                Data keuangan itu{" "}
                <span className="font-playfair italic font-medium">pribadi.</span>
              </h3>
              <ul className="mt-8 space-y-4">
                {SECURITY_POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-gray-700">
                    <Icon
                      name="solar:check-circle-bold"
                      className="text-xl mt-0.5 text-black shrink-0"
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative min-h-[320px] bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
              <Icon
                name="solar:shield-check-linear"
                className="text-[9rem] text-white/15"
              />
              <span className="absolute font-playfair italic text-5xl text-white drop-shadow-xl">
                Dijaga berlapis.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CARA KERJA ---------------- */}
      <section id="cara-kerja" className="scroll-mt-24 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1]">
            Tiga langkah,{" "}
            <span className="font-playfair italic font-medium">selesai.</span>
          </h2>

          <div className="relative mt-16">
            <svg
              aria-hidden="true"
              className="hidden md:block absolute top-8 left-0 w-full h-24 z-0 pointer-events-none overflow-visible"
              viewBox="0 0 1300 100"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M150,20 C300,80 500,-40 650,20 C800,80 1000,-40 1150,20"
                stroke="#000"
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="8 8"
              />
            </svg>

            <div className="relative z-10 grid md:grid-cols-3 gap-8">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className={`rounded-[2rem] p-8 ${
                    s.dark ? "bg-black text-white" : "bg-white text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                        s.dark ? "bg-white text-black" : "bg-black text-white"
                      }`}
                    >
                      <Icon name={s.icon} />
                    </div>
                    <span
                      className={`font-playfair italic text-4xl ${
                        s.dark ? "text-white/40" : "text-black/25"
                      }`}
                    >
                      {s.n}
                    </span>
                  </div>
                  <h3 className="mt-8 text-2xl font-semibold tracking-tight">
                    {s.title}
                  </h3>
                  <p
                    className={`mt-2 leading-relaxed ${
                      s.dark ? "text-white/70" : "text-gray-600"
                    }`}
                  >
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- PERBANDINGAN ---------------- */}
      <section id="perbandingan" className="scroll-mt-24 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] text-center">
            Kenapa pindah dari{" "}
            <span className="font-playfair italic font-medium">
              catatan manual?
            </span>
          </h2>

          <div className="mt-14 grid md:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-[2rem] bg-gray-100/50 p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                Cara manual
              </p>
              <ul className="mt-6 space-y-4">
                {MANUAL_POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-gray-500">
                    <Icon
                      name="solar:close-circle-linear"
                      className="text-xl mt-0.5 text-gray-400 shrink-0"
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-[2rem] bg-white p-8 md:p-10 shadow-xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-black" />
              <p className="text-sm font-semibold uppercase tracking-widest">
                LapKeu
              </p>
              <ul className="mt-6 space-y-4">
                {LAPKEU_POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-gray-800">
                    <Icon
                      name="solar:check-circle-bold"
                      className="text-xl mt-0.5 text-black shrink-0"
                    />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="scroll-mt-24 px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
            Pertanyaan{" "}
            <span className="font-playfair italic font-medium">umum.</span>
          </h2>
          <div className="mt-10 border-t border-black/10">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group border-b border-black/10 py-5 transition-all open:pb-4"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-lg font-semibold">
                  {f.q}
                  <span className="w-8 h-8 shrink-0 rounded-full bg-black text-white flex items-center justify-center transition-transform duration-300 group-open:rotate-45">
                    <Icon name="solar:add-linear" className="text-lg" />
                  </span>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed max-w-2xl">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA + FOOTER ---------------- */}
      <section className="px-6 pt-12 pb-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-14 flex flex-col justify-between min-h-[420px]">
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-3xl rotate-3">
              <Icon name="solar:wallet-bold" />
            </div>
            <div>
              <h2 className="mt-10 text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
                Siap merapikan{" "}
                <span className="font-playfair italic font-medium">
                  keuanganmu?
                </span>
              </h2>
              <p className="mt-4 text-gray-600 max-w-md">
                Buat akun, tambahkan dompet pertamamu, dan mulai mencatat hari
                ini.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-block bg-black text-white font-semibold px-7 py-3.5 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Daftar Sekarang
                </Link>
                <Link
                  to="/login"
                  className="font-semibold underline underline-offset-4"
                >
                  Sudah punya akun? Masuk
                </Link>
              </div>
            </div>
          </div>

          <div className="group bg-black rounded-[2.5rem] overflow-hidden p-10 min-h-[420px] flex items-center justify-center">
            <div className="rotate-6 group-hover:rotate-0 transition-transform duration-500 w-full flex justify-center">
              <TimelineMock />
            </div>
          </div>
        </div>

        <footer className="max-w-7xl mx-auto mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center font-bold">
                  L
                </span>
                <span className="text-lg font-bold tracking-tight">LapKeu</span>
              </div>
              <p className="mt-4 text-sm text-gray-600 max-w-xs">
                Catat, pantau, dan laporkan keuanganmu dalam satu tempat.
              </p>
            </div>

            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold">{col.title}</p>
                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.to ? (
                        <Link to={l.to} className="hover:text-black">
                          {l.label}
                        </Link>
                      ) : l.href ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-black"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <a
                          href={`#${l.id}`}
                          onClick={(e) => goTo(e, l.id)}
                          className="hover:text-black"
                        >
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-6 border-t border-gray-900/10 flex flex-col md:flex-row gap-2 justify-between text-[10px] uppercase tracking-widest text-gray-500">
            <span>© 2026 LapKeu</span>
            <span>Data pada tampilan contoh hanyalah ilustrasi</span>
          </div>
        </footer>
      </section>
    </div>
  );
}

// Pengunjung yang sudah punya sesi langsung diarahkan ke dashboard.
export default function Landing() {
  if (localStorage.getItem("token")) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingPage />;
}