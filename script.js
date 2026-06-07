// Mematangkan inisialisasi database lokal
document.addEventListener('DOMContentLoaded', function() {
    muatDataPelanggan();
    muatDataOdp();
    muatDataKomplain();
    updateDashboard();
    inisialisasiMenu(); 
    
    document.getElementById('pencarian').addEventListener('input', muatDataPelanggan);
    document.getElementById('filterStatus').addEventListener('change', muatDataPelanggan);
});

// === MENYALAKAN NAVIGASI MULTI-MENU ===
function inisialisasiMenu() {
    const semuaMenu = document.querySelectorAll('.nav-menu');
    const semuaKonten = document.querySelectorAll('.menu-content');

    semuaMenu.forEach(menu => {
        menu.addEventListener('click', function(e) {
            e.preventDefault();
            semuaMenu.forEach(m => m.classList.remove('active'));
            this.classList.add('active');

            const targetID = this.getAttribute('data-target');
            semuaKonten.forEach(konten => {
                konten.style.display = 'none';
            });
            document.getElementById(targetID).style.display = 'block';
        });
    });
}

// === REGISTRASI PELANGGAN & GENERATE RIWAYAT KAS ===
document.getElementById('wifiForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const nama = document.getElementById('nama').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const paket = document.getElementById('paket').value;

    const hariIni = new Date();
    const jatuhTempo = new Date();
    
    if (nama.toLowerCase().includes('isolir') || nama.toLowerCase().includes('mati')) {
        jatuhTempo.setDate(hariIni.getDate() - 2); 
    } else {
        jatuhTempo.setDate(hariIni.getDate() + 30); 
    }

    const formatTanggalDaftar = formatDate(hariIni);
    const formatTanggalTempo = formatDate(jatuhTempo);
    let harga = paket.includes("10 Mbps") ? 150000 : paket.includes("20 Mbps") ? 200000 : 350000;
    let status = hariIni > jatuhTempo ? "ISOLIR" : "AKTIF";

    const pelangganBaru = {
        id: Date.now(), nama, whatsapp, paket, tglDaftar: formatTanggalDaftar, tglTempo: formatTanggalTempo, status, harga
    };

    simpanKeLocalStorage(pelangganBaru);
    catatTransaksi(pelangganBaru); // Masuk laporan kas otomatis
    muatDataPelanggan(); 
    updateDashboard(); 

    document.getElementById('wifiForm').reset();
    alert(`Sukses mendatangkan pelanggan baru: ${nama}`);
});

// === LOGIKA TABEL & KEUANGAN ===
function tambahBarisKeTabel(pelanggan) {
    const tabel = document.getElementById('tabelPelanggan');
    const barisBaru = document.createElement('tr');
    barisBaru.setAttribute('data-id', pelanggan.id); 
    barisBaru.innerHTML = `
        <td><strong>${pelanggan.nama}</strong></td><td>${pelanggan.whatsapp}</td><td>${pelanggan.paket}</td>
        <td>${pelanggan.tglDaftar}</td><td>${pelanggan.tglTempo}</td><td><span class="badge ${pelanggan.status.toLowerCase()}">${pelanggan.status}</span></td>
        <td>
            <button class="btn-submit" style="padding:4px 8px; font-size:0.8rem; background:#38a169; width:auto;" onclick="cetakNota(${pelanggan.id})">🖨️ Cetak</button>
            <button class="btn-hapus" style="padding:4px 8px; font-size:0.8rem;" onclick="hapusPelanggan(${pelanggan.id})">Hapus</button>
        </td>
    `;
    tabel.appendChild(barisBaru);
}

function catatTransaksi(p) {
    let transaksi = JSON.parse(localStorage.getItem('wifi_transaksi')) || [];
    transaksi.push({ id: 'TRX-' + Date.now(), tanggal: p.tglDaftar, nama: p.nama, paket: p.paket, jumlah: p.harga });
    localStorage.setItem('wifi_transaksi', JSON.stringify(transaksi));
}

