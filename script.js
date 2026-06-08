// === DATABASE UTAMA (MOCKUP LOCALSTORAGE BROWSER) ===
let pelanggan = JSON.parse(localStorage.getItem('wifi_pelanggan')) || [];

// Data Tambahan Statis untuk Tab yang Tidak Berhubungan Langsung dengan Data Pelanggan
const dataSimulasiTiket = [
    { id: "RENCF95J", tgl: "06/06/2026 21:09", nama: "BONA VISTA", telp: "+6281708009000", tipe: "GANGGUAN", qc: "REDAMAN TINGGI" },
    { id: "RENXH8XZ", tgl: "02/06/2026 08:11", nama: "ABDUR SYAKUR", telp: "+6281222334455", tipe: "KELUHAN", qc: "ONT POWER OFF" },
    { id: "REWECCL5", tgl: "25/05/2026 15:53", nama: "NURUL HIDAYAH", telp: "+6285712345678", tipe: "GANGGUAN", qc: "CORE FO PROBLEM" }
];

// OTOMATIS JALAN SAAT APLIKASI DIBUKA
document.addEventListener("DOMContentLoaded", function() {
    cekValidasiIsolirOtomatis();
    muatSemuaTabel(); 
    gantiTab('isolir'); // Secara default langsung membuka tab ISOLIR saat menu diklik
});

