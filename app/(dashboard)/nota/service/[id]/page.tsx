"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface NotaService {
  id: number;
  tanggal: string;
  biaya_service: number;
  total: number;

  user?: {
    username: string;
  };

  service: {
    jenis_barang: string;
    keluhan: string;

    customer: {
      nama: string;
      no_hp: string;
    };
  };
}

function formatRupiah(n?: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export default function NotaServicePage() {
  const params = useParams();
  const id = params.id;

  const [data, setData] = useState<NotaService | null>(null);

  useEffect(() => {
    fetch(`/api/nota/service/${id}`)
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
        {/* Header */}
        <div className="text-center border-b border-black pb-4 mb-5">
          <h1 className="text-2xl font-bold">VENUS COMPUTER</h1>
          <p className="text-sm">
            Toko & Service Elektronik
          </p>
          <p className="text-xs mt-1">
            Nota Service
          </p>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-5">
          <div>
            <p><strong>No Nota:</strong> SRV-{data.id}</p>
            <p><strong>Tanggal:</strong> {data.tanggal}</p>
          </div>

          <div className="text-right">
            <p><strong>Kasir:</strong> {data.user?.username || "-"}</p>
          </div>
        </div>

        {/* Customer */}
        <div className="border border-black p-3 mb-5 text-sm">
         <p><strong>Customer:</strong> {data.service?.customer?.nama || "-"}</p>
         <p><strong>No HP:</strong> {data.service?.customer?.no_hp || "-"}</p>
        </div>

        {/* Detail */}
        <table className="w-full border border-black text-sm mb-5">
          <tbody>
            <tr className="border-b border-black">
              <td className="p-2 font-semibold w-40">
                Jenis Barang
              </td>
              <td className="p-2">
                {data.service?.jenis_barang || "-"}
              </td>
            </tr>

            <tr className="border-b border-black">
              <td className="p-2 font-semibold">
                Keluhan
              </td>
              <td className="p-2">
                {data.service?.keluhan || "-"}
              </td>
            </tr>

            <tr>
              <td className="p-2 font-semibold">
                Biaya Service
              </td>
              <td className="p-2">
                {formatRupiah(data.total)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between text-sm mt-10">
          <div>
            <p>Terima kasih telah menggunakan jasa kami.</p>
          </div>

          <div className="text-center">
            <p>Hormat Kami</p>

            <div className="h-16"></div>

            <p className="font-semibold">
              Venus Computer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}