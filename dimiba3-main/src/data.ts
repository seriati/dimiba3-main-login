/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StoryChunk, QuizQuestion, VocabularyItem, StoreItem, GameLevel } from './types';

export const STORY_CHUNKS: StoryChunk[] = [
  {
    id: 1,
    title: "Masa Sebelum Uang: Kelahiran Barter",
    subtitle: "Kisah Ka Kancil & Dak Bebek",
    content: "Di Hutan Kelayau yang sejuk, hiduplah Ka Kancil 🦌 dan Dak Bebek 🦆. Ka Kancil baru saja menyisir kebunnya dan memanen banyak jagung kuning segar yang melimpah. Namun, dia kelaparan karena tidak punya sayur pendamping makan malamnya. Di seberang sungai, Dak Bebek memanen sekeranjang kangkung segar yang sangat hijau, tetapi dia bosan makan kangkung dan sangat mengidam-idamkan jagung bakar manis. Mereka berdua pun sepakat bertemu di tepi jembatan dan saling menukar jagung dengan kangkung secara langsung. Bertukar barang dengan barang lain langsung seperti ini dinamakan BARTER!",
    character: {
      name: "Ka Kancil 🦌",
      avatar: "🦌",
      role: "Petani Jagung Hutan",
      phrase: "Aha! Perutku kenyang makan jagung rebus dengan sayur kangkung berkat sistem tukar barang!"
    },
    graphicType: "barter_simple",
    miniQuestion: {
      q: "Jika kamu menukar buah apel milikmu dengan biskuit temanmu di kelas tanpa memakai uang sama sekali, cara ini dinamakan apa?",
      opts: ["Jual Beli", "Sewa Menyewa", "Sistem Barter"],
      ansIdx: 2,
      explanation: "Hebat! Barter adalah kegiatan tukar-menukar barang dengan barang lain secara langsung tanpa menggunakan perantara uang."
    }
  },
  {
    id: 2,
    title: "Masalah Barter: Bertepuk Sebelah Tangan",
    subtitle: "Keinginan Timbal Balik yang Cocok",
    content: "Suatu hari, Ela Pelatuk 🐦 mengukir sebuah sendok kayu yang sangat halus dan bernilai tinggi. Ela ingin sekali menukar sendok kayunya dengan bunga mawar merah yang harum milik Ke Kelinci 🐇 untuk menghias sarangnya. Namun, Ke Kelinci menolaknya dengan sedih: 'Aduh Ela, aku tidak butuh sendok kayu baru. Aku sangat lapar dan membutuhkan jagung manis!'. Ela Pelatuk menjadi kebingungan. Di sinilah terungkap kelemahan terbesar Barter: barter hanya bisa berjalan lancar bila terjadi keinginan timbal balik yang saling cocok. Bila kebutuhan salah satu pihak tidak terpenuhi, maka barter akan GAGAL!",
    character: {
      name: "Ela Pelatuk 🐦",
      avatar: "🐦",
      role: "Pengrajin Kayu Kelayau",
      phrase: "Hiks, sendok kayuku yang halus ini tidak bisa kuseberangkan untuk mendapatkan bunga mawar karena Ke Kelinci tidak membutuhkannya."
    },
    graphicType: "barter_mismatch",
    miniQuestion: {
      q: "Mengapa Ela Pelatuk gagal mendapatkan bunga mawar dari Ke Kelinci meskipun sendok kayunya sangat indah?",
      opts: [
        "Karena mawar Ke Kelinci layu",
        "Karena tidak ada kecocokan keinginan (Ke Kelinci tidak butuh sendok kayu)",
        "Karena Ela mematok harga uang terlalu tinggi"
      ],
      ansIdx: 1,
      explanation: "Luar biasa! Barter membutuhkan kecocokan keinginan ganda di mana kedua belah pihak sedang timbal balik membutuhkan barang satu sama lain."
    }
  },
  {
    id: 3,
    title: "Sejarah Lahirnya Uang: Dari Garam Hingga Logam",
    subtitle: "Mencari Alat Perantara yang Adil",
    content: "Karena barter terlalu sulit, para warga Hutan Kelayau berkumpul mencari solusi. Mereka menyepakati penggunaan perantara benda universal yang disukai semua warga, yang disebut Uang Barang (Commodity Money). Mereka sempat memakai garam bubuk, kerang berkilau dari pantai, bahkan gigi beruang! Namun, muncul kendala baru: garam akan meleleh saat kehujanan, dan cangkang kerang sangat rapuh dan mudah pecah. Akhirnya, mereka berinovasi menempa logam mulia seperti koin emas dan perak! Uang logam emas sangat awet, memiliki nilai tinggi yang diakui semua orang, tidak membusuk, dan mudah dibagikan tanpa mengurangi nilainya.",
    character: {
      name: "Ke Kelinci 🐇",
      avatar: "🐇",
      role: "Pemilik Kebun Bunga",
      phrase: "Betul sekali! Sekarang aku cukup menjual bungaku untuk mendapatkan keping emas, lalu emas ini langsung kupakai untuk membeli jagung manis!"
    },
    graphicType: "money_intro",
    miniQuestion: {
      q: "Mengapa bahan seperti garam tidak cocok digunakan sebagai mata uang tetap di masyarakat?",
      opts: [
        "Karena warnanya terlalu putih",
        "Karena garam tidak disukai oleh anak-anak kelinci",
        "Karena mudah rusak, mudah mencair saat kehujanan, dan susah disimpan lama"
      ],
      ansIdx: 2,
      explanation: "Tepat sekali! Syarat penting barang dapat dijadikan uang adalah harus tahan lama, tidak mudah rusak, dan nilainya stabil."
    }
  },
  {
    id: 4,
    title: "Mengenal Rupiah Lewat Kata & Angka",
    subtitle: "Format Konversi Dua Arah",
    content: "Di Hutan Kelayau, para sahabat belajar mengenal nilai rupiah dengan cara baru: mencocokkan angka dengan kalimat. Mereka mencoba membaca uang dalam bentuk angka dan menulisnya kembali menggunakan ejaan kata. Contohnya, frasa 'empat belas ribu tiga ratus rupiah' sama dengan Rp14.300,00. Dengan latihan seperti ini, mata dan telinga mereka semakin peka terhadap nilai uang dalam kehidupan sehari-hari.",
    character: {
      name: "Dak Bebek 🦆",
      avatar: "🦆",
      role: "Wirausahawan Kuliner Hutan",
      phrase: "Kwek! Sekarang aku bisa mencocokkan tulisan kalimat dengan angka uang, jadi belanja jadi lebih cepat dan tepat!"
    },
    graphicType: "money_features",
    miniQuestion: {
      q: "Pasangan yang benar antara tulisan kata dan nilai uang berikut adalah...",
      opts: [
        "Rp14.300,00 = empat belas ribu tiga ratus rupiah",
        "Rp13.400,00 = empat belas ribu tiga ratus rupiah",
        "Rp14.300,00 = empat belas ribu rupiah",
        "Rp14.030,00 = empat belas ribu tiga ratus rupiah"
      ],
      ansIdx: 0,
      explanation: "Benar! Nilai Rp14.300,00 dibaca sebagai empat belas ribu tiga ratus rupiah, jadi itu pasangan yang tepat."
    }
  }
];