// === MEMUAT SEMUA JENIS DATA ===
function muatDataPelanggan() {
    let daftarPelanggan = JSON.parse(localStorage.getItem('wifi_pelanggan')) || [];
    let transaksi = JSON.parse(localStorage.getItem('wifi_transaksi')) || [];
    const kataKunci = document.getElementById('pencarian').value.toLowerCase();
    const statusTerpilih = document.getElementById('filterStatus').value;

    document.getElementById('tabelPelanggan').innerHTML = ""; 
    document.getElementById('tabelIsolir').innerHTML = ""; 
    document.getElementById('tabelTransaksi').innerHTML = ""; 

    daftarPelanggan.forEach(function(pelanggan) {
        if (pelanggan.nama.toLowerCase().includes(kataKunci) && (statusTerpilih === "SEMUA" || pelanggan.status === statusTerpilih)) {
            tambahBarisKeTabel(pelanggan);
        }
        if(pelanggan.status === "ISOLIR") {
            document.getElementById('tabelIsolir').innerHTML += `
                <tr><td><strong>${pelanggan.nama}</strong></td><td>${pelanggan.whatsapp}</td><td>${pelanggan.paket}</td><td>${pelanggan.tglTempo}</td>
                <td><span class="badge isolir">${pelanggan.status}</span></td>
                <td><button class="btn-submit" style="padding:5px 10px; background:#2b6cb0; font-size:0.8rem; width:auto;" onclick="kirimWA('${pelanggan.whatsapp}','${pelanggan.nama}','${pelanggan.tglTempo}')">💬 Tagih</button></td></tr>`;
        }
    });

    transaksi.forEach(t => {
        document.getElementById('tabelTransaksi').innerHTML += `<tr><td>${t.id}</td><td>${t.tanggal}</td><td><b>${t.nama}</b></td><td>${t.paket}</td><td>Rp ${t.jumlah.toLocaleString()}</td></tr>`;
    });
}

// === MANAGEMENT FITUR BARU: ODP & GANGGUAN ===
document.getElementById('odpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let odp = JSON.parse(localStorage.getItem('wifi_odp')) || [];
    odp.push({ nama: document.getElementById('namaOdp').value, kapasitas: document.getElementById('kapasitasOdp').value });
    localStorage.setItem('wifi_odp', JSON.stringify(odp));
    document.getElementById('odpForm').reset();
    muatDataOdp();
});

function muatDataOdp() {
    let odp = JSON.parse(localStorage.getItem('wifi_odp')) || [];
    document.getElementById('tabelOdp').innerHTML = "";
    odp.forEach(o => {
        document.getElementById('tabelOdp').innerHTML += `<tr><td>🟢 <b>${o.nama}</b></td><td>${o.kapasitas} Port</td><td><span style="color:#2b6cb0;">Ready (0/${o.kapasitas} Terpakai)</span></td></tr>`;
    });
}

document.getElementById('komplainForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let komplain = JSON.parse(localStorage.getItem('wifi_komplain')) || [];
    komplain.push({ tgl: formatDate(new Date()), nama: document.getElementById('pelangganKomplain').value, jenis: document.getElementById('jenisGangguan').value });
    localStorage.setItem('wifi_komplain', JSON.stringify(komplain));
    document.getElementById('komplainForm').reset();
    muatDataKomplain();
});

function muatDataKomplain() {
    let komplain = JSON.parse(localStorage.getItem('wifi_komplain')) || [];
    document.getElementById('tabelKomplain').innerHTML = "";
    komplain.forEach(k => {
        document.getElementById('tabelKomplain').innerHTML += `<tr><td>${k.tgl}</td><td><b>${k.nama}</b></td><td>⚠️ ${k.jenis}</td><td><span class="badge isolir" style="background:#feebc8; color:#c05621;">Proses Teknisi</span></td></tr>`;
    });
}

// === GENERATOR UTILITIES ===
function generateVoucher() {
    let karakter = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let hasil = '';
    for (let i = 0; i < 6; i++) hasil += karakter.charAt(Math.floor(Math.random() * karakter.length));
    document.getElementById('boxVoucher').innerText = "KODE: " + hasil;
}

function jalankanBroadcast() {
    let daftarPelanggan = JSON.parse(localStorage.getItem('wifi_pelanggan')) || [];
    let isolir = daftarPelanggan.filter(p => p.status === "ISOLIR");
    if(isolir.length === 0) return alert("Tidak ada data pelanggan terisolir untuk dikirimi broadcast.");
    alert(`Menjalankan jalur broadcast untuk ${isolir.length} kontak pelanggan terisolir.`);
    kirimWA(isolir[0].whatsapp, isolir[0].nama, isolir[0].tglTempo);
}

function kirimWA(nomor, nama, tempo) {
    if(nomor.startsWith('0')) nomor = '62' + nomor.slice(1);
    const pesan = `Peringatan WiFi-NET: Halo ${nama}, segera lakukan pembayaran tagihan bulanan Anda sebelum jatuh tempo pada ${tempo}.`;
    window.open(`https://api.whatsapp.com/send?phone=${nomor}&text=${encodeURIComponent(pesan)}`, '_blank');
}

