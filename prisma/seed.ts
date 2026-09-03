import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Mengosongkan database lama jika ada...');
  await prisma.transaction.deleteMany({});
  await prisma.feedRecord.deleteMany({});
  await prisma.harvest.deleteMany({});
  await prisma.fishMortality.deleteMany({});
  await prisma.cultivationCycle.deleteMany({});
  await prisma.pond.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Membuat data User...');
  const user = await prisma.user.create({
    data: {
      email: 'admin@Papap Fish Farm.id',
      password: 'password123',
      name: 'Haji Anung Suryanto',
      farmName: 'Papap Fish Farm Sukses Makmur',
    },
  });

  console.log('Membuat data Kolam...');
  const pond1 = await prisma.pond.create({
    data: {
      userId: user.id,
      name: 'Kolam Terpal Persegi A1',
      size: '4m x 6m x 1m',
      capacity: 12000,
      type: 'Terpal Persegi',
      status: 'Digunakan',
      notes: 'Kolam utama pembesaran sistem konvensional aerasi kuat.',
    },
  });

  const pond2 = await prisma.pond.create({
    data: {
      userId: user.id,
      name: 'Kolam Bioflok D3-1',
      size: 'Diameter 3m x 1.2m',
      capacity: 5000,
      type: 'Bioflok',
      status: 'Digunakan',
      notes: 'Dilengkapi blower aerasi 100 watt dan pemanas otomatis.',
    },
  });

  const pond3 = await prisma.pond.create({
    data: {
      userId: user.id,
      name: 'Kolam Bioflok D3-2',
      size: 'Diameter 3m x 1.2m',
      capacity: 5000,
      type: 'Bioflok',
      status: 'Digunakan',
      notes: 'Sistem bioflok probiotik teratur.',
    },
  });

  const pond4 = await prisma.pond.create({
    data: {
      userId: user.id,
      name: 'Kolam Beton B1',
      size: '5m x 10m x 1.2m',
      capacity: 20000,
      type: 'Kolam Beton',
      status: 'Kosong',
      notes: 'Baru selesai dibersihkan dan dikeringkan.',
    },
  });

  const pond5 = await prisma.pond.create({
    data: {
      userId: user.id,
      name: 'Kolam Karantina P1',
      size: '2m x 3m x 0.8m',
      capacity: 2500,
      type: 'Terpal Persegi',
      status: 'Perawatan',
      notes: 'Sedang perbaikan pipa pembuangan (drainase).',
    },
  });

  console.log('Membuat data Siklus Budidaya...');
  // Siklus 1: SELESAI (Sesuai contoh user: Lele-2026-001)
  const cycle1 = await prisma.cultivationCycle.create({
    data: {
      userId: user.id,
      pondId: pond1.id,
      code: 'Lele-2026-001',
      startDate: new Date('2026-05-15T08:00:00Z'),
      harvestEstimateDate: new Date('2026-08-15T08:00:00Z'),
      endDate: new Date('2026-08-16T10:00:00Z'),
      initialFishCount: 10000,
      seedPricePerFish: 150,
      totalSeedCost: 1500000,
      seedSize: '5-7 cm',
      feedType: 'PF 1000 & 781-1',
      status: 'Selesai',
      notes: 'Siklus panen raya berhasil dengan tingkat kelangsungan hidup 95%.',
    },
  });

  // Siklus 2: AKTIF (Lele-2026-002 di Kolam Bioflok D3-1)
  const cycle2 = await prisma.cultivationCycle.create({
    data: {
      userId: user.id,
      pondId: pond2.id,
      code: 'Lele-2026-002',
      startDate: new Date('2026-07-20T08:00:00Z'),
      harvestEstimateDate: new Date('2026-10-15T08:00:00Z'),
      initialFishCount: 5000,
      seedPricePerFish: 175,
      totalSeedCost: 875000,
      seedSize: '6-8 cm',
      feedType: '781-1 & 781-2',
      status: 'Aktif',
      notes: 'Siklus bioflok berjalan bagus, nafsu makan ikan tinggi.',
    },
  });

  // Siklus 3: AKTIF (Lele-2026-003 di Kolam Bioflok D3-2)
  const cycle3 = await prisma.cultivationCycle.create({
    data: {
      userId: user.id,
      pondId: pond3.id,
      code: 'Lele-2026-003',
      startDate: new Date('2026-08-10T08:00:00Z'),
      harvestEstimateDate: new Date('2026-11-05T08:00:00Z'),
      initialFishCount: 5000,
      seedPricePerFish: 170,
      totalSeedCost: 850000,
      seedSize: '5-7 cm',
      feedType: 'PF 1000',
      status: 'Aktif',
      notes: 'Tahap adaptasi bibit baru masuk 25 hari.',
    },
  });

  console.log('Membuat data Kematian Ikan...');
  // Kematian Siklus 1 (Total 500)
  await prisma.fishMortality.createMany({
    data: [
      {
        cycleId: cycle1.id,
        pondId: pond1.id,
        date: new Date('2026-05-18T09:00:00Z'),
        count: 120,
        cause: 'Stres Perjalanan',
        notes: 'Hari ke-3 setelah tebar bibit, ada bibit lemah.',
      },
      {
        cycleId: cycle1.id,
        pondId: pond1.id,
        date: new Date('2026-06-05T09:00:00Z'),
        count: 150,
        cause: 'Kualitas Air',
        notes: 'Air drop setelah hujan deras beruntun, pH turun ke 5.8.',
      },
      {
        cycleId: cycle1.id,
        pondId: pond1.id,
        date: new Date('2026-06-25T09:00:00Z'),
        count: 130,
        cause: 'Kanibalisme',
        notes: 'Ukuran belum disortir sehingga ukuran besar memakan yang kecil.',
      },
      {
        cycleId: cycle1.id,
        pondId: pond1.id,
        date: new Date('2026-07-20T09:00:00Z'),
        count: 100,
        cause: 'Penyakit / Jamur',
        notes: 'Bercak putih di insang, segera diobati garam & probiotik.',
      },
    ],
  });

  // Kematian Siklus 2 (Total 110)
  await prisma.fishMortality.createMany({
    data: [
      {
        cycleId: cycle2.id,
        pondId: pond2.id,
        date: new Date('2026-07-23T09:00:00Z'),
        count: 45,
        cause: 'Stres Perjalanan',
        notes: 'Adaptasi awal kolam bioflok.',
      },
      {
        cycleId: cycle2.id,
        pondId: pond2.id,
        date: new Date('2026-08-15T09:00:00Z'),
        count: 65,
        cause: 'Suhu Ekstrem',
        notes: 'Perubahan suhu malam sangat dingin.',
      },
    ],
  });

  // Kematian Siklus 3 (Total 60)
  await prisma.fishMortality.createMany({
    data: [
      {
        cycleId: cycle3.id,
        pondId: pond3.id,
        date: new Date('2026-08-13T09:00:00Z'),
        count: 60,
        cause: 'Kualitas Air',
        notes: 'Endapan flok awal terlalu pekat.',
      },
    ],
  });

  console.log('Membuat data Panen...');
  // Panen Siklus 1 (Sesuai contoh user: 9.500 ekor, 950 kg, Rp 25.000/kg = Rp 23.750.000)
  await prisma.harvest.create({
    data: {
      cycleId: cycle1.id,
      pondId: pond1.id,
      date: new Date('2026-08-16T07:30:00Z'),
      fishCount: 9500,
      totalWeightKg: 950,
      pricePerKg: 25000,
      totalRevenue: 23750000,
      buyerName: 'Mas Bejo - Juragan Pecel Lele Jabodetabek',
      notes: 'Panen total kuras habis, kualitas ikan segar dan seragam (isi 10 ekor/kg).',
    },
  });

  console.log('Membuat data Pakan...');
  // Pakan Siklus 1 (Total 980 kg, biaya Rp 11.270.000)
  await prisma.feedRecord.createMany({
    data: [
      {
        cycleId: cycle1.id,
        date: new Date('2026-05-20T10:00:00Z'),
        feedType: 'PF 1000 (Matahari Sakti)',
        weightKg: 100,
        pricePerKg: 13000,
        totalCost: 1300000,
        notes: 'Pakan pembuka fase larva ke benih.',
      },
      {
        cycleId: cycle1.id,
        date: new Date('2026-06-10T10:00:00Z'),
        feedType: '781-1 (Hi-Pro-Vite)',
        weightKg: 350,
        pricePerKg: 11500,
        totalCost: 4025000,
        notes: 'Pertumbuhan cepat bulan pertama.',
      },
      {
        cycleId: cycle1.id,
        date: new Date('2026-07-05T10:00:00Z'),
        feedType: '781-2 (Hi-Pro-Vite)',
        weightKg: 400,
        pricePerKg: 11500,
        totalCost: 4600000,
        notes: 'Fase pembesaran utama.',
      },
      {
        cycleId: cycle1.id,
        date: new Date('2026-08-01T10:00:00Z'),
        feedType: '781 Polos (Finisher)',
        weightKg: 130,
        pricePerKg: 10500,
        totalCost: 1365000,
        notes: 'Pakan akhir sebelum panen.',
      },
    ],
  });

  // Pakan Siklus 2
  await prisma.feedRecord.createMany({
    data: [
      {
        cycleId: cycle2.id,
        date: new Date('2026-07-25T10:00:00Z'),
        feedType: 'PF 1000',
        weightKg: 80,
        pricePerKg: 13000,
        totalCost: 1040000,
        notes: 'Pakan awal tebar.',
      },
      {
        cycleId: cycle2.id,
        date: new Date('2026-08-15T10:00:00Z'),
        feedType: '781-1',
        weightKg: 240,
        pricePerKg: 11500,
        totalCost: 2760000,
        notes: 'Pakan lanjutan bulan ke-1.',
      },
    ],
  });

  // Pakan Siklus 3
  await prisma.feedRecord.createMany({
    data: [
      {
        cycleId: cycle3.id,
        date: new Date('2026-08-15T10:00:00Z'),
        feedType: 'PF 1000',
        weightKg: 100,
        pricePerKg: 13000,
        totalCost: 1300000,
        notes: 'Pakan masa adaptasi.',
      },
    ],
  });

  console.log('Membuat data Transaksi Keuangan...');
  await prisma.transaction.createMany({
    data: [
      // Pemasukan
      {
        userId: user.id,
        cycleId: cycle1.id,
        type: 'INCOME',
        category: 'Penjualan Ikan',
        source: 'Transfer Mas Bejo',
        amount: 23750000,
        date: new Date('2026-08-16T11:00:00Z'),
        notes: 'Pelunasan panen raya siklus Lele-2026-001 (950 kg @ Rp 25.000).',
      },
      {
        userId: user.id,
        cycleId: null,
        type: 'INCOME',
        category: 'Pendapatan Lainnya',
        source: 'Penjualan Pupuk Organik',
        amount: 850000,
        date: new Date('2026-08-20T14:00:00Z'),
        notes: 'Penjualan pupuk cair endapan bioflok ke kelompok tani.',
      },
      // Pengeluaran Siklus 1
      {
        userId: user.id,
        cycleId: cycle1.id,
        type: 'EXPENSE',
        category: 'Pembelian Bibit',
        source: 'Kas Tunai',
        amount: 1500000,
        date: new Date('2026-05-15T09:00:00Z'),
        notes: 'Beli 10.000 ekor bibit ukuran 5-7 cm @ Rp 150.',
      },
      {
        userId: user.id,
        cycleId: cycle1.id,
        type: 'EXPENSE',
        category: 'Pakan',
        source: 'Kas Usaha',
        amount: 11290000,
        date: new Date('2026-08-01T11:00:00Z'),
        notes: 'Total akumulasi pembelian pakan siklus 1.',
      },
      {
        userId: user.id,
        cycleId: cycle1.id,
        type: 'EXPENSE',
        category: 'Obat & Vitamin',
        source: 'Kas Tunai',
        amount: 500000,
        date: new Date('2026-06-12T10:00:00Z'),
        notes: 'Beli probiotik EM4 perikanan, garam krosok, dan molase.',
      },
      {
        userId: user.id,
        cycleId: cycle1.id,
        type: 'EXPENSE',
        category: 'Listrik & Air',
        source: 'Transfer Bank',
        amount: 350000,
        date: new Date('2026-07-05T15:00:00Z'),
        notes: 'Tagihan listrik pompa air dan aerator bulan Juni-Juli.',
      },
      {
        userId: user.id,
        cycleId: cycle1.id,
        type: 'EXPENSE',
        category: 'Tenaga Kerja',
        source: 'Kas Usaha',
        amount: 800000,
        date: new Date('2026-08-16T12:00:00Z'),
        notes: 'Upah borongan tenaga bantu panen dan kuras kolam.',
      },
      {
        userId: user.id,
        cycleId: cycle1.id,
        type: 'EXPENSE',
        category: 'Perawatan Kolam',
        source: 'Kas Tunai',
        amount: 200000,
        date: new Date('2026-05-10T14:00:00Z'),
        notes: 'Lem terpal dan kran pembuangan kolam A1.',
      },

      // Pengeluaran Siklus 2
      {
        userId: user.id,
        cycleId: cycle2.id,
        type: 'EXPENSE',
        category: 'Pembelian Bibit',
        source: 'Kas Tunai',
        amount: 875000,
        date: new Date('2026-07-20T09:00:00Z'),
        notes: 'Beli 5.000 bibit lele sangkuriang @ Rp 175.',
      },
      {
        userId: user.id,
        cycleId: cycle2.id,
        type: 'EXPENSE',
        category: 'Pakan',
        source: 'Kas Usaha',
        amount: 3800000,
        date: new Date('2026-08-15T11:00:00Z'),
        notes: 'Pakan pelet 781-1 untuk siklus 2.',
      },
      {
        userId: user.id,
        cycleId: cycle2.id,
        type: 'EXPENSE',
        category: 'Obat & Vitamin',
        source: 'Kas Tunai',
        amount: 250000,
        date: new Date('2026-08-05T10:00:00Z'),
        notes: 'Vitamin C perikanan dan probiotik lactobacillus.',
      },

      // Pengeluaran Siklus 3
      {
        userId: user.id,
        cycleId: cycle3.id,
        type: 'EXPENSE',
        category: 'Pembelian Bibit',
        source: 'Kas Tunai',
        amount: 850000,
        date: new Date('2026-08-10T09:00:00Z'),
        notes: 'Beli 5.000 bibit lele mutiara @ Rp 170.',
      },
      {
        userId: user.id,
        cycleId: cycle3.id,
        type: 'EXPENSE',
        category: 'Pakan',
        source: 'Kas Usaha',
        amount: 1300000,
        date: new Date('2026-08-15T10:00:00Z'),
        notes: 'Pakan bibit PF 1000 siklus 3.',
      },
      // Pengeluaran Operasional Umum
      {
        userId: user.id,
        cycleId: null,
        type: 'EXPENSE',
        category: 'Listrik & Air',
        source: 'Transfer Bank',
        amount: 300000,
        date: new Date('2026-08-30T10:00:00Z'),
        notes: 'Listrik operasional bulanan farm.',
      },
    ],
  });

  console.log('Seed database sukses selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
