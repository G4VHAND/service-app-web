import { z } from "zod";

export const userCreateSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "kasir"]),
});

export const customerSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  no_hp: z.string().min(8, "Nomor HP minimal 8 karakter"),
  alamat: z.string().min(3, "Alamat wajib diisi"),
});

export const barangSchema = z.object({
  nama_barang: z.string().min(2, "Nama barang wajib diisi"),
  stok: z.coerce.number().min(0, "Stok tidak boleh negatif"),
  harga: z.coerce.number().min(0, "Harga tidak boleh negatif"),
});

export const serviceSchema = z.object({
  customer_id: z.coerce.number().min(1, "Customer wajib dipilih"),
  tanggal_masuk: z.string().min(1, "Tanggal wajib diisi"),
  jenis_barang: z.string().min(2, "Jenis barang wajib diisi"),
  keluhan: z.string().min(2, "Keluhan wajib diisi"),
  status: z.enum(["Menunggu", "Proses", "Selesai"]),
});

export const transaksiServiceSchema = z.object({
  service_id: z.coerce.number().min(1, "Service wajib dipilih"),
  biaya_service: z.coerce.number().min(0, "Biaya service tidak boleh negatif"),
  total: z.coerce.number().min(0, "Total tidak boleh negatif"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Token tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const penjualanSchema = z.object({
  items: z.array(
    z.object({
      barang_id: z.coerce.number().min(1, "Barang wajib dipilih"),
      jumlah: z.coerce.number().min(1, "Jumlah minimal 1"),
      subtotal: z.coerce.number().min(0, "Subtotal tidak boleh negatif"),
    })
  ).min(1, "Keranjang kosong"),
});