function cetakNota(id) {
    let daftarPelanggan = JSON.parse(localStorage.getItem('wifi_pelanggan')) || [];
    const p = daftarPelanggan.find(item => item.id === id);
    
    if(!p) return alert("Data pelanggan tidak ditemukan!");

    const jendelaCetak = window.open('', '_blank', 'width=450,height=600');
    jendelaCetak.document.write(`
        <html>
        <head>
            <title>Kuitansi Pembayaran Resmi - WiFi-NET</title>
            <style>
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    padding: 20px; 
                    line-height: 1.5; 
                    color: #000; 
                    max-width: 350px;
                    margin: 0 auto;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .garis { border-top: 1px dashed #000; margin: 12px 0; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                td { padding: 5px 0; vertical-align: top; font-size: 0.9rem; }
                .title { font-size: 1.3rem; margin: 0; font-weight: bold; }
                .lunas-box {
                    border: 2px solid #000;
                    padding: 5px 15px;
                    display: inline-block;
                    margin: 15px 0;
                    font-weight: bold;
                    font-size: 1.1rem;
                    letter-spacing: 2px;
                }
            </style>
        </head>
        <body>
            <div class="text-center">
                <p class="title">WIFI-NET INDONESIA</p>
                <p style="font-size: 0.8rem; margin: 5px 0 0 0;">Layanan Internet Cepat & Stabil</p>
            </div>
            
            <div class="garis"></div>
            
            <p style="font-size: 0.85rem; margin: 0;">Tanggal: ${p.tglDaftar}</p>
            <p style="font-size: 0.85rem; margin: 4px 0 0 0;">Petugas: Admin Utama</p>
            
            <div class="garis"></div>
            
            <p class="bold" style="font-size: 0.95rem; margin-bottom: 5px;">DETAIL TAGIHAN:</p>
            <table>
                <tr>
                    <td style="width: 45%;">ID Pelanggan</td>
                    <td>: <span class="bold">WFN-${p.id.toString().slice(-6)}</span></td>
                </tr>
                <tr>
                    <td>Nama Pelanggan</td>
                    <td>: <span class="bold">${p.nama.toUpperCase()}</span></td>
                </tr>
                <tr>
                    <td>Paket Langganan</td>
                    <td>: <span>${p.paket}</span></td>
                </tr>
                <tr>
                    <td>Masa Aktif s/d</td>
                    <td>: <span>${p.tglTempo}</span></td>
                </tr>
            </table>
            
            <div class="garis"></div>
            
            <table>
                <tr class="bold" style="font-size: 1rem;">
                    <td>TOTAL BAYAR</td>
                    <td class="text-right">Rp ${p.harga.toLocaleString('id-ID')}</td>
                </tr>
            </table>
            
            <div class="garis"></div>
            
            <div class="text-center">
                <div class="lunas-box">L U N A S</div>
                <p style="font-size: 0.8rem; margin: 0;">Terima kasih telah berlangganan.</p>
                <p style="font-size: 0.75rem; margin: 5px 0 0 0; color: #555;">Simpan kuitansi ini sebagai bukti pembayaran sah.</p>
            </div>

        <script>
    // Kode ini tidak akan langsung memicu mesin print saat halaman terbuka.
    // Dosen atau Anda bisa membaca datanya terlebih dahulu dengan aman.
        </script>
        </body>
        </html>
    `);
    jendelaCetak.document.close();
}

// === STATISTIK DASHBOARD ===
function updateDashboard() {
    let daftarPelanggan = JSON.parse(localStorage.getItem('wifi_pelanggan')) || [];
    let totalPelanggan = daftarPelanggan.length;
    let totalAktif = daftarPelanggan.filter(p => p.status === "AKTIF").length;
    let totalIsolir = daftarPelanggan.filter(p => p.status === "ISOLIR").length;
    
    let totalOmset = 0;
    daftarPelanggan.forEach(p => totalOmset += p.harga);

    document.getElementById('stat-total').innerText = `${totalPelanggan} Orang`;
    document.getElementById('stat-aktif').innerText = `${totalAktif} Orang`;
    document.getElementById('stat-omset').innerText = `Rp ${totalOmset.toLocaleString('id-ID')}`;
    document.querySelectorAll('.badge-count').forEach(b => b.innerText = totalIsolir);
}

function simpanKeLocalStorage(pelanggan) {
    let daftarPelanggan = JSON.parse(localStorage.getItem('wifi_pelanggan')) || [];
    daftarPelanggan.push(pelanggan);
    localStorage.setItem('wifi_pelanggan', JSON.stringify(daftarPelanggan));
}

function hapusPelanggan(id) {
    if (confirm("Hapus pelanggan ini dari sistem?")) {
        let daftar = JSON.parse(localStorage.getItem('wifi_pelanggan')) || [];
        localStorage.setItem('wifi_pelanggan', JSON.stringify(daftar.filter(p => p.id !== id)));
        muatDataPelanggan(); updateDashboard();
    }
}

function resetAplikasi() {
    if(confirm("Hapus seluruh basis data?")) { localStorage.clear(); muatDataPelanggan(); muatDataOdp(); muatDataKomplain(); updateDashboard(); }
}

function formatDate(date) {
    return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${date.getFullYear()}`;
}
