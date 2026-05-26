"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Users,
  Wrench,
  Wallet,
  AlertTriangle,
} from "lucide-react";

interface Stats {
  totalCustomer: number;
  serviceAktif: number;
  totalPemasukan: number;
  stokHabis: number;
}

interface Riwayat {
  id: string;
  jenis: "service" | "penjualan";
  tanggal: string;
  nama: string;
  keterangan: string;
  detail: string;
  total: number;
}

interface ChartItem {
  label: string;
  service: number;
  penjualan: number;
}

type Periode = "harian" | "mingguan" | "bulanan" | "tahunan";

function formatRupiah(n: number) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

function getLabelTanggal(tanggal: string, periode: Periode) {
  const date = new Date(tanggal);

  if (periode === "harian") {
    return tanggal;
  }

  if (periode === "mingguan") {
    const minggu = Math.ceil(date.getDate() / 7);
    return `Minggu ${minggu} ${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  }

  if (periode === "bulanan") {
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  }

  return `${date.getFullYear()}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalCustomer: 0,
    serviceAktif: 0,
    totalPemasukan: 0,
    stokHabis: 0,
  });

  const [riwayat, setRiwayat] = useState<Riwayat[]>([]);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [periode, setPeriode] = useState<Periode>("harian");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setStats);

    fetch("/api/riwayat")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRiwayat(data);
        } else {
          setRiwayat([]);
        }
      });
  }, []);

  useEffect(() => {
    const grouped: Record<string, ChartItem> = {};

    riwayat.forEach((item) => {
      const label = getLabelTanggal(item.tanggal, periode);

      if (!grouped[label]) {
        grouped[label] = {
          label,
          service: 0,
          penjualan: 0,
        };
      }

      if (item.jenis === "service") {
        grouped[label].service += Number(item.total || 0);
      } else {
        grouped[label].penjualan += Number(item.total || 0);
      }
    });

    setChartData(Object.values(grouped));
  }, [riwayat, periode]);

  const cards = [
  {
    label: "Total Customer",
    value: stats.totalCustomer,
    icon: <Users size={28} />,
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    label: "Service Aktif",
    value: stats.serviceAktif,
    icon: <Wrench size={28} />,
    color: "from-amber-500/20 to-amber-600/10",
  },
  {
    label: "Pemasukan Bulan Ini",
    value: formatRupiah(stats.totalPemasukan),
    icon: <Wallet size={28} />,
    color: "from-green-500/20 to-green-600/10",
  },
  {
    label: "Stok Hampir Habis",
    value: stats.stokHabis,
    icon: <AlertTriangle size={28} />,
    color: "from-red-500/20 to-red-600/10",
  },
];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
      <p className="text-white/40 text-sm mb-6">Ringkasan aktivitas toko</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-linear-to-br ${card.color} border border-white/10 rounded-2xl p-5`}
          >
            <div className="text-white/80 mb-3">
                {card.icon}
            </div>
            <p className="text-white/50 text-xs mb-1">{card.label}</p>
            <p className="text-white text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-white font-semibold">Grafik Pemasukan</h3>
            <p className="text-white/40 text-xs">
              Statistik service dan penjualan berdasarkan periode
            </p>
          </div>

          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as Periode)}
            className="bg-[#152847] border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37]"
          >
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
            <option value="tahunan">Tahunan</option>
          </select>
        </div>

        <div className="h-80">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/40 text-sm">
              Belum ada data transaksi
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  tickFormatter={(value) => `${Number(value) / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#152847",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    color: "white",
                  }}
                  formatter={(value) => formatRupiah(Number(value))}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="service"
                  name="Service"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="penjualan"
                  name="Penjualan"
                  stroke="#c084fc"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}