export const QUIZ_DATA: QuizQuestion[] = [
  {
    id: 1,
    question: "Apa nama sistem tukar-menukar barang dengan barang secara langsung tanpa menggunakan uang?",
    options: ["Sistem Jual Beli", "Sistem Sewa", "Sistem Barter", "Sistem Kredit"],
    correctAnswer: 2,
    explanation: "Barter adalah cara bertukar barang dengan barang secara langsung yang dipakai manusia pada zaman dahulu sebelum uang ditemukan."
  },
  {
    id: 2,
    question: "Kelemahan terbesar sistem barter yang membuat manusia kesulitan berniaga adalah perlunya...",
    options: [
      "Izin tertulis dari kepala suku",
      "Kecocokan keinginan timbal balik",
      "Membawa timbangan batu yang berat",
      "Toko bertingkat yang megah"
    ],
    correctAnswer: 1,
    explanation: "Untuk barter, kamu harus mencari orang yang mempunyai barang yang kamu inginkan dan orang tersebut juga harus membutuhkan barang yang kamu tawarkan."
  },
  {
    id: 3,
    question: "Mengapa garam, kerang, atau teh tidak dilanjutkan lagi penggunaannya sebagai perantara uang barang?",
    options: [
      "Karena rasanya terlalu pahit dan asin",
      "Karena mudah rusak, membusuk, atau mencair sehingga tidak tahan lama",
      "Karena hewan-hewan takut memegangnya",
      "Karena dilarang oleh pemerintah kolonial hutan"
    ],
    correctAnswer: 1,
    explanation: "Uang barang seperti garam mudah mencair saat hujan, sedangkan kerang mudah pecah. Uang harus memenuhi syarat tahan lama dan stabil."
  },
  {
    id: 4,
    question: "Pernyataan di bawah ini yang paling tepat menggambarkan fungsi asli uang sebagai ALAT TUKAR adalah...",
    options: [
      "Made melihat boneka seharga Rp50.000,00 di pajangan toko",
      "Budi menyimpan uang sisa jajannya di dalam Celengan Beruang",
      "Siti memberikan uang Rp5.000,00 ke kasir untuk mendapatkan satu porsi es krim cokelat",
      "Dino menghitung total tabungannya setelah berumur satu tahun"
    ],
    correctAnswer: 2,
    explanation: "Saat Siti menyerahkan uang untuk ditukarkan dengan es krim, uang tersebut melakukan perannya sendiri secara langsung sebagai Alat Tukar."
  },
  {
    id: 5,
    question: "Mata uang resmi dan alat pembayaran yang sah secara hukum di Indonesia adalah...",
    options: ["Rupiah (Rp)", "Dollar ($)", "Yen (¥)", "Euro (€)"],
    correctAnswer: 0,
    explanation: "Berdasarkan Undang-Undang, mata uang resmi Republik Indonesia adalah Rupiah dengan kode internasional IDR."
  },
  {
    id: 6,
    question: "Uang kertas Rp10.000,00 dibaca dengan ejaan kalimat tulisan...",
    options: ["Seratus ribu rupiah", "Sepuluh ribu rupiah", "Satu juta rupiah", "Sepuluh rupiah saja"],
    correctAnswer: 1,
    explanation: "Nilai nominal Rp10.000,00 dibaca dan dieja dengan benar sebagai Sepuluh Ribu Rupiah."
  },
  {
    id: 7,
    question: "Andi membeli buku tulis seharga Rp6.500,00. Dia membayar dengan selembar uang Rp10.000,00. Berapa jumlah uang kembalian yang wajib Andi terima?",
    options: ["Rp2.500,00", "Rp3.500,00", "Rp4.500,00", "Rp1.500,00"],
    correctAnswer: 1,
    explanation: "Kembalian dihitung dengan mengurangkan uang bayar dengan harga barang: Rp10.000,00 - Rp6.500,00 = Rp3.500,00."
  }
];

