export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty: 'mudah' | 'menengah' | 'sulit' | 'pro';
}

// Bank Pertanyaan
export const quizQuestions: Question[] = [
  {
    question: 'Apa arti dari rambu ini? (Segi delapan merah polos dengan tulisan "STOP")',
     options: ['Beri Jalan', 'Berhenti', 'Dilarang Masuk', 'Hati-hati'],
    correctAnswerIndex: 1,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga sama sisi terbalik dengan bingkai merah)',
     options: ['Berhenti', 'Jalan Menurun', 'Beri Jalan (Yield)', 'Bahaya'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan batang putih horizontal di tengah)',
     options: ['Dilarang Masuk', 'Satu Arah', 'Jalan Buntu', 'Dilarang Parkir'],
    correctAnswerIndex: 0,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan panah putih menunjuk lurus ke depan)',
     options: ['Wajib Lurus', 'Satu Arah', 'Dilarang Belok', 'Jalan Utama'],
    correctAnswerIndex: 0,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan panah putih melengkung ke kiri)',
     options: ['Tikungan ke Kiri', 'Dilarang Belok Kiri', 'Wajib Belok Kiri', 'Bundaran'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan angka "50" di tengah)',
     options: ['Kecepatan Minimum 50 km/j', 'Jarak Minimum 50m', 'Hanya untuk Kendaraan 50 ton', 'Batas Kecepatan Maksimum 50 km/j'],
    correctAnswerIndex: 3,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan 3 panah putih membentuk lingkaran)',
     options: ['Wajib Putar Balik', 'Hati-hati Bundaran', 'Wajib Mengikuti Bundaran', 'Dilarang Masuk Bundaran'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar sepeda motor dicoret)',
     options: ['Dilarang Parkir Motor', 'Jalur Khusus Motor', 'Dilarang Masuk Sepeda Motor', 'Hati-hati Ada Motor'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan panah belok kiri dicoret)',
     options: ['Wajib Belok Kiri', 'Boleh Belok Kiri', 'Dilarang Belok Kiri', 'Wajib Lurus'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan panah putar balik (U-turn) dicoret)',
     options: ['Dilarang Putar Balik', 'Wajib Putar Balik', 'Boleh Putar Balik', 'Perintah Belok Kanan'],
    correctAnswerIndex: 0,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar orang berjalan di zebra cross)',
     options: ['Jalur Pejalan Kaki', 'Peringatan Penyeberangan Pejalan Kaki', 'Dilarang Berjalan Kaki', 'Taman'],
    correctAnswerIndex: 1,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar anak-anak berlari)',
     options: ['Taman Bermain', 'Perintah Pelan-pelan', 'Zona Sekolah / Hati-hati Banyak Anak', 'Dilarang Masuk Anak-anak'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan tanda seru "!")',
     options: ['Jalan Rusak', 'Hati-hati', 'Bahaya Lain yang Tidak Disebutkan', 'Berhenti'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar mobil selip)',
     options: ['Jalan Licin', 'Dilarang nge-Drift', 'Area Balap', 'Wajib Ganti Ban'],
    correctAnswerIndex: 0,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar lampu lalu lintas)',
     options: ['Peringatan Ada Lampu Lalu Lintas', 'Lampu Lalu Lintas Rusak', 'Wajib Ikuti Lampu', 'Akhir Zona Lampu'],
    correctAnswerIndex: 0,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan latar, dibagi dua, satu sisi biru polos, sisi lain "P" dicoret)',
     options: ['Boleh Parkir Setengah', 'Dilarang Parkir', 'Dilarang Berhenti', 'Hanya Parkir di Sisi Tertentu'],
    correctAnswerIndex: 1,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan tanda silang "X" merah)',
     options: ['Dilarang Masuk', 'Dilarang Parkir', 'Dilarang Berhenti (Stopping/Standing)', 'Perlintasan Kereta Api'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi biru dengan huruf "P" putih)',
     options: ['Prioritas', 'Peringatan', 'Area Parkir', 'Polisi'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi biru dengan huruf "H" putih)',
     options: ['Hotel', 'Halte Bus', 'Rumah Sakit (Hospital)', 'Hati-hati'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan panah melengkung ke kiri)',
     options: ['Wajib Belok Kiri', 'Dilarang Belok Kiri', 'Tikungan Tajam ke Kiri', 'Bundaran'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan panah berbentuk "S" vertikal)',
     options: ['Jalan Berkelok-kelok / Tikungan Ganda', 'Jalan Licin', 'Wajib Zig-zag', 'Dilarang Mendahului'],
    correctAnswerIndex: 0,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan dua garis vertikal yang menyempit)',
     options: ['Jembatan', 'Jalan Menyempit', 'Satu Arah', 'Akhir Jalan Tol'],
    correctAnswerIndex: 1,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan gambar pejalan kaki putih)',
     options: ['Peringatan Pejalan Kaki', 'Jalur Wajib Pejalan Kaki', 'Dilarang Berjalan Kaki', 'Area Penyeberangan'],
    correctAnswerIndex: 1,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan gambar sepeda putih)',
     options: ['Dilarang Bersepeda', 'Waspada Sepeda', 'Toko Sepeda', 'Jalur Wajib Sepeda'],
    correctAnswerIndex: 3,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan dua mobil berdampingan, mobil kiri merah, mobil kanan hitam)',
     options: ['Dilarang Mendahului', 'Dua Jalur', 'Area Balap', 'Wajib Jaga Jarak'],
    correctAnswerIndex: 0,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi biru dengan gambar mobil dan jembatan layang putih)',
     options: ['Peringatan Jembatan', 'Jalan Tol (Motorway)', 'Jalan Layang', 'Area Parkir Mobil'],
    correctAnswerIndex: 1,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar kereta api uap)',
     options: ['Stasiun Kereta', 'Museum Kereta', 'Perlintasan Kereta Api (Tidak Berpalang Pintu)', 'Waspada Polusi'],
    correctAnswerIndex: 2,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar pagar)',
     options: ['Perlintasan Kereta Api (Berpalang Pintu)', 'Peternakan', 'Jalan Buntu', 'Area Terlarang'],
    correctAnswerIndex: 0,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar mobil menanjak dan "10%") ',
     options: ['Jalan Menurun 10%', 'Jalan Menanjak Curam (10% gradient)', 'Kecepatan Maksimum 10 km/j', 'Hanya untuk 4x4'],
    correctAnswerIndex: 1,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar mobil menurun dan "10%") ',
     options: ['Jalan Menurun Curam (10% gradient)', 'Jalan Menanjak 10%', 'Wajib Rem Tangan', 'Batas Beban 10 ton'],
    correctAnswerIndex: 0,
    difficulty: 'mudah'
  },
  {
    question: 'Apa arti dari rambu ini? (Belah ketupat kuning dengan bingkai putih)',
     options: ['Peringatan', 'Jalan Licin', 'Jalan Utama (Anda Memiliki Prioritas)', 'Berhenti'],
    correctAnswerIndex: 2,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Belah ketupat kuning dengan garis hitam diagonal melintang)',
     options: ['Prioritas Berakhir', 'Jalan Rusak', 'Dilarang Masuk', 'Perempatan'],
    correctAnswerIndex: 0,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran putih dengan garis hitam diagonal, dengan angka "50" abu-abu)',
     options: ['Akhir Batas Kecepatan 50 km/j', 'Kecepatan Minimum 50 km/j', 'Zona 50 Menit', 'Batas Kecepatan 50 km/j di Malam Hari'],
    correctAnswerIndex: 0,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran putih dengan garis hitam diagonal, dengan gambar 2 mobil abu-abu)',
     options: ['Boleh Mendahului', 'Akhir Larangan Mendahului', 'Jaga Jarak', 'Zona Mobil Ganda'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan angka "30" putih)',
     options: ['Batas Kecepatan Maksimum 30 km/j', 'Kecepatan Minimum Wajib 30 km/j', '30 Menit Parkir', 'Keluar di Exit 30'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan angka "30" putih, dicoret garis merah)',
     options: ['Akhir Batas Kecepatan 30 km/j', 'Dilarang Berkendara 30 km/j', 'Akhir Kecepatan Minimum Wajib 30 km/j', 'Bukan Exit 30'],
    correctAnswerIndex: 2,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar truk merah di kiri dan mobil hitam di kanan)',
     options: ['Dilarang Mendahului untuk Truk', 'Truk Wajib Kiri', 'Dilarang Masuk Truk', 'Area Timbangan Truk'],
    correctAnswerIndex: 0,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar truk di tengah)',
     options: ['Area Truk', 'Parkir Truk', 'Dilarang Masuk untuk Kendaraan Barang (Truk)', 'Hati-hati Truk'],
    correctAnswerIndex: 2,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi biru dengan panah putih ke atas dan panah merah ke bawah)',
     options: ['Lalu Lintas Dua Arah', 'Beri Jalan pada Lawan', 'Prioritas atas Lalu Lintas dari Arah Berlawanan', 'Wajib Lurus'],
    correctAnswerIndex: 2,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan panah hitam ke atas dan panah merah ke bawah)',
     options: ['Dilarang Dua Arah', 'Wajib Beri Jalan pada Lalu Lintas dari Arah Berlawanan', 'Prioritas atas Lawan', 'Dilarang Mendahului'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar rusa)',
     options: ['Kebun Binatang', 'Area Berburu', 'Peringatan Hewan Liar Melintas', 'Dilarang Membawa Hewan'],
    correctAnswerIndex: 2,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar sapi)',
     options: ['Jual Sapi', 'Peringatan Hewan Ternak Melintas', 'Dilarang Membawa Ternak', 'Restoran Steak'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar dua gundukan)',
     options: ['Pegunungan', 'Peringatan Jalan Tidak Rata / Bergelombang', 'Polisi Tidur', 'Area Off-road'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar tumpukan batu jatuh)',
     options: ['Area Tambang', 'Peringatan Batu Berjatuhan (Longsor)', 'Jalan Buntu', 'Pekerjaan Konstruksi'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan dua panah berlawanan arah vertikal)',
     options: ['Satu Arah', 'Boleh Putar Balik', 'Peringatan Lalu Lintas Dua Arah (Setelah Satu Arah)', 'Wajib Pilih Jalur'],
    correctAnswerIndex: 2,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan gambar ban mobil dan rantai)',
     options: ['Wajib Menggunakan Rantai Salju', 'Toko Ban', 'Jalan Licin', 'Dilarang Pakai Rantai'],
    correctAnswerIndex: 0,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar klakson dicoret)',
     options: ['Dilarang Membunyikan Klakson', 'Area Bising', 'Toko Musik', 'Wajib Bunyikan Klakson'],
    correctAnswerIndex: 0,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi biru dengan huruf "T" putih terbalik dan bagian atasnya merah)',
     options: ['Palang Kereta', 'Jalan Buntu (Cul-de-sac)', 'Wajib Belok', 'Perempatan'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar orang membawa sekop)',
     options: ['Area Pemakaman', 'Hati-hati Ada Pekerjaan di Jalan', 'Toko Alat', 'Wajib Berhenti'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Papan persegi panjang putih dengan 3 garis merah miring ke kanan)',
     options: ['Peringatan Belokan 3x', 'Tanda Peringatan Jarak 300m ke Perlintasan Kereta Api', 'Jalan Berbahaya 3km', 'Tiga Jalur'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Papan persegi panjang putih dengan 1 garis merah miring ke kanan)',
     options: ['Satu Jalur', 'Tanda Peringatan Jarak 100m ke Perlintasan Kereta Api', 'Dilarang Masuk', 'Batas 1 Ton'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan tulisan "70m" di antara dua mobil)',
     options: ['Jarak Minimum Wajib Antar Kendaraan 70m', 'Kecepatan Maksimum 70 km/j', 'Panjang Kendaraan Maksimum 70m', 'Keluar 70m lagi'],
    correctAnswerIndex: 0,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar mobil di tengah)',
     options: ['Dilarang Masuk untuk Semua Kendaraan Bermotor (kecuali motor roda dua)', 'Wajib Mobil', 'Parkir Mobil', 'Dealer Mobil'],
    correctAnswerIndex: 0,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar pejalan kaki dicoret)',
     options: ['Dilarang Menyeberang', 'Dilarang Masuk bagi Pejalan Kaki', 'Akhir Jalur Pejalan Kaki', 'Wajib Lari'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar pesawat terbang)',
     options: ['Bandara', 'Peringatan Pesawat Terbang Rendah', 'Museum Dirgantara', 'Dilarang Menerbangkan Drone'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar "windsock" / kantong angin)',
     options: ['Area Berangin', 'Peringatan Angin Kencang dari Samping', 'Pabrik Tekstil', 'Pantai'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar 3 mobil berurutan)',
     options: ['Wajib Jaga Jarak', 'Peringatan Kemungkinan Macet', 'Dilarang Konvoi', 'Dealer Mobil Bekas'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi panjang biru dengan gambar rambu batas kecepatan "30" dan tulisan "ZONE")',
     options: ['Awal Zona dengan Batas Kecepatan 30 km/j', 'Hanya 30 Menit Parkir', 'Akhir Zona 30 km/j', 'Hanya Berlaku 30 Meter'],
    correctAnswerIndex: 0,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi panjang putih dengan rambu "30" abu-abu dicoret dan "ZONE" abu-abu)',
     options: ['Batas Kecepatan 30 km/j Dibatalkan', 'Masuk Zona 30 km/j', 'Akhir Zona dengan Batas Kecepatan 30 km/j', 'Zona Dilarang Masuk'],
    correctAnswerIndex: 2,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Rambu persegi biru dengan gambar mobil, rumah, orang bermain)',
     options: ['Taman Bermain', 'Awal Zona Perumahan (Wohngebiet/Home Zone)', 'Area Piknik', 'Sekolah'],
    correctAnswerIndex: 1,
    difficulty: 'menengah'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran putih polos dengan satu garis hitam diagonal tebal)',
     options: ['Dilarang Masuk', 'Satu Arah', 'Akhir dari Semua Larangan Lokal (End of all restrictions)', 'Jalan Rusak'],
    correctAnswerIndex: 2,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru, garis diagonal merah, dengan angka romawi "I" di tengah)',
     options: ['Parkir 1 Jam', 'Dilarang Parkir pada Tanggal Ganjil', 'Dilarang Parkir pada Hari Senin', 'Hanya untuk 1 Orang'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru, garis diagonal merah, dengan angka romawi "II" di tengah)',
     options: ['Parkir 2 Jam', 'Dilarang Parkir pada Tanggal Genap', 'Dilarang Parkir pada Hari Selasa', 'Hanya untuk 2 Orang'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan tulisan "5.5t" di tengah)',
     options: ['Kecepatan Maks 5.5 km/j', 'Batas Berat Kendaraan Maksimum 5.5 Ton', 'Batas Tinggi 5.5m', 'Jarak 5.5km'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan "3.5m" dan dua panah vertikal di atas dan bawah)',
     options: ['Batas Lebar 3.5m', 'Batas Panjang 3.5m', 'Batas Tinggi Kendaraan Maksimum 3.5m', 'Jarak Minimum 3.5m'],
    correctAnswerIndex: 2,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan "2m" dan dua panah horizontal di kiri dan kanan)',
     options: ['Batas Lebar Kendaraan Maksimum 2m', 'Batas Tinggi 2m', 'Jarak Minimum 2m', 'Parkir 2m dari Rambu'],
    correctAnswerIndex: 0,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar truk dan "10m")',
     options: ['Dilarang Masuk Truk 10 Ton', 'Parkir Truk 10 Menit', 'Batas Panjang Kendaraan Maksimum 10m', 'Jarak Minimum Antar Truk 10m'],
    correctAnswerIndex: 2,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar mobil oranye meledak)',
     options: ['Area Konstruksi', 'Bahaya Kebakaran', 'Dilarang Masuk Kendaraan Pengangkut Bahan Berbahaya/Meledak', 'Dilarang Masuk Mobil Oranye'],
    correctAnswerIndex: 2,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar mobil dan tetesan air di bawahnya)',
     options: ['Cuci Mobil', 'Jalan Licin', 'Dilarang Masuk Kendaraan Pengangkut Bahan Pencemar Air', 'Jalan Banjir'],
    correctAnswerIndex: 2,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan gambar pejalan kaki dan sepeda, dipisah garis horizontal)',
     options: ['Pejalan Kaki dan Sepeda Dilarang', 'Jalur Terpisah untuk Pejalan Kaki dan Sepeda', 'Pilih Salah Satu', 'Hati-hati'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan gambar pejalan kaki dan sepeda, tidak dipisah garis)',
     options: ['Jalur Bersama (Shared Use) untuk Pejalan Kaki dan Sepeda', 'Jalur Terpisah', 'Pejalan Kaki Harus Menuntun Sepeda', 'Dilarang Masuk'],
    correctAnswerIndex: 0,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan gambar kuda dan penunggang)',
     options: ['Pacuan Kuda', 'Jalur Wajib Penunggang Kuda (Bridlepath)', 'Dilarang Masuk Kuda', 'Peringatan Kuda Liar'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi biru dengan gambar mobil di atas trotoar setengah)',
     options: ['Dilarang Parkir di Trotoar', 'Metode Parkir Wajib (Sebagian di Trotoar)', 'Area Pejalan Kaki', 'Bengkel Ban'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi biru dengan "P" dan gambar "Parking Disc" / Disk Parkir)',
     options: ['Parkir Bayar', 'Parkir Gratis', 'Parkir Wajib Menggunakan Disk Parkir (Waktu Terbatas)', 'Toko CD'],
    correctAnswerIndex: 2,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi biru dengan gambar terowongan)',
     options: ['Awal Terowongan', 'Akhir Terowongan', 'Peringatan Jembatan', 'Jalan Bawah Tanah'],
    correctAnswerIndex: 0,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Rambu "Awal Terowongan" dicoret garis merah)',
     options: ['Dilarang Masuk Terowongan', 'Terowongan Ditutup', 'Akhir Terowongan', 'Hati-hati'],
    correctAnswerIndex: 2,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Rambu "Jalan Tol" dicoret garis merah)',
     options: ['Dilarang Masuk Tol', 'Akhir Jalan Tol', 'Jalan Tol Gratis', 'Jalan Tol Rusak'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Rambu "Awal Zona Perumahan" dicoret garis abu-abu)',
     options: ['Akhir Zona Perumahan', 'Dilarang Masuk Perumahan', 'Perumahan Sedang Dibangun', 'Jalan Buntu'],
    correctAnswerIndex: 0,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar moped / motor bebek)',
     options: ['Dilarang Masuk Sepeda Motor', 'Dilarang Masuk Moped (Sepeda Motor Kecil)', 'Parkir Moped', 'Jalur Moped'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar mobil jatuh ke air)',
     options: ['Jalan Licin', 'Peringatan Tepi Perairan (Dermaga, Sungai, dll)', 'Jembatan Rusak', 'Area Memancing'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar trem/kereta listrik dari depan)',
     options: ['Stasiun', 'Peringatan Perlintasan Trem', 'Museum', 'Dilarang Masuk Trem'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan gambar jembatan angkat)',
     options: ['Jembatan Runtuh', 'Peringatan Jembatan Angkat', 'Jalan Buntu', 'Ketinggian Maksimum'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran biru dengan panah putih menunjuk ke kanan bawah secara diagonal)',
     options: ['Jalan Menurun', 'Wajib Berpindah ke Kanan', 'Wajib Melewati Rambu di Sebelah Kanan', 'Tikungan Tajam'],
    correctAnswerIndex: 2,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi biru dengan garis putih tebal di kiri dan garis tipis di kanan, panah menunjukkan mobil pindah dari kanan ke kiri)',
     options: ['Penyempitan Jalan', 'Pengurangan Lajur (Misal: 3 lajur menjadi 2)', 'Akhir Jalan Tol', 'Wajib Kiri'],
    correctAnswerIndex: 1,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah, latar putih, tanpa simbol di tengah)',
     options: ['Boleh Masuk', 'Berhenti', 'Jalan Buntu', 'Dilarang Masuk untuk Semua Kendaraan (di kedua arah)'],
    correctAnswerIndex: 3,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar traktor pertanian dicoret)',
     options: ['Dilarang Masuk Kendaraan Pertanian', 'Area Pertanian', 'Jalan Rusak', 'Dilarang Berisik'],
    correctAnswerIndex: 0,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran merah dengan gambar gerobak kuda dicoret)',
     options: ['Dilarang Masuk Kendaraan yang Ditarik Hewan', 'Dilarang Masuk Kuda', 'Pacuan Kuda', 'Area Pedesaan'],
    correctAnswerIndex: 0,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Persegi biru dengan panah putih melengkung ke kanan, menunjukkan putar balik)',
     options: ['Wajib Putar Balik', 'Dilarang Putar Balik', 'Tempat Diperbolehkan Putar Balik (U-turn)', 'Jalan Buntu'],
    correctAnswerIndex: 2,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Lingkaran putih dengan gambar "Dilarang Mendahului Truk" abu-abu, dicoret garis hitam)',
     options: ['Akhir Larangan Mendahului untuk Truk', 'Truk Boleh Mendahului', 'Akhir Semua Larangan', 'Awal Zona Truk'],
    correctAnswerIndex: 0,
    difficulty: 'sulit'
  },
  {
    question: 'Apa arti dari rambu ini? (Segitiga peringatan dengan simbol kepingan salju)',
     options: ['Toko Es Krim', 'AC Rusak', 'Peringatan Salju atau Es di Jalan', 'Wajib Rantai Salju'],
    correctAnswerIndex: 2,
    difficulty: 'sulit'
  }
];