// ROUTING MENU UTAMA SIDEBAR KIRI
function pindahMenu(targetMenu) {
    document.querySelectorAll('.menu-section').forEach(sec => sec.style.display = 'none');
    document.getElementById('menu-' + targetMenu).style.display = 'block';
    
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    
    if(event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    muatSemuaTabel();
}

// LOGIKA OTOMATIS JATUH TEMPO WiFi
function cekValidasiIsolirOtomatis() {
    let hariIni = new Date();
    pelanggan.forEach(p => {
        let partMati = p.tglTempo.split('/');
        let dateTempo = new Date(partMati[2], partMati[1] - 1, partMati[0]);
        if (hariIni > dateTempo) {
            p.status = "ISOLIR";
        }
    });
    localStorage.setItem('wifi_pelanggan', JSON.stringify(pelanggan));
    updateBadges();
}

function updateBadges() {
    let totalIsolir = pelanggan.filter(p => p.status === "ISOLIR").length;
    let badge = document.getElementById('badgeIsolir');
    if(badge) badge.innerText = totalIsolir;
}

// FUNGSI UTAMA RENDER DATA KE TABEL UTAMA (PELANGGAN AKTIF)
function muatSemuaTabel() {
    let tbodyAktif = document.getElementById('tabelPelanggan');
    if(tbodyAktif) {
        tbodyAktif.innerHTML = "";
        let dataAktif = pelanggan.filter(p => p.status === "AKTIF");
        if(dataAktif.length === 0) {
            tbodyAktif.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8;">Belum ada pelanggan aktif.</td></tr>`;
        } else {
            dataAktif.forEach(p => {
                tbodyAktif.innerHTML += `
                    <tr>
                        <td>WFN-${p.id.toString().slice(-5)}</td>
                        <td><b>${p.nama}</b></td>
                        <td>${p.whatsapp}</td>
                        <td>${p.paket}</td>
                        <td><span style="color:green; font-weight:bold;">${p.tglTempo}</span></td>
                        <td>
                            <button class="btn-success" onclick="cetakNota(${p.id})">🖨️ Struk</button>
                            <button class="btn-danger" style="padding: 5px 10px; font-size: 0.75rem;" onclick="hapusPelanggan(${p.id})">🗑️ Hapus</button>
                        </td>
                    </tr>`;
            });
        }
    }
    updateBadges();
}

// FUNGSI SUB-MENU TAB HORIZONTAL
function gantiTab(namaTab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    let tbody = document.getElementById('tabelIsolir');
    if(!tbody) return;
    tbody.innerHTML = ""; 

    if (namaTab === 'isolir') {
        let dataIsolir = pelanggan.filter(p => p.status === "ISOLIR");
        if(dataIsolir.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">Tidak ada data pelanggan terisolir saat ini.</td></tr>`;
            return;
        }
        dataIsolir.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>ISO-${p.id.toString().slice(-5)}</td>
                    <td><span style="color:#ef4444; font-weight:bold;">${p.tglTempo}</span></td>
                    <td><b>${p.nama.toUpperCase()}</b></td>
                    <td>${p.whatsapp}</td>
                    <td><span style="background:#fee2e2; color:#ef4444; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:0.75rem;">AUTO ISOLIR</span></td>
                    <td>
                        <button class="btn-success" onclick="cetakNota(${p.id})">🖨️ Struk</button>
                        <button class="btn-danger" style="padding: 5px 10px; font-size: 0.75rem;" onclick="hapusPelanggan(${p.id})">🗑️ Hapus</button>
                    </td>
                </tr>`;
        });

    } else if (namaTab === 'layanan') {
        if(pelanggan.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">Belum ada data layanan topologi jaringan.</td></tr>`;
            return;
        }
        pelanggan.forEach(p => {
            let statusRedaman = p.status === "AKTIF" ? "-18.25 dBm (Good)" : "LOS (No Signal)";
            let badgeStatus = p.status === "AKTIF" ? 
                `<span style="background:#dcfce7; color:#15803d; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:0.75rem;">ONLINE</span>` : 
                `<span style="background:#fee2e2; color:#ef4444; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:0.75rem;">OFFLINE</span>`;
            
            tbody.innerHTML += `
                <tr>
                    <td>LYN-${p.id.toString().slice(-5)}</td>
                    <td>${p.tglDaftar}</td>
                    <td><b>${p.nama.toUpperCase()}</b></td>
                    <td>${p.paket}</td>
                    <td>${badgeStatus}</td>
                    <td><i style="color:#475569;">ONU PON: ${statusRedaman}</i></td>
                </tr>`;
        });

    } else if (namaTab === 'billing') {
        if(pelanggan.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">Belum ada lembar tagihan billing terkini.</td></tr>`;
            return;
        }
        pelanggan.forEach(p => {
            let badgeBayar = p.status === "AKTIF" ? 
                `<span style="background:#dcfce7; color:#15803d; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:0.75rem;">PAID (LUNAS)</span>` : 
                `<span style="background:#fef08a; color:#a16207; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:0.75rem;">UNPAID (MENUNGGAK)</span>`;
            
            tbody.innerHTML += `
                <tr>
                    <td>BIL-${p.id.toString().slice(-5)}</td>
                    <td>${p.tglTempo}</td>
                    <td><b>${p.nama.toUpperCase()}</b></td>
                    <td>Rp ${p.harga.toLocaleString('id-ID')}</td>
                    <td>${badgeBayar}</td>
                    <td><span style="color:#64748b; font-size:0.8rem;">Cash / Drop-box</span></td>
                </tr>`;
        });

    } else if (namaTab === 'invoice') {
        let dataLunas = pelanggan.filter(p => p.status === "AKTIF");
        if(dataLunas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">Tidak ada arsip invoice lunas.</td></tr>`;
            return;
        }
        dataLunas.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>INV-${p.id.toString().slice(-5)}</td>
                    <td>${p.tglDaftar}</td>
                    <td><b>${p.nama.toUpperCase()}</b></td>
                    <td>Rp ${p.harga.toLocaleString('id-ID')}</td>
                    <td><span style="border: 1px solid #15803d; color:#15803d; padding:20px 8px; border-radius:4px; font-weight:bold; font-size:0.7rem;">OFFICIAL INV</span></td>
                    <td><button class="btn-success" onclick="cetakNota(${p.id})">📄 Lihat PDF</button></td>
                </tr>`;
        });

    } else if (namaTab === 'ticket') {
        dataSimulasiTiket.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td>${t.id}</td>
                    <td>${t.tgl}</td>
                    <td><b>${t.nama}</b></td>
                    <td>${t.telp}</td>
                    <td><span style="background:#fef08a; color:#a16207; padding:3px 8px; border-radius:4px; font-weight:bold; font-size:0.75rem;">${t.tipe}</span></td>
                    <td><i style="color:#475569; font-weight:bold; font-style:normal;">${t.qc}</i></td>
                </tr>`;
        });

    } else {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b; padding: 20px;">ℹ️ Modul Tab <b>${namaTab.toUpperCase()}</b> Aktif. Menunggu input inventaris alat/logistik.</td></tr>`;
    }
}