export const VOCABULARY_LIST: VocabularyItem[] = [
  {
    word: "Barter",
    definition: "Kegiatan tukar-menukar barang dengan barang lain yang disepakati bersama secara langsung tanpa menggunakan perantara uang.",
    example: "Menukar 3 buah pisang matang dengan seikat sayur bayam segar tetangga sebelah rumah.",
    category: "Barter",
    iconName: "refresh-cw"
  },
  {
    word: "Keinginan Ganda Cocok",
    definition: "Keadaan ketika dua orang pelaku ekonomi saling membutuhkan barang yang dimiliki satu sama lain di waktu yang bersamaan.",
    example: "Kancil butuh kangkung dan punya jagung, bebek butuh jagung dan punya kangkung. Keduanya bisa langsung barter!",
    category: "Barter",
    iconName: "git-compare"
  },
  {
    word: "Diri Mali Ia Bajual",
    definition: "Motto transaksi kearifan lokal Dayak Kanayatn Kalimantan Timur/Barat yang mengajarkan kehangatan bertransaksi: 'Kita beli, dia jualan'. Melambangkan kejujuran timbal balik.",
    example: "Warga betang tersenyum ramah mendatangi lapak dan berucap, 'Diri Mali Ia Bajual' untuk bertukar rezeki secara asri.",
    category: "Barter",
    iconName: "wallet"
  },
  {
    word: "Rumah Betang",
    definition: "Rumah panggung tradisional suku Dayak yang sangat panjang dihuni puluhan keluarga. Pusat kehidupan sosial, seni, kearifan finansial kekeluargaan, dan gotong royong.",
    example: "Anak-anak belajar menabung koin di selasar Rumah Betang sambil mendengarkan dongeng kancil.",
    category: "Pelaku Ekonomi",
    iconName: "package"
  },
  {
    word: "Uang Barang",
    definition: "Benda bernilai guna umum yang disukai seluruh kelompok masyarakat dan pernah dipakai sebagai perantara bertukar sebelum adanya uang logam.",
    example: "Warga suku kuno menggunakan garam bubuk, cangkang kerang langka, atau daun teh kering.",
    category: "Nilai Uang",
    iconName: "package"
  },
  {
    word: "Uang Logam",
    definition: "Alat tukar resmi yang dicetak dari bahan logam mulia seperti emas, perak, tembaga, nikel, atau aluminium berkadar resmi.",
    example: "Koin Rp500,00 bermotif melati atau koin emas kuno di Hutan Kelayau.",
    category: "Nilai Uang",
    iconName: "coins"
  },
  {
    word: "Nominal",
    definition: "Angka nilai satuan moneter yang tertulis dan dicetak secara sah di permukaan uang kertas atau uang logam.",
    example: "Uang kertas Rp50.000,00 memiliki nilai nominal sebesar lima puluh ribu rupiah.",
    category: "Nilai Uang",
    iconName: "hash"
  },
  {
    word: "Mata Uang Rupiah",
    definition: "Simbol kedaulatan ekonomi Indonesia, sekaligus alat pembayaran sah yang wajib diterima untuk seluruh transaksi di Nusantara.",
    example: "Selembar uang Rp10.000,00 berwarna ungu bergambar pahlawan Frans Kaisiepo.",
    category: "Syarat Uang",
    iconName: "wallet"
  },
  {
    word: "Produsen",
    definition: "Orang atau badan usaha yang melakukan kegiatan menghasilkan barang atau jasa untuk dijual atau memenuhi kebutuhan konsumen.",
    example: "Ka Kancil menanam dan memanen buah jagung di kebunnya sendiri lalu menjualnya di pasar.",
    category: "Pelaku Ekonomi",
    iconName: "sprout"
  },
  {
    word: "Konsumen",
    definition: "Orang atau kelompok yang memakai, menghabiskan, atau mengonsumsi barang dan jasa untuk memenuhi kebutuhan hidup sehari-hari.",
    example: "Ke Kelinci membeli jagung Ka Kancil untuk dimasak dan dimakan bersama keluarga kelincinya.",
    category: "Pelaku Ekonomi",
    iconName: "shopping-bag"
  }
];

