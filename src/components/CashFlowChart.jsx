import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function CashFlowChart({ data }) {
  const formatRupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-800">
          Tren Arus Kas (6 Bulan Terakhir)
        </h3>
        <p className="text-xs text-gray-400">
          Perbandingan total Pemasukan vs Pengeluaran bulanan
        </p>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#64748B" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              tickFormatter={(val) =>
                val >= 1000000
                  ? `${(val / 1000000).toFixed(1)}M`
                  : val >= 1000
                    ? `${(val / 1000).toFixed(0)}k`
                    : val
              }
            />
            <Tooltip
              formatter={(val, name) => [
                formatRupiah(val),
                name === "income" ? "Pemasukan" : "Pengeluaran",
              ]}
              contentStyle={{
                backgroundColor: "#1E293B",
                borderRadius: "12px",
                color: "#FFF",
                border: "none",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#FFF" }}
            />
            <Legend
              formatter={(value) =>
                value === "income" ? "Pemasukan" : "Pengeluaran"
              }
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Bar
              dataKey="income"
              name="income"
              fill="#16A34A"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="expense"
              name="expense"
              fill="#DC2626"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