// SIMPAN REGISTRASI PELANGGAN BARU
function simpanPelanggan(e) {
    e.preventDefault();
    let nama = document.getElementById('regNama').value;
    let wa = document.getElementById('regWa').value;
    let paket = document.getElementById('regPaket').value;
    
    let d = new Date();
    let tglDaftar = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
    d.setDate(d.getDate() + 30); 
    let tglTempo = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
    
    let harga = paket.includes("10 Mbps") ? 150000 : paket.includes("20 Mbps") ? 250000 : 350000;

    pelanggan.push({
        id: Date.now(), nama, whatsapp: wa, paket, harga, tglDaftar, tglTempo, status: "AKTIF"
    });

    localStorage.setItem('wifi_pelanggan', JSON.stringify(pelanggan));
    alert("Pelanggan " + nama + " Berhasil Didaftarkan!");
    document.getElementById('formRegistrasi').reset();
    
    cekValidasiIsolirOtomatis();
    muatSemuaTabel();
}

// MENGHAPUS DATA PELANGGAN
function hapusPelanggan(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data pelanggan ini dari sistem?")) {
        pelanggan = pelanggan.filter(p => p.id !== id);
        localStorage.setItem('wifi_pelanggan', JSON.stringify(pelanggan));
        
        muatSemuaTabel();
        
        let tabAktif = document.querySelector('.tab-btn.active');
        if(tabAktif) {
            let namaTab = tabAktif.innerText.toLowerCase();
            gantiTab(namaTab);
        }
        
        alert("Data pelanggan berhasil dihapus!");
    }
}

// PRATINJAU NOTA KUITANSI DIGITAL
function cetakNota(id) {
    const p = pelanggan.find(item => item.id === id);
    if(!p) return alert("Data tidak ditemukan!");

    const j = window.open('', '_blank', 'width=450,height=600');
    j.document.write(`
        <html>
        <head>
            <title>Struk Pembayaran WiFi-NET</title>
            <style>
                body { font-family:'Courier New',monospace; padding:20px; max-width:350px; margin:0 auto; }
                .center { text-align:center; } .right { text-align:right; } .bold { font-weight:bold; }
                .garis { border-top:1px dashed #000; margin:12px 0; }
                table { width:100%; margin:10px 0; font-size:0.9rem; }
                .box { border:2px solid #000; padding:5px; display:inline-block; margin-top:10px; font-weight:bold; }
            </style>
        </head>
        <body>
            <div class="center">
                <h3 style="margin:0;">WIFI-NET INDONESIA</h3>
                <span style="font-size:0.8rem;">Invoice Sistem Billing Resmi</span>
            </div>
            <div class="garis"></div>
            <p>Tgl Bayar: ${p.tglDaftar}</p>
            <p>Status   : ${p.status}</p>
            <div class="garis"></div>
            <table>
                <tr><td>ID PEL</td><td>: WFN-${p.id.toString().slice(-5)}</td></tr>
                <tr><td>NAMA</td><td>: ${p.nama.toUpperCase()}</td></tr>
                <tr><td>PAKET</td><td>: ${p.paket}</td></tr>
                <tr><td>EXPEDISI</td><td>: ${p.tglTempo}</td></tr>
            </table>
            <div class="garis"></div>
            <table class="bold">
                <tr><td>TOTAL TAGIHAN</td><td class="right">Rp ${p.harga.toLocaleString('id-ID')}</td></tr>
            </table>
            <div class="garis"></div>
            <div class="center">
                <div class="box">L U N A S</div>
                <p style="font-size:0.8rem; margin-top:10px;">Tekan Ctrl+P untuk mencetak kuitansi ini.</p>
            </div>
        </body>
        </html>
    `);
    j.document.close();
}

function jalankanBroadcast() {
    let listIsolir = pelanggan.filter(p => p.status === "ISOLIR");
    if(listIsolir.length === 0) return alert("Tidak ada data pelanggan terisolir!");
    alert("Menjalankan broadcast peringatan otomatis via API Gateway ke " + listIsolir.length + " pelanggan.");
}