export const STORE_ITEMS: StoreItem[] = [
  { id: "kelakai", name: "🌿 Sayur pakis", price: 2000, icon: "🌿", color: "bg-emerald-50 border-emerald-300 text-emerald-800" },
  { id: "saong", name: "👒 Topi anyaman rotan", price: 3000, icon: "👒", color: "bg-yellow-50 border-yellow-300 text-yellow-800" },
  { id: "sawat", name: "🎒 Perhiasan manik-manik", price: 5000, icon: "🎒", color: "bg-pink-50 border-pink-300 text-pink-800" },
  { id: "lemang", name: "🪵 Pulut bambu", price: 1500, icon: "🪵", color: "bg-amber-100 border-amber-300 text-amber-900" },
  { id: "madu", name: "🧺 Nyiro'dari rotan", price: 8000, icon: "🍯", color: "bg-orange-100 border-orange-300 text-orange-900" },
  { id: "manik", name: "📿 Gelang manik motif enggang", price: 4000, icon: "📿", color: "bg-red-50 border-red-300 text-red-800" }
];

export const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    customerName: "Ka Kancil 🦌",
    customerAvatar: "🦌",
    boughtItem: STORE_ITEMS[0], // sayur kelakai
    quantity: 1,
    cashGiven: 5000,
    correctChange: 3000,
    hint: "Sayur Kelakai merah segar harganya Rp2.000. Ka Kancil membayar dengan uang Rp5.000. Berapa kembaliannya? Rp5.000 - Rp2.000 = ..."
  },
  {
    id: 2,
    customerName: "Dak Bebek 🦆",
    customerAvatar: "🦆",
    boughtItem: STORE_ITEMS[1], // topi saong
    quantity: 2,
    cashGiven: 10000,
    correctChange: 4000,
    hint: "Dak Bebek membeli 2 buah Topi Sa'ong Anyaman Dayak untuk berteduh di rawa (2 x Rp3.000 = Rp6.000). Dia membayar dengan selembar Rp10.000. Kembalian: Rp10.000 - Rp6.000 = ..."
  },
  {
    id: 3,
    customerName: "Ela Pelatuk 🐦",
    customerAvatar: "🐦",
    boughtItem: STORE_ITEMS[5], // gelang manik
    quantity: 1,
    cashGiven: 5000,
    correctChange: 1000,
    hint: "Ela Pelatuk membeli seutas Gelang Manik Enggang seharga Rp4.000. Dia membayarmu dengan Rp5.000. Hitung kembalian senilai seribu rupiah!"
  },
  {
    id: 4,
    customerName: "Ke Kelinci 🐇",
    customerAvatar: "🐇",
    boughtItem: STORE_ITEMS[4], // madu
    quantity: 1,
    cashGiven: 10000,
    correctChange: 2000,
    hint: "Ke Kelinci membeli Madu Karst Borneo seharga Rp8.000 untuk jamuan betang. Ke Kelinci memberi selembar uang Rp10.000. Berapa kembaliannya?"
  },
  {
    id: 5,
    customerName: "Pak Burung Hantu 🦉",
    customerAvatar: "🦉",
    boughtItem: STORE_ITEMS[2], // tas sawat manik
    quantity: 2,
    cashGiven: 20000,
    correctChange: 10000,
    hint: "Pak Hantu membeli 2 buah Tas Sawat Manik merah yang sangat anggun (2 x Rp5.000 = Rp10.000). Memberimu selembar Rp20.000. Kembaliannya adalah selembar sepuluh ribu rupiah."
  }
];
