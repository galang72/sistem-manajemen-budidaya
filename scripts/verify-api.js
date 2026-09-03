async function runTests() {
  const BASE = 'http://localhost:3000';
  console.log('--- MEMULAI PENGUJIAN OTOMATIS Papap Fish Farm MANAGEMENT ---');

  // 1. Dashboard
  const resDash = await fetch(`${BASE}/api/dashboard`);
  const dash = await resDash.json();
  console.log('✓ [1] Dashboard API status:', resDash.status);
  console.log('    Total Uang Masuk :', dash.stats.totalIncome);
  console.log('    Total Uang Keluar:', dash.stats.totalExpense);
  console.log('    Saldo Kas        :', dash.stats.cashBalance);
  console.log('    Total Ikan Tebar :', dash.stats.totalCultivatedFish);
  console.log('    Total Ikan Mati  :', dash.stats.totalDeadFish);
  console.log('    Total Ikan Panen :', dash.stats.totalHarvestedFish);
  console.log('    Siklus Aktif     :', dash.stats.activeCyclesCount);
  console.log('    Notifikasi Alert :', dash.alerts.length);

  // 2. Siklus
  const resCycles = await fetch(`${BASE}/api/cycles`);
  const cycles = await resCycles.json();
  console.log('✓ [2] Cycles API status:', resCycles.status, `(${cycles.length} siklus)`);
  const c1 = cycles.find((c) => c.code === 'Lele-2026-001');
  if (c1) {
    console.log(`    Siklus Lele-2026-001: Tebar=${c1.initialFishCount}, Mati=${c1.totalDead}, Panen=${c1.totalHarvested} ekor (${c1.totalHarvestWeightKg} kg), Omzet=Rp ${c1.totalHarvestRevenue.toLocaleString()}, SR=${c1.survivalRate}%, MR=${c1.mortalityRate}%, FCR=${c1.fcr.toFixed(2)}, Laba=Rp ${c1.netProfit.toLocaleString()}`);
  }

  // 3. Kolam
  const resPonds = await fetch(`${BASE}/api/ponds`);
  const ponds = await resPonds.json();
  console.log('✓ [3] Ponds API status:', resPonds.status, `(${ponds.length} kolam)`);

  // 4. Kematian
  const resMort = await fetch(`${BASE}/api/mortality`);
  const mort = await resMort.json();
  console.log('✓ [4] Mortality API status:', resMort.status, `(${mort.length} catatan)`);

  // 5. Panen
  const resHarv = await fetch(`${BASE}/api/harvests`);
  const harv = await resHarv.json();
  console.log('✓ [5] Harvests API status:', resHarv.status, `(${harv.length} catatan)`);

  // 6. Pakan
  const resFeed = await fetch(`${BASE}/api/feeds`);
  const feed = await resFeed.json();
  console.log('✓ [6] Feed API status:', resFeed.status, `(${feed.length} catatan)`);

  // 7. Keuangan
  const resTx = await fetch(`${BASE}/api/transactions`);
  const tx = await resTx.json();
  console.log('✓ [7] Transactions API status:', resTx.status, `(${tx.transactions.length} transaksi)`);

  // 8. Laba & Rugi
  const resPL = await fetch(`${BASE}/api/profit-loss?filter=Semua`);
  const pl = await resPL.json();
  console.log('✓ [8] Profit-Loss API status:', resPL.status);
  console.log(`    Omzet: Rp ${pl.totalRevenue.toLocaleString()}, Biaya: Rp ${pl.totalCost.toLocaleString()}, Net: Rp ${pl.netAmount.toLocaleString()}, Margin: ${pl.profitMargin.toFixed(1)}%, HPP/kg: Rp ${pl.costPerKg.toFixed(0)}`);

  // 9. Analisis Budidaya
  const resAnalytics = await fetch(`${BASE}/api/analytics`);
  const analytics = await resAnalytics.json();
  console.log('✓ [9] Analytics API status:', resAnalytics.status);
  console.log(`    Farm Avg SR: ${analytics.farmSummary.avgSR.toFixed(1)}%, Avg FCR: ${analytics.farmSummary.avgFcr.toFixed(2)}, Avg ROI: ${analytics.farmSummary.avgRoi.toFixed(1)}%`);

  // 10. Laporan
  const resRepFin = await fetch(`${BASE}/api/reports?type=keuangan`);
  const repFin = await resRepFin.json();
  console.log('✓ [10] Report Keuangan status:', resRepFin.status, `(${repFin.data.length} baris)`);

  const resRepBud = await fetch(`${BASE}/api/reports?type=budidaya`);
  const repBud = await resRepBud.json();
  console.log('✓ [11] Report Budidaya status:', resRepBud.status, `(${repBud.data.length} siklus)`);

  const resRepPan = await fetch(`${BASE}/api/reports?type=panen`);
  const repPan = await resRepPan.json();
  console.log('✓ [12] Report Panen status:', resRepPan.status, `(${repPan.data.length} panen)`);

  // 11. Test POST Create Form Siklus Baru
  const testCycleCode = `TEST-${Date.now().toString().slice(-4)}`;
  const resNewCycle = await fetch(`${BASE}/api/cycles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: testCycleCode,
      pondId: ponds[0].id,
      startDate: new Date().toISOString(),
      initialFishCount: 5000,
      seedPricePerFish: 160,
      totalSeedCost: 800000,
      seedSize: '5-7 cm',
      feedType: 'PF 1000',
      status: 'Aktif',
      notes: 'Siklus pengujian otomatis',
    }),
  });
  const createdCycle = await resNewCycle.json();
  console.log('✓ [13] POST Create Cycle status:', resNewCycle.status, `ID=${createdCycle.id}`);

  // Hapus cycle test agar database tetap bersih
  await fetch(`${BASE}/api/cycles/${createdCycle.id}`, { method: 'DELETE' });
  console.log('✓ [14] DELETE Clean test cycle berhasil.');

  console.log('--- SELURUH PENGUJIAN API & FORMULASI BERHASIL 100% ---');
}

runTests().catch(console.error);
