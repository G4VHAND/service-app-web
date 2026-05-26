"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface NotaPenjualan {
  id: number;
  tanggal: string;
  total: number;

  user?: {
    username: string;
  };

  detailPenjualans: {
    jumlah: number;
    subtotal: number;
    barang: {
      nama_barang: string;
      harga_jual: number;
    };
  }[];
}

function formatRupiah(n?: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export default function NotaPenjualanPage() {
  const params = useParams();
  const id = params.id;

  const [data, setData] = useState<NotaPenjualan | null>(null);

  useEffect(() => {
    fetch(`/api/nota/penjualan/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat nota...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-xl mx-auto border border-black p-6">
        <div className="text-center border-b border-black pb-4 mb-5">
          <h1 className="text-2xl font-bold">VENUS COMPUTER</h1>
          <p className="text-sm">Toko & Service Elektronik</p>
          <p className="text-xs mt-1">Nota Penjualan Barang</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-5">
          <div>
            <p>
              <strong>No Nota:</strong> PJL-{data.id}
            </p>
            <p>
              <strong>Tanggal:</strong> {data.tanggal}
            </p>
          </div>

          <div className="text-right">
            <p>
              <strong>Kasir:</strong> {data.user?.username || "-"}
            </p>
          </div>
        </div>

        <table className="w-full border border-black text-sm mb-5">
          <thead>
            <tr className="border-b border-black">
              <th className="p-2 text-left">Barang</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-right">Subtotal</th>
            </tr>
          </thead>

          <tbody>
            {data.detailPenjualans?.map((item, i) => (
              <tr key={i} className="border-b border-black">
                <td className="p-2">{item.barang.nama_barang}</td>
                <td className="p-2 text-center">{item.jumlah}</td>
                <td className="p-2 text-right">
                  {formatRupiah(item.subtotal)}
                </td>
              </tr>
            ))}

            <tr>
              <td colSpan={2} className="p-2 font-bold text-right">
                Total
              </td>
              <td className="p-2 font-bold text-right">
                {formatRupiah(data.total)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between text-sm mt-10">
          <div>
            <p>Terima kasih telah berbelanja.</p>
          </div>

          <div className="text-center">
            <p>Hormat Kami</p>
            <div className="h-16"></div>
            <p className="font-semibold">Venus Computer</p>
          </div>
        </div>
      </div>
    </div>
  );
}