  // Hanya mengubah bagian defaultColors sesuai permintaan
  //voiceAssistant.processCommand();
  const defaultColors = {
    "Pemasukan": "#4CAF50",
    "Perawatan Diri & Kecantikan": "#FF9AA2",
    "Kebutuhan Pribadi": "#FFB7B2", 
    "Kesehatan": "#FFDAC1",
    "Makanan & Minuman": "#E2F0CB",
    "Transportasi & Kendaraan": "#B5EAD7",
    "Tagihan & Komunikasi": "#C7CEEA",
    "Pakaian & Aksesori": "#F8B195",
    "Elektronik & Gadget": "#F67280",
    "Sosial & Hadiah": "#6C5B7B",
    "Orang Tua & Keluarga": "#355C7D",
    "Kebutuhan Rumah": "#99B898", 
    "Tabungan & Investasi": "#FECEAB",
    "Administrasi & Dokumen": "#FF847C",
    "Peralatan & Barang Sehari-hari": "#A3BCCB"
};

  let db;
  const dbName = "keuanganDB";
  const storeName = "transactions";
  const quotaLimit = 50 * 1024 * 1024; // 50 MB
  let chart;
  let editingId = null; // Untuk menyimpan ID transaksi yang sedang diedit
  // Initialize Voice Assistant
  let voiceAssistant;

  window.onload = async () => {
      try {
          initSidebar();
          await initDB();
          initTahunOptions();
          loadFilterFromLocalStorage(); // Load filter settings
          const lastSection = localStorage.getItem('lastSection') || 'form';
          showSection(lastSection);
          loadTransaksi();
          loadPengeluaranKategori();
          updateChart();
          loadColors();
          loadCatatan();
          loadSavedTheme();
          generateThemeOptions();
          addThemeButtonToUI();
          await pantauStorage();
          setTimeout(tampilkanNotifikasiCatatan, 2000);
          // Initialize Voice Assistant
          voiceAssistant = new VoiceAssistant();
      } catch (error) {
          console.error("Error on load:", error);
      }
  };

  // ========== FUNGSI BARU UNTUK SISTEM FILTER ==========
  
  // Fungsi untuk menyimpan filter ke local storage
  function saveFilterToLocalStorage() {
      // Simpan tipe filter
      const filterTypeTabel = document.getElementById('filter-tanggal-tabel').value;
      const filterTypePengeluaran = document.getElementById('filter-tanggal-pengeluaran').value;
      
      localStorage.setItem('filterTypeTabel', filterTypeTabel);
      localStorage.setItem('filterTypePengeluaran', filterTypePengeluaran);
      
      // Simpan filter bulan
      const filterBulanTabel = document.getElementById('filter-bulan-tabel').value;
      const filterTahunTabel = document.getElementById('filter-tahun-tabel').value;
      const filterBulanPengeluaran = document.getElementById('filter-bulan-pengeluaran').value;
      const filterTahunPengeluaran = document.getElementById('filter-tahun-pengeluaran').value;
      
      if (filterBulanTabel) localStorage.setItem('filterBulanTabel', filterBulanTabel);
      if (filterTahunTabel) localStorage.setItem('filterTahunTabel', filterTahunTabel);
      if (filterBulanPengeluaran) localStorage.setItem('filterBulanPengeluaran', filterBulanPengeluaran);
      if (filterTahunPengeluaran) localStorage.setItem('filterTahunPengeluaran', filterTahunPengeluaran);
      
      // Simpan filter rentang tanggal
      const tanggalMulaiTabel = document.getElementById('filter-tanggal-mulai-tabel').value;
      const tanggalSelesaiTabel = document.getElementById('filter-tanggal-selesai-tabel').value;
      const tanggalMulaiPengeluaran = document.getElementById('filter-tanggal-mulai-pengeluaran').value;
      const tanggalSelesaiPengeluaran = document.getElementById('filter-tanggal-selesai-pengeluaran').value;
      
      if (tanggalMulaiTabel) localStorage.setItem('tanggalMulaiTabel', tanggalMulaiTabel);
      if (tanggalSelesaiTabel) localStorage.setItem('tanggalSelesaiTabel', tanggalSelesaiTabel);
      if (tanggalMulaiPengeluaran) localStorage.setItem('tanggalMulaiPengeluaran', tanggalMulaiPengeluaran);
      if (tanggalSelesaiPengeluaran) localStorage.setItem('tanggalSelesaiPengeluaran', tanggalSelesaiPengeluaran);
      
      // Simpan pencarian
      const searchDeskripsi = document.getElementById('search-deskripsi').value;
      const searchKategori = document.getElementById('search-kategori').value;
      
      localStorage.setItem('searchDeskripsi', searchDeskripsi);
      localStorage.setItem('searchKategori', searchKategori);
  }
  
  // Fungsi untuk memuat filter dari local storage
  function loadFilterFromLocalStorage() {
      // Muat tipe filter
      const filterTypeTabel = localStorage.getItem('filterTypeTabel') || 'bulan';
      const filterTypePengeluaran = localStorage.getItem('filterTypePengeluaran') || 'bulan';
      
      document.getElementById('filter-tanggal-tabel').value = filterTypeTabel;
      document.getElementById('filter-tanggal-pengeluaran').value = filterTypePengeluaran;
      
      // Tampilkan container yang sesuai
      toggleFilterType('tabel');
      toggleFilterType('pengeluaran');
      
      // Muat filter bulan
      const filterBulanTabel = localStorage.getItem('filterBulanTabel');
      const filterTahunTabel = localStorage.getItem('filterTahunTabel');
      const filterBulanPengeluaran = localStorage.getItem('filterBulanPengeluaran');
      const filterTahunPengeluaran = localStorage.getItem('filterTahunPengeluaran');
      
      if (filterBulanTabel) document.getElementById('filter-bulan-tabel').value = filterBulanTabel;
      if (filterTahunTabel) document.getElementById('filter-tahun-tabel').value = filterTahunTabel;
      if (filterBulanPengeluaran) document.getElementById('filter-bulan-pengeluaran').value = filterBulanPengeluaran;
      if (filterTahunPengeluaran) document.getElementById('filter-tahun-pengeluaran').value = filterTahunPengeluaran;
      
      // Muat filter rentang tanggal
      const tanggalMulaiTabel = localStorage.getItem('tanggalMulaiTabel');
      const tanggalSelesaiTabel = localStorage.getItem('tanggalSelesaiTabel');
      const tanggalMulaiPengeluaran = localStorage.getItem('tanggalMulaiPengeluaran');
      const tanggalSelesaiPengeluaran = localStorage.getItem('tanggalSelesaiPengeluaran');
      
      if (tanggalMulaiTabel) document.getElementById('filter-tanggal-mulai-tabel').value = tanggalMulaiTabel;
      if (tanggalSelesaiTabel) document.getElementById('filter-tanggal-selesai-tabel').value = tanggalSelesaiTabel;
      if (tanggalMulaiPengeluaran) document.getElementById('filter-tanggal-mulai-pengeluaran').value = tanggalMulaiPengeluaran;
      if (tanggalSelesaiPengeluaran) document.getElementById('filter-tanggal-selesai-pengeluaran').value = tanggalSelesaiPengeluaran;
      
      // Muat pencarian
      const searchDeskripsi = localStorage.getItem('searchDeskripsi') || '';
      const searchKategori = localStorage.getItem('searchKategori') || '';
      
      document.getElementById('search-deskripsi').value = searchDeskripsi;
      document.getElementById('search-kategori').value = searchKategori;
  }
  
  // Toggle jenis filter (bulan/rentang tanggal)
  function toggleFilterType(type) {
      const filterType = document.getElementById(`filter-tanggal-${type}`).value;
      const bulanContainer = document.getElementById(`filter-bulan-${type}-container`);
      const rentangContainer = document.getElementById(`filter-rentang-${type}-container`);
      
      if (filterType === 'bulan') {
          bulanContainer.style.display = 'block';
          rentangContainer.style.display = 'none';
      } else {
          bulanContainer.style.display = 'none';
          rentangContainer.style.display = 'block';
      }
      
      saveFilterToLocalStorage();
  }
  
  // Reset filter rentang tanggal
  function resetDateRangeFilter(type) {
      document.getElementById(`filter-tanggal-mulai-${type}`).value = '';
      document.getElementById(`filter-tanggal-selesai-${type}`).value = '';
      
      // Hapus dari localStorage juga
      localStorage.removeItem(`tanggalMulai${type.charAt(0).toUpperCase() + type.slice(1)}`);
      localStorage.removeItem(`tanggalSelesai${type.charAt(0).toUpperCase() + type.slice(1)}`);
      
      saveFilterToLocalStorage();
      
      if (type === 'tabel') {
          loadTransaksi();
      } else {
          loadPengeluaranKategori();
          updateChart();
      }
      
      showNotification('Filter rentang tanggal telah direset', 'success');
  }
  
  // ========== MODIFIKASI FUNGSI YANG SUDAH ADA ==========
  
  async function loadTransaksi() {
      try {
          let transaksiList = await getAllTransaksi();
          transaksiList.sort((a, b) => new Date(a.date) - new Date(b.date));
          
          const filterType = document.getElementById('filter-tanggal-tabel').value;
          
          // Filter berdasarkan tipe filter
          if (filterType === 'bulan') {
              const filterBulan = document.getElementById('filter-bulan-tabel').value;
              const filterTahun = document.getElementById('filter-tahun-tabel').value;
              
              if (filterBulan) {
                  transaksiList = transaksiList.filter(t => t.date.startsWith(filterBulan));
              } else if (filterTahun) {
                  transaksiList = transaksiList.filter(t => t.date.startsWith(filterTahun));
              }
          } else if (filterType === 'rentang') {
              const tanggalMulai = document.getElementById('filter-tanggal-mulai-tabel').value;
              const tanggalSelesai = document.getElementById('filter-tanggal-selesai-tabel').value;
              
              if (tanggalMulai && tanggalSelesai) {
                  const startDate = new Date(tanggalMulai);
                  const endDate = new Date(tanggalSelesai);
                  endDate.setHours(23, 59, 59, 999); // Sampai akhir hari
                  
                  transaksiList = transaksiList.filter(t => {
                      const noteDate = new Date(t.date);
                      return noteDate >= startDate && noteDate <= endDate;
                  });
              } else if (tanggalMulai) {
                  const startDate = new Date(tanggalMulai);
                  transaksiList = transaksiList.filter(t => {
                      const noteDate = new Date(t.date);
                      return noteDate >= startDate;
                  });
              } else if (tanggalSelesai) {
                  const endDate = new Date(tanggalSelesai);
                  endDate.setHours(23, 59, 59, 999); // Sampai akhir hari
                  transaksiList = transaksiList.filter(t => {
                      const noteDate = new Date(t.date);
                      return noteDate <= endDate;
                  });
              }
          }
  
          // Filter berdasarkan pencarian
          const searchDeskripsi = document.getElementById('search-deskripsi').value.trim().toLowerCase();
          const searchKategori = document.getElementById('search-kategori').value.trim().toLowerCase();
  
          if (searchDeskripsi) {
              transaksiList = transaksiList.filter(t => 
                  t.description.toLowerCase().includes(searchDeskripsi));
          }
  
          if (searchKategori) {
              transaksiList = transaksiList.filter(t => 
                  t.category.toLowerCase().includes(searchKategori));
          }
  
          const tbody = document.querySelector('#tabel-transaksi tbody');
          tbody.innerHTML = '';
          let saldoAkhir = 0;
          let totalMasuk = 0;
          let totalKeluar = 0;
          const savedColors = JSON.parse(localStorage.getItem('chartColors')) || {};
  
          transaksiList.forEach(transaksi => {
              if (transaksi.type === 'pemasukan') {
                  saldoAkhir += transaksi.amount;
                  totalMasuk += transaksi.amount;
              } else {
                  saldoAkhir -= transaksi.amount;
                  totalKeluar += transaksi.amount;
              }
  
              // PERBAIKAN: Handle format warna baru (object) dan lama (string)
              let kategoriColor = savedColors[transaksi.category] || defaultColors[transaksi.category] || getRandomColor();
              
              // Jika warna dalam format baru (object)
              if (typeof kategoriColor === 'object' && kategoriColor.color) {
                  kategoriColor = kategoriColor.color;
              }
              // Jika warna dalam format gradient, gunakan color1
              else if (typeof kategoriColor === 'object' && kategoriColor.color1) {
                  kategoriColor = kategoriColor.color1;
              }
              // Jika tidak ada warna, gunakan warna acak
              else if (!kategoriColor) {
                  kategoriColor = getRandomColor();
              }
  
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${formatTanggal(transaksi.date)}</td>
                  <td>${transaksi.description}</td>
                  <td style="background-color: ${kategoriColor}; color: white;font-weight:bold;">${transaksi.category}</td>
                  <td>${transaksi.type === 'pemasukan' ? formatRupiah(transaksi.amount) : ''}</td>
                  <td>${transaksi.type === 'pengeluaran' ? formatRupiah(transaksi.amount) : ''}</td>
                  <td class="${saldoAkhir < 300000 ? 'saldo-merah' : ''}">${formatRupiah(saldoAkhir)}</td>
                  <td class="action-buttons">
                      <button class="btn-edit" onclick="editTransaksi(${transaksi.id})"><i class="fas fa-edit"></i></button>
                      <button class="btn-delete" onclick="hapusTransaksiConfirm(${transaksi.id})"><i class="fas fa-times"></i></button>
                  </td>
              `;
              tbody.appendChild(row);
          });
  
          document.getElementById('total-masuk').textContent = formatRupiah(totalMasuk);
          document.getElementById('total-keluar').textContent = formatRupiah(totalKeluar);
      } catch (error) {
          console.error("Error load transaksi:", error);
      }
  }

  async function loadPengeluaranKategori() {
      try {
          let transaksiList = await getAllTransaksi();
          const filterType = document.getElementById('filter-tanggal-pengeluaran').value;
          
          // Filter berdasarkan tipe filter
          if (filterType === 'bulan') {
              const filterBulan = document.getElementById('filter-bulan-pengeluaran').value;
              const filterTahun = document.getElementById('filter-tahun-pengeluaran').value;
              
              if (filterBulan) {
                  transaksiList = transaksiList.filter(t => t.date.startsWith(filterBulan));
              } else if (filterTahun) {
                  transaksiList = transaksiList.filter(t => t.date.startsWith(filterTahun));
              }
          } else if (filterType === 'rentang') {
              const tanggalMulai = document.getElementById('filter-tanggal-mulai-pengeluaran').value;
              const tanggalSelesai = document.getElementById('filter-tanggal-selesai-pengeluaran').value;
              
              if (tanggalMulai && tanggalSelesai) {
                  const startDate = new Date(tanggalMulai);
                  const endDate = new Date(tanggalSelesai);
                  endDate.setHours(23, 59, 59, 999); // Sampai akhir hari
                  
                  transaksiList = transaksiList.filter(t => {
                      const noteDate = new Date(t.date);
                      return noteDate >= startDate && noteDate <= endDate;
                  });
              } else if (tanggalMulai) {
                  const startDate = new Date(tanggalMulai);
                  transaksiList = transaksiList.filter(t => {
                      const noteDate = new Date(t.date);
                      return noteDate >= startDate;
                  });
              } else if (tanggalSelesai) {
                  const endDate = new Date(tanggalSelesai);
                  endDate.setHours(23, 59, 59, 999); // Sampai akhir hari
                  transaksiList = transaksiList.filter(t => {
                      const noteDate = new Date(t.date);
                      return noteDate <= endDate;
                  });
              }
          }
          
          const kategoriMap = {};

          transaksiList.forEach(t => {
              if (t.type === 'pengeluaran') {
                  if (!kategoriMap[t.category]) {
                      kategoriMap[t.category] = 0;
                  }
                  kategoriMap[t.category] += t.amount;
              }
          });

          const tbody = document.querySelector('#tabel-kategori tbody');
          tbody.innerHTML = '';
          for (const [kategori, jumlah] of Object.entries(kategoriMap)) {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${kategori}</td>
                  <td>${formatRupiah(jumlah)}</td>
              `;
              tbody.appendChild(row);
          }
      } catch (error) {
          console.error("Error load pengeluaran kategori:", error);
      }
  }

  async function updateChart() {
      try {
          let transaksiList = await getAllTransaksi();
          const filterType = document.getElementById('filter-tanggal-pengeluaran').value;
          
          // Filter berdasarkan tipe filter
          if (filterType === 'bulan') {
              const filterBulan = document.getElementById('filter-bulan-pengeluaran').value;
              const filterTahun = document.getElementById('filter-tahun-pengeluaran').value;
              
              if (filterBulan) {
                  transaksiList = transaksiList.filter(t => t.date.startsWith(filterBulan));
              } else if (filterTahun) {
                  transaksiList = transaksiList.filter(t => t.date.startsWith(filterTahun));
              }
          } else if (filterType === 'rentang') {
              const tanggalMulai = document.getElementById('filter-tanggal-mulai-pengeluaran').value;
              const tanggalSelesai = document.getElementById('filter-tanggal-selesai-pengeluaran').value;
              
              if (tanggalMulai && tanggalSelesai) {
                  const startDate = new Date(tanggalMulai);
                  const endDate = new Date(tanggalSelesai);
                  endDate.setHours(23, 59, 59, 999); // Sampai akhir hari
                  
                  transaksiList = transaksiList.filter(t => {
                      const noteDate = new Date(t.date);
                      return noteDate >= startDate && noteDate <= endDate;
                  });
              } else if (tanggalMulai) {
                  const startDate = new Date(tanggalMulai);
                  transaksiList = transaksiList.filter(t => {
                      const noteDate = new Date(t.date);
                      return noteDate >= startDate;
                  });
              } else if (tanggalSelesai) {
                  const endDate = new Date(tanggalSelesai);
                  endDate.setHours(23, 59, 59, 999); // Sampai akhir hari
                  transaksiList = transaksiList.filter(t => {
                      const noteDate = new Date(t.date);
                      return noteDate <= endDate;
                  });
              }
          }
          
          const kategoriMap = {};
          transaksiList.forEach(t => {
              if (t.type === 'pengeluaran') {
                  if (!kategoriMap[t.category]) {
                      kategoriMap[t.category] = 0;
                  }
                  kategoriMap[t.category] += t.amount;
              }
          });
  
          const labels = Object.keys(kategoriMap);
          const data = Object.values(kategoriMap);
          const savedColors = JSON.parse(localStorage.getItem('chartColors')) || {};
          const colors = labels.map(label => {
              const colorData = savedColors[label] || defaultColors[label] || getRandomColor();
              
              // PERBAIKAN: Handle format warna baru
              if (typeof colorData === 'object' && colorData.gradient) {
                  // Jika menggunakan gradient, buat gradient
                  const gradient = document.createElement('canvas').getContext('2d').createLinearGradient(0, 0, 0, 400);
                  gradient.addColorStop(0, colorData.color1);
                  gradient.addColorStop(1, colorData.color2);
                  return gradient;
              } else if (typeof colorData === 'object' && colorData.color) {
                  // Jika format object tanpa gradient
                  return colorData.color;
              } else {
                  // Jika warna biasa (string)
                  return colorData;
              }
          });
  
          if (chart) chart.destroy();
          chart = new Chart(document.getElementById('chart-donat'), {
              type: 'doughnut',
              data: {
                  labels: labels,
                  datasets: [{
                      data: data,
                      backgroundColor: colors
                  }]
              },
              options: { responsive: true }
          });
      } catch (error) {
          console.error("Error update chart:", error);
      }
  }

  // ========== FUNGSI YANG TIDAK BERUBAH ==========
  
  async function initDB() {
      return new Promise((resolve, reject) => {
          try {
              const request = indexedDB.open(dbName, 1);
              request.onerror = (event) => reject(event.target.error);
              request.onsuccess = (event) => {
                  db = event.target.result;
                  resolve();
              };
              request.onupgradeneeded = (event) => {
                  db = event.target.result;
                  db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
              };
          } catch (error) {
              reject(error);
          }
      });
  }

  document.getElementById('form-transaksi').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
          const tanggal = document.getElementById('tanggal').value;
          const jenis = document.querySelector('input[name="jenis"]:checked').value;
          const deskripsi = document.getElementById('deskripsi').value;
          let kategori = document.getElementById('kategori').value;
          if (kategori === 'lainnya') {
              kategori = document.getElementById('kategori-lainnya').value.trim();
              if (!kategori) kategori = 'lainnya';
          }
          const jumlahStr = document.getElementById('jumlah').value.replace(/\./g, '');
          const jumlah = parseInt(jumlahStr, 10);

          const transaksi = { date: tanggal, type: jenis, description: deskripsi, category: kategori, amount: jumlah };

          if (editingId) {
              // Mode edit
              transaksi.id = editingId;
              await updateTransaksi(transaksi);
              showNotification("Transaksi berhasil diupdate!");
              editingId = null;
          } else {
              // Mode tambah baru
              await simpanTransaksi(transaksi);
              showNotification("Transaksi disimpan!");
          }
          
          loadTransaksi();
          loadPengeluaranKategori();
          updateChart();
          updateColorEditor();
          await pantauStorage();
          e.target.reset();
      } catch (error) {
          console.error("Error simpan transaksi:", error);
          showNotification("Gagal simpan transaksi.");
      }
  });

  async function simpanTransaksi(transaksi) {
      return new Promise((resolve, reject) => {
          try {
              const transaction = db.transaction([storeName], "readwrite");
              const store = transaction.objectStore(storeName);
              const request = store.add(transaksi);
              request.onsuccess = () => {
              pantauStorage();
              resolve();
              };
              request.onerror = (event) => reject(event.target.error);
          } catch (error) {
              reject(error);
          }
      });
  }

  async function updateTransaksi(transaksi) {
      return new Promise((resolve, reject) => {
          try {
              const transaction = db.transaction([storeName], "readwrite");
              const store = transaction.objectStore(storeName);
              const request = store.put(transaksi);
              request.onsuccess = () => resolve();
              request.onerror = (event) => reject(event.target.error);
          } catch (error) {
              reject(error);
          }
      });
  }

  async function hapusTransaksi(id) {
      return new Promise((resolve, reject) => {
          try {
              const transaction = db.transaction([storeName], "readwrite");
              const store = transaction.objectStore(storeName);
              const request = store.delete(id);
              request.onsuccess = () => { 
                pantauStorage();
                resolve();
              };
              request.onerror = (event) => reject(event.target.error);
          } catch (error) {
              reject(error);
          }
      });
  }

  async function getTransaksiById(id) {
      return new Promise((resolve, reject) => {
          try {
              const transaction = db.transaction([storeName], "readonly");
              const store = transaction.objectStore(storeName);
              const request = store.get(id);
              request.onsuccess = (event) => resolve(event.target.result);
              request.onerror = (event) => reject(event.target.error);
          } catch (error) {
              reject(error);
          }
      });
  }

  async function getAllTransaksi() {
      return new Promise((resolve, reject) => {
          try {
              const transaction = db.transaction([storeName], "readonly");
              const store = transaction.objectStore(storeName);
              const request = store.getAll();
              request.onsuccess = (event) => resolve(event.target.result);
              request.onerror = (event) => reject(event.target.error);
          } catch (error) {
              reject(error);
          }
      });
  }

  async function editTransaksi(id) {
      try {
          const transaksi = await getTransaksiById(id);
          if (transaksi) {
              // Isi form dengan data transaksi
              document.getElementById('tanggal').value = transaksi.date;
              document.querySelector(`input[name="jenis"][value="${transaksi.type}"]`).checked = true;
              document.getElementById('deskripsi').value = transaksi.description;
              
              // Handle kategori
              if (Object.keys(defaultColors).includes(transaksi.category)) {
                  document.getElementById('kategori').value = transaksi.category;
                  document.getElementById('kategori-lainnya').style.display = 'none';
              } else {
                  document.getElementById('kategori').value = 'lainnya';
                  document.getElementById('kategori-lainnya').style.display = 'inline';
                  document.getElementById('kategori-lainnya').value = transaksi.category;
              }
              
              document.getElementById('jumlah').value = formatRupiah(transaksi.amount);
              
              // Set mode edit
              editingId = id;
              
              // Scroll ke form
              showSection('form');
              
              showNotification("Sedang mengedit transaksi...");
          }
      } catch (error) {
          console.error("Error edit transaksi:", error);
          showNotification("Gagal memuat data transaksi untuk diedit.");
      }
  }

  async function hapusTransaksiConfirm(id) {
      if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
          try {
              await hapusTransaksi(id);
              showNotification("Transaksi berhasil dihapus!");
              loadTransaksi();
              loadPengeluaranKategori();
              updateChart();
              pantauStorage();
          } catch (error) {
              console.error("Error hapus transaksi:", error);
              showNotification("Gagal menghapus transaksi.");
          }
      }
  }

  async function updateColorEditor() {
      try {
          const transaksiList = await getAllTransaksi();
          const kategoriSet = new Set(transaksiList.map(t => t.category));
          const colorEditor = document.getElementById('color-editor');
          colorEditor.innerHTML = '<h3><i class="fas fa-palette"></i> Edit Warna Diagram</h3>';
          const savedColors = JSON.parse(localStorage.getItem('chartColors')) || {};

          kategoriSet.forEach(kategori => {
              const safeId = kategori.replace(/\s+/g, '-');
              let colorData = savedColors[kategori] || defaultColors[kategori] || getRandomColor();
              
              // Jika warna masih format lama (string), konversi ke format baru
              if (typeof colorData === 'string') {
                  colorData = { color: colorData, gradient: false };
              }
              
              const colorItem = document.createElement('div');
              colorItem.className = 'color-item';
              colorItem.innerHTML = `
                  <strong>${kategori}:</strong>
                  <div class="color-input-group">
                      <input type="color" id="color-${safeId}" value="${colorData.color1 || colorData.color}" onchange="updateColorValue('${safeId}')">
                      <input type="text" id="hex-${safeId}" value="${colorData.color1 || colorData.color}" placeholder="Hex color" onchange="updateColorPicker('${safeId}')">
                  </div>
                  <div class="gradient-toggle">
                      <input type="checkbox" id="gradient-${safeId}" ${colorData.gradient ? 'checked' : ''} onchange="toggleGradient('${safeId}')">
                      <label for="gradient-${safeId}">Gunakan Gradient</label>
                  </div>
                  <div class="color-input-group" id="gradient-container-${safeId}" style="${colorData.gradient ? '' : 'display: none;'}">
                      <input type="color" id="color2-${safeId}" value="${colorData.color2 || colorData.color}" onchange="updateColorValue2('${safeId}')">
                      <input type="text" id="hex2-${safeId}" value="${colorData.color2 || colorData.color}" placeholder="Hex color 2" onchange="updateColorPicker2('${safeId}')">
                  </div>
              `;
              colorEditor.appendChild(colorItem);
          });
          
          // Simpan format baru jika ada perubahan dari format lama
          localStorage.setItem('chartColors', JSON.stringify(savedColors));
      } catch (error) {
          console.error("Error update color editor:", error);
      }
  }

  function updateColorValue(safeId) {
      const colorValue = document.getElementById(`color-${safeId}`).value;
      document.getElementById(`hex-${safeId}`).value = colorValue;
      saveColors();
      updateChart();
      loadTransaksi();
  }

  function updateColorValue2(safeId) {
      const colorValue = document.getElementById(`color2-${safeId}`).value;
      document.getElementById(`hex2-${safeId}`).value = colorValue;
      saveColors();
      updateChart();
  }

  function updateColorPicker(safeId) {
      let hexValue = document.getElementById(`hex-${safeId}`).value;
      // Pastikan format hex yang valid
      if (!hexValue.startsWith('#')) {
          hexValue = '#' + hexValue;
      }
      if (/^#([0-9A-F]{3}){1,2}$/i.test(hexValue)) {
          document.getElementById(`color-${safeId}`).value = hexValue;
          document.getElementById(`hex-${safeId}`).value = hexValue;
          saveColors();
          updateChart();
          loadTransaksi();
      }
  }

  function updateColorPicker2(safeId) {
      let hexValue = document.getElementById(`hex2-${safeId}`).value;
      // Pastikan format hex yang valid
      if (!hexValue.startsWith('#')) {
          hexValue = '#' + hexValue;
      }
      if (/^#([0-9A-F]{3}){1,2}$/i.test(hexValue)) {
          document.getElementById(`color2-${safeId}`).value = hexValue;
          document.getElementById(`hex2-${safeId}`).value = hexValue;
          saveColors();
          updateChart();
      }
  }

  function toggleGradient(safeId) {
      const useGradient = document.getElementById(`gradient-${safeId}`).checked;
      document.getElementById(`gradient-container-${safeId}`).style.display = useGradient ? 'flex' : 'none';
      saveColors();
      updateChart();
  }

  function getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

  function formatTanggal(dateStr) {
      const date = new Date(dateStr);
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      return date.toLocaleDateString('id-ID', options);
  }

  function formatRupiah(angka) {
      return angka.toLocaleString('id-ID');
  }

  function formatRibuan(input) {
      let value = input.value.replace(/\./g, '');
      if (value) {
          value = parseInt(value, 10).toLocaleString('id-ID');
      }
      input.value = value;
  }

  function showSection(id) {
      document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
      document.getElementById(`section-${id}`).style.display = 'block';
      localStorage.setItem('lastSection', id);
      
      if (id === 'tabel') loadTransaksi();
      if (id === 'pengeluaran') {
          loadPengeluaranKategori();
          updateChart();
          updateColorEditor();
      }
      
      // Auto close sidebar di mobile
      if (window.innerWidth <= 768) {
          const sidebar = document.getElementById('sidebar');
          if (sidebar.classList.contains('open')) {
              toggleSidebar();
          }
      }
      setTimeout(() => {
        speakSectionMessage(id);
    }, 300);
  }

  function speakSectionMessage(sectionId) {
    // Pastikan voiceAssistant sudah ada dan TTS enabled
      if (!window.voiceAssistant || !voiceAssistant.isTTSEnabled || !voiceAssistant.ttsSupported) {
          console.log('🔊 TTS tidak aktif atau voiceAssistant belum ready');
          return;
      }
      
      const sectionMessages = {
          'form': 'Section Form telah di buka, Anda bisa mengisi form atau dengan voice commands',
          'tabel': 'Section Tabel telah di buka, Anda bisa melihat data pengeluaran dan pemasukan', 
          'pengeluaran': 'Section Pengeluaran telah di buka, Anda bisa melihat data statistik pengeluaran anda',
          'catatan': 'Section Catatan telah di buka, Anda bisa menulis dan menyimpan catatan',
          'backup': 'Section Backup telah di buka, Anda bisa backup data anda dengan format JSON atau CSV'
      };
      
      const message = sectionMessages[sectionId];
      if (message) {
          console.log('🔊 Speaking section message:', message);
          voiceAssistant.speak(message);
      }
  }

  function tampilkanNotifikasiCatatan() {
      const notifikasi = document.getElementById('catatan-notification');
      const sudahDitampilkan = localStorage.getItem('notifikasiCatatanDitampilkan');
      
      // Cek jika sudah pernah ditampilkan hari ini
      if (!sudahDitampilkan) {
          notifikasi.style.display = 'flex';
          
          // Set flag bahwa notifikasi sudah ditampilkan hari ini
          const sekarang = new Date().toDateString();
          localStorage.setItem('notifikasiCatatanDitampilkan', sekarang);
          
          // Auto hide setelah 20 detik
          setTimeout(() => {
              if (notifikasi.style.display === 'flex') {
                  sembunyikanNotifikasiCatatan();
              }
          }, 20000);
      }
  }
  
  // Fungsi untuk menyembunyikan notifikasi catatan
  function sembunyikanNotifikasiCatatan() {
      const notifikasi = document.getElementById('catatan-notification');
      notifikasi.style.display = 'none';
  }
  
  // Fungsi ketika notifikasi catatan diklik
  function bukaCatatanDariNotifikasi() {
      tampilkanCatatan();
      sembunyikanNotifikasiCatatan();
  }
  
  // Event listener untuk notifikasi
  document.getElementById('catatan-notification').addEventListener('click', function(e) {
      // Jangan trigger jika yang diklik adalah tombol close
      if (!e.target.closest('.close-btn')) {
          bukaCatatanDariNotifikasi();
      }
  });

  function showNotification(message, type = 'info') {
      // Hapus bagian notifikasi catatan dari fungsi ini
      if (message.includes("Mau liat catatan?")) {
          return; // Skip notifikasi catatan lama
      }
      
      const notif = document.getElementById('notification');
      notif.textContent = message;
      notif.style.display = 'block';
      
      // Set warna berdasarkan jenis notifikasi
      if (type === 'success') {
          notif.style.borderLeftColor = '#4CAF50';
          notif.style.backgroundColor = '#f1f8e9';
      } else if (type === 'error') {
          notif.style.borderLeftColor = '#f44336';
          notif.style.backgroundColor = '#ffebee';
      } else {
          notif.style.borderLeftColor = '#2196F3';
          notif.style.backgroundColor = '#e3f2fd';
      }
      
      setTimeout(() => {
          notif.style.display = 'none';
      }, 5000);
  }

  function tutupNotif() {
      document.getElementById('notification').style.display = 'none';
  }

  function simpanCatatan() {
      try {
          const catatan = document.getElementById('catatan-text').value;
          localStorage.setItem('catatan', catatan);
          showNotification("Catatan disimpan!", 'success');
      } catch (error) {
          console.error("Error simpan catatan:", error);
      }
  }

  function loadCatatan() {
      try {
          const catatan = localStorage.getItem('catatan') || '';
          document.getElementById('catatan-text').value = catatan;
      } catch (error) {
          console.error("Error load catatan:", error);
      }
  }

  function tampilkanCatatan() {
      try {
          const catatan = localStorage.getItem('catatan') || 'Tidak ada catatan.';
          document.getElementById('catatan-content').textContent = catatan;
          document.getElementById('popup-catatan').style.display = 'block';
      } catch (error) {
          console.error("Error tampilkan catatan:", error);
      }
  }

  function tutupPopup() {
      document.getElementById('popup-catatan').style.display = 'none';
  }

  function resetNotifikasiHarian() {
      const hariIni = new Date().toDateString();
      const terakhirReset = localStorage.getItem('terakhirResetNotifikasi');
      
      if (terakhirReset !== hariIni) {
          localStorage.removeItem('notifikasiCatatanDitampilkan');
          localStorage.setItem('terakhirResetNotifikasi', hariIni);
      }
  }

  resetNotifikasiHarian();

  // ========== SIDEBAR TOGGLE FUNCTIONALITY ==========
  function initSidebar() {
      // Buat elemen sidebar
      const sidebarHTML = `
          <button class="sidebar-toggle" onclick="toggleSidebar()">
              <i class="fas fa-home"></i>
          </button>
          
          <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
          
          <div class="sidebar" id="sidebar">
              <div class="sidebar-nav">
                  <button class="nav-btn" data-tooltip="Tambah Transaksi" onclick="showSection('form'); toggleSidebar();">
                      <i class="fas fa-plus"></i>
                  </button>
                  <button class="nav-btn" data-tooltip="Tabel Transaksi" onclick="showSection('tabel'); toggleSidebar();">
                      <i class="fas fa-table"></i>
                  </button>
                  <button class="nav-btn" data-tooltip="Grafik Pengeluaran" onclick="showSection('pengeluaran'); toggleSidebar();">
                      <i class="fas fa-chart-pie"></i>
                  </button>
                  <button class="nav-btn" data-tooltip="Catatan" onclick="showSection('catatan'); toggleSidebar();">
                      <i class="fas fa-sticky-note"></i>
                  </button>
                  <button class="nav-btn" data-tooltip="Backup Data" onclick="showSection('backup'); toggleSidebar();">
                      <i class="fas fa-database"></i>
                  </button>
              </div>
          </div>
      `;
      
      document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
  }
  
  function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      const toggleBtn = document.querySelector('.sidebar-toggle');
      
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
      
      // Ganti icon toggle button
      const icon = toggleBtn.querySelector('i');
      if (sidebar.classList.contains('open')) {
          icon.className = 'fas fa-times';
      } else {
          icon.className = 'fas fa-home';
      }
  }
  
  // Tutup sidebar ketika tekan ESC
  document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
          const sidebar = document.getElementById('sidebar');
          if (sidebar.classList.contains('open')) {
              toggleSidebar();
          }
      }
  });

// ========== ENHANCED VOICE ASSISTANT ==========
  class VoiceAssistant {
      constructor() {
          this.recognition = null;
          this.synthesis = window.speechSynthesis;
          this.isListening = false;
          this.isTTSEnabled = false;
          this.currentUtterance = null;
          this.commands = {
              // ==================== NAVIGATION ====================
              'buka form': () => this.showSection('form'),
              'buka tabel': () => this.showSection('tabel'),
              'buka grafik': () => this.showSection('pengeluaran'),
              'buka chart': () => this.showSection('pengeluaran'),
              'buka catatan': () => this.showSection('catatan'),
              'buka backup': () => this.showSection('backup'),
              
              // // ==================== FORM AUTOFILL ====================
              // 'tambah pemasukan': () => this.autoFillForm('pemasukan'),
              // 'tambah pengeluaran': () => this.autoFillForm('pengeluaran'),
              // 'isi transaksi': () => this.autoFillForm(),
              // 'tambah pengeluaran makanan': () => this.autoFillForm('pengeluaran', 'makanan'),
              // 'tambah pengeluaran transportasi': () => this.autoFillForm('pengeluaran', 'transportasi dan kendaraan'),
              // 'tambah pengeluaran hiburan': () => this.autoFillForm('pengeluaran', 'hiburan'),
              // 'tambah pengeluaran tabungan': () => this.autoFillForm('pemasukan', 'tabungan'),
              
              // ==================== FILTER COMMANDS ====================
              'filter bulan ini': () => this.setCurrentMonthFilter(),
              'filter bulan lalu': () => this.setLastMonthFilter(),
              'filter minggu ini': () => this.setThisWeekFilter(),
              'filter tanggal': () => this.promptDateRange(),
              'tampilkan semua': () => this.clearFilters(),
              
              // ==================== ANALYTICS COMMANDS ====================
              'kategori terbesar': () => this.showLargestCategory(),
              'pengeluaran tertinggi': () => this.showHighestSpending(),
              'total pengeluaran': () => this.showTotalSpending(),
              'total pemasukan': () => this.showTotalIncome(),
              'saldo sekarang': () => this.showCurrentBalance(),
              'ringkasan keuangan': () => this.showFinancialSummary(),
              
              // ==================== UTILITY COMMANDS ====================
              'bantuan': () => this.showHelp(),
              'sembunyikan bantuan': () => this.hideHelp(),
              'tutup panel': () => this.hideHelp(),
              'aktifkan suara': () => this.enableTTS(),
              'matikan suara': () => this.disableTTS(),
              'hapus filter': () => this.clearFilters(),
              
              // ==================== DETAILED SUMMARY COMMANDS ====================
              'ringkasan detail': () => this.showDetailedSummary(),
              'laporan keuangan': () => this.showDetailedSummary(),
              'analisis keuangan': () => this.showFinancialAnalysis(),
              'ganti tema': () => this.showThemeSwitcher(),
              'ubah tema': () => this.showThemeSwitcher(),
              'pilih tema': () => this.showThemeSwitcher(),
              'tema aplikasi': () => this.showThemeSwitcher(),
              
              // Theme specific commands - SESUAI NAMA BARU
              'tema normal': () => this.switchThemeCommand('normal'),
              'tema macha harmoni': () => this.switchThemeCommand('macha harmony'),
              'tema lemon': () => this.switchThemeCommand('lemon'),
              'tema coffee': () => this.switchThemeCommand('coffee latte'),
              'tema twilight': () => this.switchThemeCommand('twilight bloom'),
              'tema orange': () => this.switchThemeCommand('sweet life orange'),
              'tema workspace': () => this.switchThemeCommand('workspace'),
              'tema princess': () => this.switchThemeCommand('princess'),
              'tema sea': () => this.switchThemeCommand('sea sza'),
              'tema berry': () => this.switchThemeCommand('berry garden'),
              'tema china': () => this.switchThemeCommand('china'),
              'tema nature': () => this.switchThemeCommand('nature'),
              'tema lavender productivity': () => this.switchThemeCommand('lavender productivity'),
              'tema lavender': () => this.switchThemeCommand('lavender productivity'),
              'tema cotton candy': () => this.switchThemeCommand('cotton candy'),
              'tema candy': () => this.switchThemeCommand('cotton candy'),
              'tema playground': () => this.switchThemeCommand('playground'),
              'tema orange tree': () => this.switchThemeCommand('orange tree'),
              'tema apple cider': () => this.switchThemeCommand('apple cider'),
              'tema apple': () => this.switchThemeCommand('apple cider'),
              'tema hello kitty strawberry': () => this.switchThemeCommand('hello kitty strawberry'),
              'tema hello kitty': () => this.switchThemeCommand('hello kitty strawberry'),
              'tema kitty': () => this.switchThemeCommand('hello kitty strawberry'),
              'tema macha strawberry': () => this.switchThemeCommand('macha strawberry'),
              'tema lana del rey': () => this.switchThemeCommand('lana del rey'),
              'tema lana': () => this.switchThemeCommand('lana del rey'),
              'tema morning switzerland': () => this.switchThemeCommand('morning switzerland'),
              'tema switzerland': () => this.switchThemeCommand('morning switzerland'),
              'tema daylight tide': () => this.switchThemeCommand('daylight tide'),
              'tema daylight': () => this.switchThemeCommand('daylight tide'),
              'tema sunset copenhagen': () => this.switchThemeCommand('sunset copenhagen'),
              'tema copenhagen': () => this.switchThemeCommand('sunset copenhagen'),
              'tema sunset': () => this.switchThemeCommand('sunset copenhagen'),
              'tema macha yuzu': () => this.switchThemeCommand('macha yuzu'),
              'tema yuzu': () => this.switchThemeCommand('macha yuzu'),
              'tema green lavender': () => this.switchThemeCommand('green lavender'),
              'tema fun park': () => this.switchThemeCommand('fun park'),
              'tema sunshine': () => this.switchThemeCommand('sunshine'),
              'tema sweet candy': () => this.switchThemeCommand('sweet candy'),
              // Shortcut commands dengan deskripsi yang sesuai
              'tema hijau': () => this.switchThemeCommand('macha'),
              'tema matcha': () => this.switchThemeCommand('macha'),
              'tema kuning': () => this.switchThemeCommand('lemon'),
              'tema lemonade': () => this.switchThemeCommand('lemon'),
              'tema coklat': () => this.switchThemeCommand('coffee'),
              'tema kopi': () => this.switchThemeCommand('coffee'),
              'tema ungu': () => this.switchThemeCommand('twilight'),
              'tema bunga': () => this.switchThemeCommand('twilight'),
              'tema oranye': () => this.switchThemeCommand('orange'),
              'tema jeruk': () => this.switchThemeCommand('orange'),
              'tema kerja': () => this.switchThemeCommand('workspace'),
              'tema kantor': () => this.switchThemeCommand('workspace'),
              'tema putri': () => this.switchThemeCommand('princess'),
              'tema pink': () => this.switchThemeCommand('princess'),
              'tema laut': () => this.switchThemeCommand('sea'),
              'tema biru': () => this.switchThemeCommand('sea'),
              'tema berry': () => this.switchThemeCommand('berry'),
              'tema merah': () => this.switchThemeCommand('berry'),
              'tema cina': () => this.switchThemeCommand('china'),
              'tema merah putih': () => this.switchThemeCommand('china'),
              'tema alam': () => this.switchThemeCommand('nature'),
              'tema hijau alam': () => this.switchThemeCommand('nature'),
              // ==================== BACKUP & RESTORE COMMANDS ====================
              'backup data': () => this.backupDataCommand(),
              'backup json': () => this.backupJSONCommand(),
              'backup csv': () => this.backupCSVCommand(),
              'export data': () => this.backupDataCommand(),
              'simpan backup': () => this.backupDataCommand(),
              'cadangkan data': () => this.backupDataCommand(),
              
              'restore data': () => this.showRestoreSection(),
              'import data': () => this.showRestoreSection(),
              'pulihkan data': () => this.showRestoreSection(),
              
              // ==================== CATATAN COMMANDS ====================
              'tampilkan catatan': () => this.showNotes(),
              'lihat catatan': () => this.showNotes(),
              'catatan saya': () => this.showNotes(),
              'simpan catatan': () => this.saveNotesCommand()
          };
          
          this.conversations = {
                // Greetings
                'halo': ['Halo!', 'Hi!', 'Halo juga!', 'Hai, ada yang bisa saya bantu?'],
                'hai': ['Hai!', 'Halo!', 'Hai juga!', 'Halo, semangat pagi!'],
                'hello': ['Hai!', 'Halo!', 'Hai juga!', 'Halo, semangat pagi!'],
                'selamat pagi': ['Selamat pagi!', 'Pagi! Semangat!', 'Selamat pagi, hari yang indah!'],
                'selamat siang': ['Selamat siang!', 'Siang!', 'Selamat siang, semoga harimu menyenangkan!'],
                'selamat sore': ['Selamat sore!', 'Sore!', 'Selamat sore, semoga hari ini menyenangkan!'],
                'selamat malam': ['Selamat malam!', 'Malam!', 'Selamat malam, semoga tidur nyenyak!'],
                'lagi ngapain': ['Semangat menjadi assisten', 'lagi sibuk jadi assisten nih', 'Lagi menghitung pengeluaran dan pemasukan nih!'],
                
                // Thanks
                'terima kasih': ['Sama-sama!', 'Terima kasih kembali!', 'Dengan senang hati!', 'Siap!','Santai Aja 😁', 'Siap Ellen Cantik 😘','Okeh!🫡'],
                'makasih': ['Sama-sama!', 'Terima kasih kembali!', 'Dengan senang hati!', 'Siap!','Santai Aja 😁', 'Siap Ellen Cantik 😘','Okeh!🫡'],
                'thank you': ['Sama-sama!', 'Terima kasih kembali!', 'Dengan senang hati!', 'Siap!','Santai Aja 😁', 'Siap Ellen Cantik 😘','Okeh!🫡'],
                'thanks': ['You\'re welcome!', 'No problem!', 'My pleasure!'],
                
                // Compliments
                'keren': ['Wihh makasih!', 'Haha thanks!', 'Anda juga keren!', 'Semangat!'],
                'bagus': ['Terima kasih!', 'Senang bisa membantu!', 'Makasih bang!'],
                'hebat': ['Wah terima kasih!', 'Anda juga hebat!', 'Makasih banyak!'],
                'wei': ['Wah terima kasih!', 'Anda juga hebat!', 'Makasih banyak!'],
                
                // Fun responses
                'lucu': ['Haha makasih!', 'Anda juga lucu!', 'Hehe iya deh!','yeey hahaha😁'],
                'yey': ['Haha makasih!', 'Anda juga lucu!', 'Hehe iya deh!','yeey hahaha😁'],
                'hore': ['Haha makasih!', 'Anda juga lucu!', 'Hehe iya deh!','yeey hahaha😁','horeeyy🎉'],
                'mantap nih': ['Waduh makasih!', 'Haha iya kali!', 'Anda juga mantap!'],
                'cantik': ['Aww makasih!', 'Anda juga cantik!', 'Hihi thanks!'],
                
                // Ellen Special 💖
                'pujian': ['Ellen Azra adalah yang tercantik! 💖🤤', 'Ayang Ellen Azra selalu disayang! 😘', 'Untuk Ellen Azra yang spesial! 💕'],
                'sayang ayang': ['Ayang Ellen Azra selalu dicintai! 💖', 'Cinta untuk Ellen Azra! 😘', 'Selalu sayang ayang! 💕'],
                'dari faiz': ['Cinta terbesar untuk Ellen Azra! 💖', 'Ayang yang paling spesial! 😘', 'Selalu cinta ayang! 💕'],
                
                // App related
                'aplikasi': ['Aplikasi catatan keuangan buat Ellen Azra! 💖', 'Dibuat dengan cinta oleh Faiz! 😊', 'Untuk mengelola keuangan dengan mudah!'],
                'pembuat': ['Dibuat oleh Faiz Nadzimul Azka dengan sepenuh hati! 💖', 'Faiz yang buat ini untuk Ellen Azra! 😘'],
                
                // Default fallback
                'default': ['Maaf, saya tidak mengerti. Coba katakan "bantuan" untuk melihat daftar perintah.🙏', 
                           'Bisa ulangi? Katakan "bantuan" untuk melihat apa yang bisa saya lakukan.😀',
                           'Saya belum paham. Coba katakan "buka form" atau "bantuan".☺️', 'sorry barusan ngomong apa ya? 🤔', 'Coba Ngomong yang Keras! Soalnya saya agak budeg 😁']
          };
          
          this.init();
      }
  
      init() {
          this.initSpeechRecognition();
          this.createVoiceUI();
          this.createModal();
      }
  
      initSpeechRecognition() {
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
              const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
              this.recognition = new SpeechRecognition();
              
              this.recognition.continuous = false;
              this.recognition.interimResults = false;
              this.recognition.lang = 'id-ID';
              
              this.recognition.onstart = () => {
                  this.isListening = true;
                  this.updateUI();
                  this.showStatus('Mendengarkan...');
                  
                  // STOP TTS ketika mulai mendengarkan user
                  this.stopSpeaking();
              };
              
              this.recognition.onresult = (event) => {
                  const transcript = event.results[0][0].transcript.toLowerCase();
                  this.processCommand(transcript);
              };
              
              this.recognition.onerror = (event) => {
                  console.error('Speech recognition error:', event.error);
                  this.showStatus('Error: ' + event.error);
                  this.isListening = false;
                  this.updateUI();
              };
              
              this.recognition.onend = () => {
                  this.isListening = false;
                  this.updateUI();
                  this.hideStatus(2000);
              };
          } else {
              console.warn('Speech recognition not supported');
              this.showStatus('Browser tidak support voice recognition');
          }
      }
  
      createVoiceUI() {
          const voiceHTML = `
              <div class="voice-control-container">
                  <button class="voice-btn" id="speech-btn" title="Voice Commands">
                      <i class="fas fa-microphone"></i>
                  </button>
                  <button class="voice-btn" id="tts-btn" title="Text-to-Speech">
                      <i class="fas fa-volume-up"></i>
                  </button>
                  <button class="voice-btn" id="help-btn" title="Daftar Perintah">
                      <i class="fas fa-question"></i>
                  </button>
              </div>
              
              <div class="voice-status" id="voice-status"></div>
              
              <div class="voice-commands-panel" id="voice-commands-panel">
                  <button class="panel-close" onclick="voiceAssistant.hideHelp()">
                      <i class="fas fa-times"></i>
                  </button>
                  <h4><i class="fas fa-robot"></i> Voice Commands</h4>
                  <div class="commands-grid">
                      <div class="command-item">
                          <span class="command-keyword">"buka form"</span>
                          <span class="command-desc">Buka form transaksi</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"buka tabel"</span>
                          <span class="command-desc">Buka tabel transaksi</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"buka grafik"</span>
                          <span class="command-desc">Buka chart pengeluaran</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"tambah pemasukan"</span>
                          <span class="command-desc">Siapkan form pemasukan</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"tambah pengeluaran"</span>
                          <span class="command-desc">Siapkan form pengeluaran</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"filter bulan ini"</span>
                          <span class="command-desc">Tampilkan data bulan ini</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"filter minggu ini"</span>
                          <span class="command-desc">Tampilkan data minggu ini</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"kategori terbesar"</span>
                          <span class="command-desc">Tampilkan kategori pengeluaran terbesar</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"total pengeluaran"</span>
                          <span class="command-desc">Hitung total pengeluaran</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"saldo sekarang"</span>
                          <span class="command-desc">Cek saldo terkini</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"ringkasan keuangan"</span>
                          <span class="command-desc">Ringkasan lengkap keuangan</span>
                      </div>
                      <div class="command-item">
                          <span class="command-keyword">"hapus filter"</span>
                          <span class="command-desc">Tampilkan semua data</span>
                      </div>
                  </div>
              </div>
          `;
          
          document.body.insertAdjacentHTML('beforeend', voiceHTML);
          
          // Event listeners
          document.getElementById('speech-btn').addEventListener('click', () => this.toggleListening());
          document.getElementById('tts-btn').addEventListener('click', () => this.toggleTTS());
          document.getElementById('help-btn').addEventListener('click', () => this.toggleHelp());
          
          this.updateUI();
      }
      showThemeSwitcher() {
          showThemeSwitcher();
          this.showStatus('Membuka pemilih tema');
          if (this.isTTSEnabled) {
              this.speak('Membuka menu pemilihan tema. Pilih tema yang Anda suka.');
          }
      }
      
      switchThemeCommand(themeName) {
          if (themes[themeName]) {
              switchTheme(themeName);
              this.showStatus(`Mengubah tema ke ${themeName}`);
              if (this.isTTSEnabled) {
                  const themeDescriptions = {
                      'normal': 'tema normal hijau profesional',
                      'macha': 'tema macha harmony hijau segar',
                      'lemon': 'tema lemon soda kuning cerah', 
                      'coffee': 'tema coffee coklat hangat',
                      'twilight': 'tema twilight bloom ungu romantis',
                      'orange': 'tema sweet life orange oranye manis',
                      'workspace': 'tema workspace profesional',
                      'princess': 'tema princess pink cantik',
                      'sea': 'tema sea biru laut segar',
                      'berry': 'tema berry garden merah berry',
                      'china': 'tema china merah putih elegan',
                      'nature': 'tema nature hijau alam'
                  };
                  const deskripsi = themeDescriptions[themeName] || themeName;
                  this.speak(deskripsi);
              }
          } else {
              this.showStatus(`Tema ${themeName} tidak ditemukan`);
              if (this.isTTSEnabled) {
                  this.speak(`Maaf, tema ${themeName} tidak tersedia. Coba katakan "ganti tema" untuk melihat pilihan.`);
              }
          }
      }
      
      toggleListening() {
          if (!this.recognition) {
              this.showStatus('Voice recognition tidak support');
              return;
          }
          
          if (this.isListening) {
              this.recognition.stop();
          } else {
              this.recognition.start();
          }
      }
  
      toggleTTS() {
          this.isTTSEnabled = !this.isTTSEnabled;
          this.updateUI();
          
          if (this.isTTSEnabled) {
              this.showStatus('Text-to-Speech diaktifkan');
              this.speak('Text to speech telah diaktifkan. Sekarang saya akan membacakan feedback suara.');
              document.getElementById('tts-btn').innerHTML = `<i class="fa-solid fa-volume-up"></i>`;
          } else {
              this.showStatus('Text-to-Speech dimatikan');
              document.getElementById('tts-btn').innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
              this.stopSpeaking();
          }
          
          this.hideStatus(2000);
      }
  
      toggleHelp() {
          const panel = document.getElementById('voice-commands-panel');
          panel.classList.toggle('show');
      }
  
      processCommand(transcript) {
        this.showStatus(`Anda berkata: "${transcript}"`);
        
        let commandExecuted = false;
        
        const categoryCommands = {
        // Format: [command, type, category]
        'tambah pemasukan': ['pemasukan', 'Pemasukan'],
        'gajian': ['pemasukan', 'Pemasukan'],
        'sisa ongkos': ['pemasukan', 'Pemasukan'],
        'jajan ayang faiz': ['pemasukan', 'Pemasukan'],
        
        // Kategori spesifik
        'tambah pengeluaran perawatan': ['pengeluaran', 'Perawatan Diri & Kecantikan'],
        'tambah pengeluaran kecantikan': ['pengeluaran', 'Perawatan Diri & Kecantikan'],
        'tambah pengeluaran kesehatan': ['pengeluaran', 'Kesehatan'],
        'tambah pengeluaran makanan': ['pengeluaran', 'Makanan & Minuman'],
        'tambah pengeluaran transportasi': ['pengeluaran', 'Transportasi & Kendaraan'],
        'tambah pengeluaran tagihan': ['pengeluaran', 'Tagihan & Komunikasi'],
        'tambah pengeluaran pakaian': ['pengeluaran', 'Pakaian & Aksesori'],
        'tambah pengeluaran elektronik': ['pengeluaran', 'Elektronik & Gadget'],
        'tambah pengeluaran sosial': ['pengeluaran', 'Sosial & Hadiah'],
        'tambah pengeluaran keluarga': ['pengeluaran', 'Orang Tua & Keluarga'],
        'tambah pengeluaran rumah': ['pengeluaran', 'Kebutuhan Rumah'],
        'tambah pengeluaran tabungan': ['pemasukan', 'Tabungan & Investasi'],
        'tambah pengeluaran alat': ['pengeluaran', 'Peralatan & Barang Sehari-hari'],
        'tambah pengeluaran administrasi': ['pengeluaran', 'Administrasi & Dokumen'],
        'tambah pengeluaran pribadi': ['pengeluaran', 'Kebutuhan Pribadi'],
        
        // Commands spesifik
        'beli skincare': ['pengeluaran', 'Perawatan Diri & Kecantikan'],
        'beli kosmetik': ['pengeluaran', 'Perawatan Diri & Kecantikan'],
        'cuci muka': ['pengeluaran', 'Perawatan Diri & Kecantikan'],
        'obat jerawat': ['pengeluaran', 'Perawatan Diri & Kecantikan'],
        'marina': ['pengeluaran', 'Perawatan Diri & Kecantikan'],
        'rexona': ['pengeluaran', 'Perawatan Diri & Kecantikan'],
        'minyak wangi': ['pengeluaran', 'Perawatan Diri & Kecantikan'],
        'lip balm': ['pengeluaran', 'Perawatan Diri & Kecantikan'],
        'tisu basah': ['pengeluaran', 'Kebutuhan Pribadi'],
        'tisu kering': ['pengeluaran', 'Kebutuhan Pribadi'],
        'cukuran': ['pengeluaran', 'Kebutuhan Pribadi'],
        'pembalut': ['pengeluaran', 'Kebutuhan Pribadi'],
        'masker duckbill': ['pengeluaran', 'Kebutuhan Pribadi'],
        'berobat': ['pengeluaran', 'Kesehatan'],
        'beli obat': ['pengeluaran', 'Kesehatan'],
        'makan diluar': ['pengeluaran', 'Makanan & Minuman'],
        'seblak': ['pengeluaran', 'Makanan & Minuman'],
        'beli makanan': ['pengeluaran', 'Makanan & Minuman'],
        'beli minuman': ['pengeluaran', 'Makanan & Minuman'],
        'isi bensin': ['pengeluaran', 'Transportasi & Kendaraan'],
        'bayar listrik': ['pengeluaran', 'Tagihan & Komunikasi'],
        'pulsa': ['pengeluaran', 'Tagihan & Komunikasi'],
        'bayar wifi': ['pengeluaran', 'Tagihan & Komunikasi'],
        'beli baju': ['pengeluaran', 'Pakaian & Aksesori'],
        'beli gadget': ['pengeluaran', 'Elektronik & Gadget'],
        'sedekah': ['pengeluaran', 'Sosial & Hadiah'],
        'uang orang tua': ['pengeluaran', 'Orang Tua & Keluarga'],
        'mama': ['pengeluaran', 'Orang Tua & Keluarga'],
        'papa': ['pengeluaran', 'Orang Tua & Keluarga'],
        'beli furniture': ['pengeluaran', 'Kebutuhan Rumah'],
        'setor tabungan': ['pengeluaran', 'Tabungan & Investasi'],
        'nabung': ['pengeluaran', 'Tabungan & Investasi'],
        'ojek': ['pengeluaran', 'Transportasi & Kendaraan']
    };

        // 1. Cek category commands
        for (const [command, [type, category]] of Object.entries(categoryCommands)) {
            if (transcript.includes(command)) {
                // ✅ PASS TRANSCRIPT LENGKAP sebagai deskripsi
                this.autoFillForm(type, category, transcript);
                commandExecuted = true;
                break;
            }
        }
        
        // 2. Jika tidak ketemu, cek conversation responses
        if (!commandExecuted) {
            for (const [keyword, responses] of Object.entries(this.conversations)) {
                if (transcript.includes(keyword) && keyword !== 'default') {
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    this.showStatus(randomResponse);
                    
                    if (this.isTTSEnabled) {
                        this.speak(randomResponse);
                    }
                    
                    commandExecuted = true;
                    break;
                }
            }
        }
        
        // 3. Jika masih tidak ketemu, cek fuzzy matching untuk commands
        if (!commandExecuted) {
            for (const [command, action] of Object.entries(this.commands)) {
                const similarity = this.calculateSimilarity(transcript, command);
                if (similarity > 0.7) { // 70% similarity threshold
                    action();
                    commandExecuted = true;
                    this.showStatus(`Menjalankan perintah: ${command}`);
                    if (this.isTTSEnabled) {
                        this.speak(`Menjalankan perintah: ${command}`);
                    }
                    break;
                }
            }
        }
        
        // 4. Jika benar-benar tidak ada yang match, kasih default response
        if (!commandExecuted) {
            const defaultResponses = this.conversations.default;
            const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
            this.showStatus(randomResponse);
            
            if (this.isTTSEnabled) {
                this.speak(randomResponse);
            }
        }
        
        this.hideStatus(10000);
    }

    // ==================== EASY METHOD TO ADD NEW CONVERSATIONS ====================
    addConversation(keyword, responses) {
        // Method mudah untuk nambah percakapan baru dari luar class
        if (Array.isArray(responses)) {
            this.conversations[keyword] = responses;
        } else {
            this.conversations[keyword] = [responses];
        }
        console.log(`Added conversation: ${keyword}`, this.conversations[keyword]);
    }

    // ==================== EASY METHOD TO ADD NEW COMMANDS ====================
    addCommand(command, action) {
        // Method mudah untuk nambah commands baru dari luar class
        this.commands[command] = action;
        console.log(`Added command: ${command}`);
    }

  
      calculateSimilarity(str1, str2) {
          const longer = str1.length > str2.length ? str1 : str2;
          const shorter = str1.length > str2.length ? str2 : str1;
          
          if (longer.length === 0) return 1.0;
          
          return (longer.length - this.editDistance(longer, shorter)) / parseFloat(longer.length);
      }
  
      editDistance(str1, str2) {
          const track = Array(str2.length + 1).fill(null).map(() =>
              Array(str1.length + 1).fill(null));
          
          for (let i = 0; i <= str1.length; i += 1) track[0][i] = i;
          for (let j = 0; j <= str2.length; j += 1) track[j][0] = j;
          
          for (let j = 1; j <= str2.length; j += 1) {
              for (let i = 1; i <= str1.length; i += 1) {
                  const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                  track[j][i] = Math.min(
                      track[j][i - 1] + 1, // deletion
                      track[j - 1][i] + 1, // insertion
                      track[j - 1][i - 1] + indicator // substitution
                  );
              }
          }
          
          return track[str2.length][str1.length];
      }
  
      speak(text, priority = 'normal') {
          if (!this.isTTSEnabled) return;
          
          // Stop current speech jika user mulai berbicara atau high priority
          if (this.isListening || priority === 'high') {
              this.stopSpeaking();
          }
          
          // Jika synthesis masih busy, tunggu sebentar
          if (this.synthesis.speaking) {
              setTimeout(() => this.speak(text, priority), 100);
              return;
          }
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'id-ID';
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          
          utterance.onstart = () => {
              this.currentUtterance = utterance;
          };
          
          utterance.onend = () => {
              this.currentUtterance = null;
              this.hideStatus(5000);
          };
          
          utterance.onerror = (event) => {
              console.error('Speech synthesis error:', event);
              this.currentUtterance = null;
              this.hideStatus(3000);
          };
          
          this.synthesis.speak(utterance);
      }
  
      stopSpeaking() {
          if (this.synthesis.speaking) {
              this.synthesis.cancel();
              this.currentUtterance = null;
          }
      }
      
      // ==================== BACKUP & RESTORE METHODS ====================
      backupDataCommand() {
          this.showSection('backup');
          this.showStatus('Membuka menu backup data');
          if (this.isTTSEnabled) {
              this.speak('Menu backup data dibuka. Pilih backup JSON atau CSV.');
          }
      }
      
      backupJSONCommand() {
          backupData('json');
          this.showStatus('Membuat backup JSON');
          if (this.isTTSEnabled) {
              this.speak('Backup data JSON sedang didownload.');
          }
      }
      
      backupCSVCommand() {
          backupData('csv');
          this.showStatus('Membuat backup CSV');
          if (this.isTTSEnabled) {
              this.speak('Backup data CSV sedang didownload.');
          }
      }
      
      showRestoreSection() {
          this.showSection('backup');
          this.showStatus('Membuka menu restore data');
          if (this.isTTSEnabled) {
              this.speak('Menu restore data dibuka. Pilih file JSON untuk memulihkan data.');
          }
      }
      
      // ==================== CATATAN METHODS ====================
      showNotes() {
          tampilkanCatatan();
          this.showStatus('Menampilkan catatan');
          if (this.isTTSEnabled) {
              this.speak('Menampilkan catatan Anda.');
          }
      }
      
      saveNotesCommand() {
          simpanCatatan();
          this.showStatus('Menyimpan catatan');
          if (this.isTTSEnabled) {
              this.speak('Catatan berhasil disimpan.');
          }
      }
      
      showSection(section) {
          // Use existing showSection function
          if (typeof showSection === 'function') {
              showSection(section);
          }
      }
  
      showHelp() {
          this.toggleHelp();
          if (this.isTTSEnabled) {
              this.speak('Berikut adalah daftar perintah suara yang tersedia. Katakan bantuan lagi untuk menyembunyikan.');
          }
      }
  
      hideHelp() {
          const panel = document.getElementById('voice-commands-panel');
          panel.classList.remove('show');
      }
  
      enableTTS() {
          this.isTTSEnabled = true;
          this.updateUI();
          this.speak('Text to speech telah diaktifkan');
      }
  
      disableTTS() {
          this.isTTSEnabled = false;
          this.updateUI();
          this.showStatus('Text-to-Speech dimatikan');
          this.hideStatus(2000);
      }
  
      showStatus(message) {
          const status = document.getElementById('voice-status');
          status.textContent = message;
          status.classList.add('show');
      }
  
      hideStatus(delay = 0) {
          setTimeout(() => {
              const status = document.getElementById('voice-status');
              status.classList.remove('show');
          }, delay);
      }
  
      updateUI() {
          const speechBtn = document.getElementById('speech-btn');
          const ttsBtn = document.getElementById('tts-btn');
          
          // Update speech button
          if (this.isListening) {
              speechBtn.classList.add('listening');
              speechBtn.innerHTML = '<i class="fas fa-circle"></i>';
          } else {
              speechBtn.classList.remove('listening');
              speechBtn.innerHTML = '<i class="fas fa-microphone"></i>';
          }
          
          // Update TTS button
          if (this.isTTSEnabled) {
              ttsBtn.classList.add('active');
          } else {
              ttsBtn.classList.remove('active');
          }
      }
      
      capitalize(str) {
          return str.replace(/\b\w/g, l => l.toUpperCase());
      }
      
      // ==================== FORM AUTOFILL METHODS ====================
    autoFillForm(type = null, category = null, transcript = '') {
        this.showSection('form');
        
        setTimeout(() => {
            // Set tanggal hari ini
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('tanggal').value = today;
            
            // Set jenis transaksi jika spesifik
            if (type) {
                const radio = document.querySelector(`input[name="jenis"][value="${type}"]`);
                if (radio) radio.checked = true;
            }
            
            // Set kategori jika spesifik
            if (category) {
                if (Object.keys(defaultColors).includes(category)) {
                    document.getElementById('kategori').value = category;
                    document.getElementById('kategori-lainnya').style.display = 'none';
                } else {
                    document.getElementById('kategori').value = 'lainnya';
                    document.getElementById('kategori-lainnya').style.display = 'inline';
                    document.getElementById('kategori-lainnya').value = category;
                }
            }
            
            // ✅ AUTO ISI DESKRIPSI DENGAN TRANSCRIPT
            if (transcript) {
                document.getElementById('deskripsi').value = capitalize(transcript);
            }
            
            // Focus ke jumlah
            document.getElementById('jumlah').focus();
            
            if (this.isTTSEnabled) {
                const message = type && category 
                    ? `Membuka Form, Form sudah siap. tanggal: ${today}, Jenis: ${type}, Deskripsi: ${transcript}, Kategori: ${category}, Form Sudah ready!, Silahkan isi jumlah dengan manual, Lalu Simpan Transaksi.`
                    : `Membuka Form siap. Deskripsi: ${transcript}`;
                this.speak(message);
            }
            
            this.showStatus(`Form siap! Deskripsi: "${transcript}"`);
        }, 500);
    }

    // ==================== FILTER METHODS ====================
    setCurrentMonthFilter() {
        const now = new Date();
        const month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        
        document.getElementById('filter-bulan-tabel').value = month;
        document.getElementById('filter-bulan-pengeluaran').value = month;
        
        this.applyFilters();
        this.showStatus(`Filter bulan ${this.getMonthName(now.getMonth())} ${now.getFullYear()} diterapkan`);
        
        if (this.isTTSEnabled) {
            this.speak(`Menampilkan data bulan ${this.getMonthName(now.getMonth())}`);
        }
    }

    setLastMonthFilter() {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const month = lastMonth.getFullYear() + '-' + String(lastMonth.getMonth() + 1).padStart(2, '0');
        
        document.getElementById('filter-bulan-tabel').value = month;
        document.getElementById('filter-bulan-pengeluaran').value = month;
        
        this.applyFilters();
        this.showStatus(`Filter bulan ${this.getMonthName(lastMonth.getMonth())} ${lastMonth.getFullYear()} diterapkan`);
        
        if (this.isTTSEnabled) {
            this.speak(`Menampilkan data bulan lalu ${this.getMonthName(lastMonth.getMonth())}`);
        }
    }

    setThisWeekFilter() {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Minggu
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // Sabtu
        
        document.getElementById('filter-tanggal-mulai-tabel').value = startOfWeek.toISOString().split('T')[0];
        document.getElementById('filter-tanggal-selesai-tabel').value = endOfWeek.toISOString().split('T')[0];
        document.getElementById('filter-tanggal-mulai-pengeluaran').value = startOfWeek.toISOString().split('T')[0];
        document.getElementById('filter-tanggal-selesai-pengeluaran').value = endOfWeek.toISOString().split('T')[0];
        
        // Switch to date range filter
        document.getElementById('filter-tanggal-tabel').value = 'rentang';
        document.getElementById('filter-tanggal-pengeluaran').value = 'rentang';
        toggleFilterType('tabel');
        toggleFilterType('pengeluaran');
        
        this.applyFilters();
        this.showStatus('Filter minggu ini diterapkan');
        
        if (this.isTTSEnabled) {
            this.speak('Menampilkan data minggu ini');
        }
    }

    promptDateRange() {
        this.showStatus('Silakan atur rentang tanggal manual di filter');
        if (this.isTTSEnabled) {
            this.speak('Silakan atur rentang tanggal mulai dan selesai di bagian filter');
        }
    }

    clearFilters() {
        // Reset semua filter
        document.getElementById('filter-bulan-tabel').value = '';
        document.getElementById('filter-bulan-pengeluaran').value = '';
        document.getElementById('filter-tanggal-mulai-tabel').value = '';
        document.getElementById('filter-tanggal-selesai-tabel').value = '';
        document.getElementById('filter-tanggal-mulai-pengeluaran').value = '';
        document.getElementById('filter-tanggal-selesai-pengeluaran').value = '';
        document.getElementById('search-deskripsi').value = '';
        document.getElementById('search-kategori').value = '';
        
        // Reset ke filter bulan
        document.getElementById('filter-tanggal-tabel').value = 'bulan';
        document.getElementById('filter-tanggal-pengeluaran').value = 'bulan';
        toggleFilterType('tabel');
        toggleFilterType('pengeluaran');
        
        this.applyFilters();
        this.showStatus('Semua filter dihapus');
        
        if (this.isTTSEnabled) {
            this.speak('Semua filter telah dihapus, menampilkan semua data');
        }
    }

    applyFilters() {
        saveFilterToLocalStorage();
        loadTransaksi();
        loadPengeluaranKategori();
        updateChart();
    }

    // ==================== ANALYTICS METHODS ====================
    async showLargestCategory() {
        try {
            const transaksiList = await getAllTransaksi();
            const kategoriMap = {};
            
            transaksiList.forEach(t => {
                if (t.type === 'pengeluaran') {
                    if (!kategoriMap[t.category]) {
                        kategoriMap[t.category] = 0;
                    }
                    kategoriMap[t.category] += t.amount;
                }
            });
            
            if (Object.keys(kategoriMap).length === 0) {
                this.showStatus('Tidak ada data pengeluaran');
                if (this.isTTSEnabled) this.speak('Belum ada data pengeluaran');
                return;
            }
            
            const largestCategory = Object.entries(kategoriMap).reduce((a, b) => 
                a[1] > b[1] ? a : b
            );
            
            const message = `Kategori pengeluaran terbesar: ${largestCategory[0]} sebesar ${formatRupiah(largestCategory[1])}`;
            this.showStatus(message);
            
            if (this.isTTSEnabled) {
                this.speak(`Kategori pengeluaran terbesar adalah ${largestCategory[0]} dengan jumlah ${this.formatSpeechAmount(largestCategory[1])} rupiah`);
            }
            
        } catch (error) {
            console.error('Error analyzing categories:', error);
            this.showStatus('Error menganalisis kategori');
        }
    }

    async showHighestSpending() {
        try {
            const transaksiList = await getAllTransaksi();
            const pengeluaran = transaksiList.filter(t => t.type === 'pengeluaran');
            
            if (pengeluaran.length === 0) {
                this.showStatus('Tidak ada data pengeluaran');
                if (this.isTTSEnabled) this.speak('Belum ada data pengeluaran');
                return;
            }
            
            const highest = pengeluaran.reduce((max, t) => 
                t.amount > max.amount ? t : max
            );
            
            const message = `Pengeluaran tertinggi: ${highest.description} sebesar ${formatRupiah(highest.amount)}`;
            this.showStatus(message);
            
            if (this.isTTSEnabled) {
                this.speak(`Pengeluaran tertinggi adalah ${highest.description} dengan jumlah ${this.formatSpeechAmount(highest.amount)} rupiah`);
            }
            
        } catch (error) {
            console.error('Error analyzing spending:', error);
            this.showStatus('Error menganalisis pengeluaran');
        }
    }

    async showTotalSpending() {
        try {
            const transaksiList = await getAllTransaksi();
            const total = transaksiList
                .filter(t => t.type === 'pengeluaran')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const message = `Total pengeluaran: ${formatRupiah(total)}`;
            this.showStatus(message);
            
            if (this.isTTSEnabled) {
                this.speak(`Total pengeluaran Anda adalah ${this.formatSpeechAmount(total)} rupiah`);
            }
            
        } catch (error) {
            console.error('Error calculating total spending:', error);
            this.showStatus('Error menghitung total pengeluaran');
        }
    }

    async showTotalIncome() {
        try {
            const transaksiList = await getAllTransaksi();
            const total = transaksiList
                .filter(t => t.type === 'pemasukan')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const message = `Total pemasukan: ${formatRupiah(total)}`;
            this.showStatus(message);
            
            if (this.isTTSEnabled) {
                this.speak(`Total pemasukan Anda adalah ${this.formatSpeechAmount(total)} rupiah`);
            }
            
        } catch (error) {
            console.error('Error calculating total income:', error);
            this.showStatus('Error menghitung total pemasukan');
        }
    }

    async showCurrentBalance() {
        try {
            const transaksiList = await getAllTransaksi();
            let saldo = 0;
            
            transaksiList.forEach(t => {
                if (t.type === 'pemasukan') {
                    saldo += t.amount;
                } else {
                    saldo -= t.amount;
                }
            });
            
            const message = `Saldo saat ini: ${formatRupiah(saldo)}`;
            this.showStatus(message);
            
            if (this.isTTSEnabled) {
                const status = saldo >= 0 ? 'positif' : 'negatif';
                this.speak(`Saldo Anda saat ini adalah ${this.formatSpeechAmount(Math.abs(saldo))} rupiah ${status}`);
            }
            
        } catch (error) {
            console.error('Error calculating balance:', error);
            this.showStatus('Error menghitung saldo');
        }
    }

    async showFinancialSummary() {
        try {
            const transaksiList = await getAllTransaksi();
            const pemasukan = transaksiList.filter(t => t.type === 'pemasukan')
                .reduce((sum, t) => sum + t.amount, 0);
            const pengeluaran = transaksiList.filter(t => t.type === 'pengeluaran')
                .reduce((sum, t) => sum + t.amount, 0);
            const saldo = pemasukan - pengeluaran;
            
            const message = `Ringkasan: Pemasukan ${formatRupiah(pemasukan)}, Pengeluaran ${formatRupiah(pengeluaran)}, Saldo ${formatRupiah(saldo)}`;
            this.showStatus(message);
            
            if (this.isTTSEnabled) {
                this.speak(`Ringkasan keuangan: Pemasukan ${this.formatSpeechAmount(pemasukan)} rupiah, Pengeluaran ${this.formatSpeechAmount(pengeluaran)} rupiah, Saldo ${this.formatSpeechAmount(saldo)} rupiah`);
            }
            
        } catch (error) {
            console.error('Error generating summary:', error);
            this.showStatus('Error membuat ringkasan');
        }
    }

    // ==================== HELPER METHODS ====================
    formatSpeechAmount(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + ' juta';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + ' ribu';
        }
        return amount.toString();
    }

    getMonthName(monthIndex) {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return months[monthIndex];
    }
    
    // ==================== ENHANCED ANALYTICS WITH MODAL ====================
    async showDetailedSummary() {
        try {
            const transaksiList = await getAllTransaksi();
            
            // Filter by current month default
            const now = new Date();
            const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
            const monthlyData = transaksiList.filter(t => t.date.startsWith(currentMonth));
            
            const allTimeData = transaksiList;
            
            // Calculate statistics
            const monthlyStats = this.calculateStatistics(monthlyData);
            const allTimeStats = this.calculateStatistics(allTimeData);
            
            // Crete modal content
            const modalContent = `
                <div class="summary-section">
                    <h4 class="summary-section-title">
                        <i class="fas fa-calendar"></i> Bulan Ini (${this.getMonthName(now.getMonth())})
                    </h4>
                    <div class="summary-item">
                        <span class="summary-label">Total Pemasukan</span>
                        <span class="summary-value positive">${formatRupiah(monthlyStats.totalIncome)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Pengeluaran</span>
                        <span class="summary-value negative">${formatRupiah(monthlyStats.totalSpending)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Saldo Bulan Ini</span>
                        <span class="summary-value ${monthlyStats.balance >= 0 ? 'positive' : 'negative'}">
                            ${formatRupiah(monthlyStats.balance)}
                        </span>
                    </div>
                    
                    <div class="category-breakdown">
                        <div class="summary-section-title">Pengeluaran per Kategori</div>
                        ${monthlyStats.topCategories.map(cat => `
                            <div class="category-item">
                                <span class="category-name">${cat.name}</span>
                                <span class="category-amount">${formatRupiah(cat.amount)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="summary-section">
                    <h4 class="summary-section-title">
                        <i class="fas fa-chart-bar"></i> Seluruh Waktu
                    </h4>
                    <div class="summary-item">
                        <span class="summary-label">Total Pemasukan</span>
                        <span class="summary-value positive">${formatRupiah(allTimeStats.totalIncome)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total Pengeluaran</span>
                        <span class="summary-value negative">${formatRupiah(allTimeStats.totalSpending)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Saldo Akhir</span>
                        <span class="summary-value ${allTimeStats.balance >= 0 ? 'positive' : 'negative'}">
                            ${formatRupiah(allTimeStats.balance)}
                        </span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Rata-rata Pengeluaran/Bulan</span>
                        <span class="summary-value">${formatRupiah(allTimeStats.avgMonthlySpending)}</span>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h4 class="summary-section-title">
                        <i class="fas fa-lightbulb"></i> Insight
                    </h4>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; font-size: 0.9em;">
                        <p>${this.generateInsight(monthlyStats, allTimeStats)}</p>
                    </div>
                </div>
            `;
            
            this.showModal('Ringkasan Keuangan Detail', modalContent);
            
            // Berikan ringkasan suara juga
            if (this.isTTSEnabled) {
                const speechSummary = `
                    Ringkasan bulan ${this.getMonthName(now.getMonth())}: 
                    Pemasukan ${this.formatSpeechAmount(monthlyStats.totalIncome)} rupiah,
                    Pengeluaran ${this.formatSpeechAmount(monthlyStats.totalSpending)} rupiah,
                    Saldo ${this.formatSpeechAmount(monthlyStats.balance)} rupiah.
                    ${monthlyStats.topCategories.length > 0 ? 
                        `Kategori pengeluaran terbesar: ${monthlyStats.topCategories[0].name}` : 
                        ''}
                `;
                this.speak(speechSummary);
            }
            
        } catch (error) {
            console.error('Error generating detailed summary:', error);
            this.showStatus('Error membuat ringkasan detail');
        }
    }

    calculateStatistics(transactions) {
        const totalIncome = transactions
            .filter(t => t.type === 'pemasukan')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalSpending = transactions
            .filter(t => t.type === 'pengeluaran')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const balance = totalIncome - totalSpending;
        
        // Calculate categories
        const categoryMap = {};
        transactions
            .filter(t => t.type === 'pengeluaran')
            .forEach(t => {
                categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
            });
            
        const topCategories = Object.entries(categoryMap)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
            
        // Calculate average monthly spending (simplified)
        const uniqueMonths = new Set(transactions.map(t => t.date.substring(0, 7))).size;
        const avgMonthlySpending = uniqueMonths > 0 ? Math.round(totalSpending / uniqueMonths) : 0;
        
        return {
            totalIncome,
            totalSpending,
            balance,
            topCategories,
            avgMonthlySpending
        };
    }

    generateInsight(monthlyStats, allTimeStats) {
        const insights = [];
        
        if (monthlyStats.balance < 0) {
            insights.push("💡 Anda mengalami defisit bulan ini. Perlu evaluasi pengeluaran.");
        } else if (monthlyStats.balance > monthlyStats.totalIncome * 0.3) {
            insights.push("💡 Tabungan bulan ini sangat baik! Pertahankan!");
        }
        
        if (monthlyStats.totalSpending > allTimeStats.avgMonthlySpending * 1.2) {
            insights.push("💡 Pengeluaran bulan ini lebih tinggi dari rata-rata.");
        }
        
        if (monthlyStats.topCategories.length > 0) {
            const largestCategory = monthlyStats.topCategories[0];
            insights.push(`💡 Pengeluaran terbesar di kategori: ${largestCategory.name}`);
        }
        
        return insights.length > 0 ? insights.join(' ') : "💡 Pola keuangan Anda stabil. Pertahankan!";
    }

    async showFinancialAnalysis() {
        // Similar to showDetailedSummary but with more advanced analytics
        this.showDetailedSummary(); // Untuk sekarang sama dulu
    }
    
    createModal() {
      const modalHTML = `
          <div class="voice-modal-overlay" id="voice-modal-overlay"></div>
          <div class="voice-modal" id="voice-modal">
              <div class="voice-modal-header">
                  <h3 class="voice-modal-title">
                      <i class="fas fa-chart-line"></i>
                      <span id="modal-title">Ringkasan Keuangan</span>
                  </h3>
                  <button class="voice-modal-close" onclick="voiceAssistant.hideModal()">
                      <i class="fas fa-times"></i>
                  </button>
              </div>
              <div class="voice-modal-content" id="modal-content">
                  <!-- Content akan diisi dynamically -->
              </div>
          </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      // Close modal ketika klik overlay
      document.getElementById('voice-modal-overlay').addEventListener('click', () => {
          this.hideModal();
      });
      
      // Close modal dengan ESC key
      document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
              this.hideModal();
          }
      });
  }

  showModal(title, content) {
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-content').innerHTML = content;
      
      document.getElementById('voice-modal-overlay').classList.add('show');
      document.getElementById('voice-modal').classList.add('show');
      
      // Stop TTS jika sedang berbicara
      this.stopSpeaking();
  }

    hideModal() {
        document.getElementById('voice-modal-overlay').classList.remove('show');
        document.getElementById('voice-modal').classList.remove('show');
    }
  }
  
  // ========== THEME SWITCHER SYSTEM ==========
        const themes = {
            'normal': 'style.css',
            'macha harmony': 'theme-macha-harmony.css',
            'lemon': 'theme-lemon-soda.css',
            'coffee latte': 'theme-coffee.css',
            'twilight bloom': 'theme-twilightBloom.css',
            'sweet life orange': 'theme-sweet-life-orange.css',
            'workspace': 'theme-workspace.css',
            'princess': 'theme-princess.css',
            'sea sza': 'theme-seaSza.css',
            'berry garden': 'theme-berryGarden.css',
            'china': 'theme-china.css',
            'nature': 'theme-nature.css',
            'botanic': 'theme-botanic.css',
            'lavender productivity': 'theme-lavender.css',
            'cotton candy': 'theme-candy.css',
            'playground': 'theme-playground.css',
            'orange tree': 'theme-orange-tree.css',
            'apple cider': 'theme-apple.css',
            'hello kitty strawberry': 'theme-hello-kitty.css',
            'macha strawberry': 'theme-macha-strawberry.css',
            'lana del rey': 'theme-lanaDelRey.css',
            'morning switzerland': 'theme-switzerland.css',
            'daylight tide': 'theme-daylight.css',
            'sunset copenhagen': 'theme-sunset-copenhagen.css',
            'macha yuzu': 'theme-macha-yuzu.css',
            'green lavender': 'theme-green-lavender.css',
            'fun park': 'theme-fun-park.css',
            'sunshine': 'theme-sunshine.css',
            'sweet candy': 'theme-sweet-candy.css'
        };
        
        let currentTheme = 'normal';
        
        // Theme Switcher Functions
        function showThemeSwitcher() {
            const modal = document.getElementById('theme-switcher-modal');
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                updateThemeBadges();
            }
        }
        
        function closeThemeSwitcher() {
            const modal = document.getElementById('theme-switcher-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
        
        function updateThemeBadges() {
            // Reset semua badge dulu
            document.querySelectorAll('.theme-badge').forEach(badge => {
                badge.textContent = 'Pilih';
                badge.style.background = '#e9ecef';
                badge.style.color = '#6c757d';
            });
        
            // ✅ HANDLE SPASI DI ID: replace spasi dengan dash
            const activeBadgeId = `badge-${currentTheme.replace(/\s+/g, '-')}`;
            const activeBadge = document.getElementById(activeBadgeId);
            
            if (activeBadge) {
                activeBadge.textContent = '✓ Aktif';
                activeBadge.style.background = 'var(--success, #4caf50)';
                activeBadge.style.color = 'white';
            }
        }
        
        function switchTheme(themeName) {
            if (!themes[themeName]) return;
            
            const themeLink = document.getElementById('main-theme');
            if (themeLink) {
                themeLink.href = themes[themeName];
                currentTheme = themeName;
                
                // Simpan preference
                localStorage.setItem('selectedTheme', themeName);
                
                // Update UI
                updateThemeBadges();
                
                const deskripsi = getThemeDesc(themeName);
                
                // Voice feedback
                if (voiceAssistant) {
                    voiceAssistant.showStatus(`🎨 Tema diubah ke: ${capitalize(themeName)}`);
                    if (voiceAssistant.isTTSEnabled) {
                        voiceAssistant.speak(`Tema diubah ke ${themeName}, deskripsi singkat untuk tema ini : ${deskripsi}`);
                    }
                }
            }
        }
        
        function testCurrentTheme() {
            if (voiceAssistant) {
                voiceAssistant.speak(`Ini adalah suara test dengan tema ${currentTheme}. Suara tetap sama untuk semua tema.`);
            }
        }
        
        // Load saved theme on startup
        function loadSavedTheme() {
            const savedTheme = localStorage.getItem('selectedTheme');
            if (savedTheme && themes[savedTheme]) {
                console.log('🎨 Loading saved theme:', savedTheme);
                switchTheme(savedTheme);
            } else {
                console.log('🎨 Using default theme: normal');
                switchTheme('normal');
            }
        }
        
        // Generate theme options dynamically
        function generateThemeOptions() {
            const container = document.querySelector('.theme-selection');
            if (!container) return;
        
            container.innerHTML = ''; // Clear
        
            Object.entries(themes).forEach(([key, path]) => {
                const option = createThemeOption(key, path);
                container.appendChild(option);
            });
        
            updateThemeBadges();
        }
        
        function createThemeOption(key, path) {
            const div = document.createElement('div');
            div.className = 'theme-option';
            div.onclick = () => switchTheme(key);
            div.dataset.theme = key;
        
            // ✅ HANDLE SPASI DI CLASS NAME: replace spasi dengan dash
            const themeClass = key.replace(/\s+/g, '-') + '-theme';
        
            div.innerHTML = `
                <div class="theme-preview ${themeClass}">
                    <div class="theme-header"></div>
                    <div class="theme-content">
                        <div class="theme-card"></div>
                        <div class="theme-button primary"></div>
                        <div class="theme-button success"></div>
                    </div>
                </div>
                <div class="theme-info">
                    <h4>${getThemeEmoji(key)} ${capitalize(key)}</h4>
                    <p>${getThemeDesc(key)}</p>
                    <span class="theme-badge" id="badge-${key.replace(/\s+/g, '-')}">Pilih</span>
                </div>
            `;
            return div;
        }
        
        function getThemeEmoji(key) {
            const map = {
                'normal': '🏪', 'macha harmony': '🌿',
                'lemon': '🍋', 'coffee latte': '☕',
                'twilight bloom': '🟪', 'sweet life orange': '🍊', 'workspace': '🖥️',
                'princess': '👑', 'sea sza': '🌊',
                'berry garden': '🍇', 'china': '🈴', 'nature': '🍃', 'botanic': '🌼', 'lavender productivity': '💜', 'cotton candy': '🍭', 'playground': '🎨', 'orange tree': '🍊', 'apple cider': '🍎', 'hello kitty strawberry': '🎀', 'macha strawberry': '🍓', 'lana del rey': '🌹', 'morning switzerland': '🇨🇭', 'daylight tide': '🌊', 'sunset copenhagen': '🌇', 'macha yuzu': '🍋', 'green lavender': '🪻', 'fun park': '🎡', 'sunshine': '🔅', 'sweet candy': '🍬'
                
            };
            return map[key] || '🎨';
        }
        
        function getThemeDesc(key) {
            const map = {
                'normal': 'Default hijau profesional',
                'macha harmony': 'Nuansa Hijau Matcha Segar & Earthy',
                'lemon': 'Nuansa Kuning Lemon Fresh & Bubbly',
                'coffee latte': 'warna cokelat yang hangat dan earthy',
                'twilight bloom': 'kombinasi ungu dan pink pastel yang lembut',
                'sweet life orange': 'palet warna oranye yang ceria dan hangat',
                'workspace': 'palet abu-abu dan hitam yang netral',
                'princess': 'warna pink yang feminin dan mewah',
                'sea sza': 'palet biru laut yang tenang dan segar',
                'berry garden': 'palet warna ungu dan oranye yang lembut',
                'china': 'palet merah dan kuning yang bold',
                'nature': 'palet warna hijau segar yang alami',
                'botanic': 'Botanic Mocha menghadirkan suasana hangat dan lembut yang terinspirasi dari warna kopi, bunga, dan alam.',
                'lavender productivity': 'Memadukan nuansa ungu pastel, pink lembut, dan biru muda untuk tampilan yang tenang namun fokus.', 'cotton candy': 'Menghadirkan suasana manis dan lembut seperti gula kapas di langit sore.', 'playground': 'Terinspirasi dari warna mainan retro dan jadwal pelajar yang ceria.', 'orange tree': 'Memadukan warna oranye hangat, hijau zaitun, dan ungu pastel lembut yang terinspirasi dari pepohonan jeruk di sore hari.', 'apple cider': 'Suasana sore musim gugur, hangat, cozy, dan sedikit nostalgia.', 'hello kitty strawberry': 'Memadukan nuansa merah muda lembut, hijau segar, dan merah ceria yang terinspirasi dari dunia manis Hello Kitty.', 'macha strawberry': 'Menggabungkan kelembutan warna pink stroberi dengan kesejukan hijau matcha.', 'lana del rey': 'Terinspirasi dari gaya vintage, dreamy, dan melancholic khas Lana Del Rey.', 'morning switzerland': 'Pagi yang tenang di pedesaan Swiss, nuansa hijau alami, coklat kayu, dan biru langit dingin.', 'daylight tide': 'Perpaduan biru laut dan kuning matahari pagi.', 'sunset copenhagen': 'Menghadirkan nuansa hangat keemasan matahari terbenam di atas kanal dan bangunan bata khas Kopenhagen.', 'macha yuzu': 'Memadukan kesejukan hijau matcha dan semangat citrus yuzu.', 'green lavender': 'Menampilkan keseimbangan antara hijau yang menenangkan dan lavender lembut yang feminin.', 'fun park': 'Suasana taman hiburan yang ceria, penuh warna dan menyenangkan.', 'sunshine': 'Menghadirkan energi pagi yang lembut dan positif.', 'sweet candy': 'Menghadirkan suasana manis, lembut, dan menenangkan seperti hari yang penuh warna pastel.'
            };
            return map[key] || 'Tema custom';
        }
        
        function capitalize(str) {
            return str.replace(/\b\w/g, l => l.toUpperCase());
        }
        
        // Close modal ketika klik di luar
        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('theme-switcher-modal');
            if (modal) {
                modal.addEventListener('click', function(event) {
                    if (event.target === this) {
                        closeThemeSwitcher();
                    }
                });
            }
        });
          
          // Di createVoiceUI() atau di sidebar, tambah tombol theme
        function addThemeButtonToUI() {
            const themeBtn = document.createElement('button');
            themeBtn.className = 'nav-btn';
            themeBtn.innerHTML = '<i class="fas fa-palette"></i>';
            themeBtn.title = 'Ganti Tema';
            themeBtn.onclick = showThemeSwitcher;
            
            // Tambahkan ke sidebar atau voice control container
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                const nav = sidebar.querySelector('.sidebar-nav');
                if (nav) {
                    nav.appendChild(themeBtn);
                }
            }
        }
  
          async function hitungUkuranIndexedDB() {
              return new Promise((resolve, reject) => {
                  try {
                      // Buka database untuk mendapatkan estimasi ukuran
                      const request = indexedDB.open('keuanganDB');
                      
                      request.onsuccess = function(event) {
                          const db = event.target.result;
                          
                          // Hitung ukuran dari semua object stores
                          let totalSize = 0;
                          const transaction = db.transaction(['transactions'], 'readonly');
                          const store = transaction.objectStore('transactions');
                          const countRequest = store.count();
                          
                          countRequest.onsuccess = function() {
                              const jumlahData = countRequest.result;
                              
                              // Estimasi kasar: setiap transaksi ~200-500 bytes
                              // Kita ambil rata-rata 350 bytes per transaksi
                              const estimasiUkuran = jumlahData * 350;
                              
                              db.close();
                              resolve(estimasiUkuran);
                          };
                          
                          countRequest.onerror = function() {
                              db.close();
                              reject(new Error('Gagal menghitung jumlah data'));
                          };
                      };
                      
                      request.onerror = function() {
                          reject(new Error('Gagal membuka database'));
                      };
                      
                  } catch (error) {
                      reject(error);
                  }
              });
          }
          
          // Fungsi pantauStorage yang diperbarui
          async function pantauStorage() {
              try {
                  // Hitung ukuran IndexedDB
                  const ukuranBytes = await hitungUkuranIndexedDB();
                  
                  // Konversi ke format yang mudah dibaca
                  let usage, format;
                  
                  if (ukuranBytes < 1024) {
                      usage = ukuranBytes;
                      format = 'bytes';
                  } else if (ukuranBytes < 1024 * 1024) {
                      usage = (ukuranBytes / 1024).toFixed(2);
                      format = 'KB';
                  } else {
                      usage = (ukuranBytes / (1024 * 1024)).toFixed(2);
                      format = 'MB';
                  }
                  
                  // Tampilkan di UI
                  document.getElementById('storage-usage').innerHTML = `
                      <i class="fas fa-database"></i> 
                      Penggunaan Storage: ${usage} ${format} 
                      <span style="font-size:12px;color:#6c757d">(${ukuranBytes.toLocaleString()} bytes) / 50 MB</span>
                  `;
                  
                  // Warning jika mendekati limit
                  if (ukuranBytes > quotaLimit * 0.8) {
                      document.getElementById('storage-usage').style.background = 'linear-gradient(135deg, #ff6b6b 0%, #c04848 100%)';
                      document.getElementById('storage-usage').style.color = 'white';
                      showNotification('Peringatan: Storage hampir penuh!', 'error');
                  } else if (ukuranBytes > quotaLimit * 0.6) {
                      document.getElementById('storage-usage').style.background = 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
                      document.getElementById('storage-usage').style.color = 'white';
                  } else {
                      document.getElementById('storage-usage').style.background = '';
                      document.getElementById('storage-usage').style.color = '';
                  }
                  
              } catch (error) {
                  console.error("Error pantau storage:", error);
                  document.getElementById('storage-usage').textContent = 
                      'Error menghitung penggunaan storage';
              }
          }
        
          function saveColors() {
              try {
                  const savedColors = {};
                  document.querySelectorAll('.color-item').forEach(item => {
                      const kategori = item.querySelector('strong').textContent.replace(':', '');
                      const safeId = kategori.replace(/\s+/g, '-');
                      const useGradient = document.getElementById(`gradient-${safeId}`).checked;
                      
                      if (useGradient) {
                          savedColors[kategori] = {
                              gradient: true,
                              color1: document.getElementById(`hex-${safeId}`).value,
                              color2: document.getElementById(`hex2-${safeId}`).value
                          };
                      } else {
                          savedColors[kategori] = {
                              gradient: false,
                              color: document.getElementById(`hex-${safeId}`).value
                          };
                      }
                  });
                  localStorage.setItem('chartColors', JSON.stringify(savedColors));
              } catch (error) {
                  console.error("Error save colors:", error);
              }
          }
        
          function loadColors() {
              try {
                  const savedColors = JSON.parse(localStorage.getItem('chartColors')) || {};
                  // Warna akan di-load di updateColorEditor
              } catch (error) {
                  console.error("Error load colors:", error);
              }
          }
          
          // Fungsi Backup Data
          async function backupData(format) {
              try {
                  const transactions = await getAllTransaksi();
                  const catatan = localStorage.getItem('catatan') || '';
                  const chartColors = JSON.parse(localStorage.getItem('chartColors')) || {};
                  
                  const data = {
                      transactions,
                      catatan,
                      chartColors,
                      backupDate: new Date().toISOString(),
                      version: '1.0'
                  };
        
                  let content, filename, mimeType;
        
                  if (format === 'json') {
                      content = JSON.stringify(data, null, 2);
                      filename = `backup-keuangan-${new Date().toISOString().split('T')[0]}.json`;
                      mimeType = 'application/json';
                  } else if (format === 'csv') {
                      // Header CSV
                      let csvContent = 'Tanggal,Jenis,Kategori,Deskripsi,Jumlah\n';
                      
                      // Data transaksi
                      transactions.forEach(transaction => {
                          const row = [
                              transaction.date,
                              transaction.type,
                              `"${transaction.category}"`,
                              `"${transaction.description}"`,
                              transaction.amount
                          ].join(',');
                          
                          csvContent += row + '\n';
                      });
                      
                      content = csvContent;
                      filename = `backup-keuangan-${new Date().toISOString().split('T')[0]}.csv`;
                      mimeType = 'text/csv';
                  }
        
                  // Buat blob dan download
                  const blob = new Blob([content], { type: mimeType });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  
                  // Bersihkan
                  setTimeout(() => {
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                  }, 100);
        
                  showNotification(`Backup ${format.toUpperCase()} berhasil didownload!`, 'success');
              } catch (error) {
                  console.error('Error backup data:', error);
                  showNotification('Gagal melakukan backup data.', 'error');
              }
          }
        
          // Fungsi Handle File Select untuk Restore
          function handleFileSelect(event) {
              const file = event.target.files[0];
              const fileNameSpan = document.getElementById('restore-filename');
              const restoreBtn = document.getElementById('restore-btn');
              
              if (file && file.name.endsWith('.json')) {
                  fileNameSpan.textContent = file.name;
                  restoreBtn.disabled = false;
              } else {
                  fileNameSpan.textContent = '';
                  restoreBtn.disabled = true;
                  showNotification('Harap pilih file JSON yang valid.', 'error');
              }
          }
        
          // Fungsi Restore Data
          async function restoreData() {
              const fileInput = document.getElementById('restore-file');
              const file = fileInput.files[0];
              
              if (!file) {
                  showNotification('Harap pilih file terlebih dahulu.', 'error');
                  return;
              }
        
              try {
                  const fileContent = await readFileAsText(file);
                  const data = JSON.parse(fileContent);
                  
                  // Validasi data
                  if (!data.transactions || !Array.isArray(data.transactions)) {
                      throw new Error('Format file tidak valid');
                  }
                  
                  // Konfirmasi restore (karena akan menghapus data existing)
                  if (confirm('Restore data akan menggantikan semua data yang ada. Lanjutkan?')) {
                      // Hapus semua data existing
                      await clearAllData();
                      
                      // Simpan transactions ke IndexedDB
                      for (const transaction of data.transactions) {
                          await simpanTransaksi(transaction);
                      }
                      
                      // Simpan data lainnya ke localStorage
                      if (data.catatan) {
                          localStorage.setItem('catatan', data.catatan);
                      }
                      
                      if (data.chartColors) {
                          localStorage.setItem('chartColors', JSON.stringify(data.chartColors));
                      }
                      
                      // Reload data
                      loadTransaksi();
                      loadPengeluaranKategori();
                      updateChart();
                      loadCatatan();
                      await pantauStorage();
                      showNotification('Restore data berhasil!', 'success');
                      
                      // Reset form
                      fileInput.value = '';
                      document.getElementById('restore-filename').textContent = '';
                      document.getElementById('restore-btn').disabled = true;
                  }
              } catch (error) {
                  console.error('Error restore data:', error);
                  showNotification('Gagal restore data. Pastikan file JSON valid.', 'error');
              }
          }
        
          // Fungsi Bantu: Membaca File sebagai Text
          function readFileAsText(file) {
              return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  
                  reader.onload = event => resolve(event.target.result);
                  reader.onerror = error => reject(error);
                  
                  reader.readAsText(file);
              });
          }
        
          // Fungsi Bantu: Hapus Semua Data
          async function clearAllData() {
              return new Promise((resolve, reject) => {
                  try {
                      const transaction = db.transaction([storeName], "readwrite");
                      const store = transaction.objectStore(storeName);
                      const request = store.clear();
                      
                      request.onsuccess = () => { 
                        pantauStorage();
                        resolve();
                      };
                      request.onerror = (event) => reject(event.target.error);
                  } catch (error) {
                      reject(error);
                  }
              });
          }
        
          document.getElementById('kategori').addEventListener('change', (e) => {
              const lainnya = document.getElementById('kategori-lainnya');
              lainnya.style.display = e.target.value === 'lainnya' ? 'inline' : 'none';
          });
        
          function initTahunOptions() {
              const tahunSelectTabel = document.getElementById('filter-tahun-tabel');
              const tahunSelectPengeluaran = document.getElementById('filter-tahun-pengeluaran');
              const currentYear = new Date().getFullYear();
              
              // Kosongkan dulu
              tahunSelectTabel.innerHTML = '<option value="">Semua Tahun</option>';
              tahunSelectPengeluaran.innerHTML = '<option value="">Semua Tahun</option>';
              
              // Generate 5 tahun terakhir dan 2 tahun ke depan
              for (let year = currentYear - 5; year <= currentYear + 2; year++) {
                  const option1 = document.createElement('option');
                  option1.value = year;
                  option1.textContent = year;
                  tahunSelectTabel.appendChild(option1);
                  
                  const option2 = document.createElement('option');
                  option2.value = year;
                  option2.textContent = year;
                  tahunSelectPengeluaran.appendChild(option2);
              }
          }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
  
  // Fitur Install PWA
  let deferredPrompt;
  const installButton = document.createElement('button');
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Tampilkan button install
    installButton.style.position = 'fixed';
    installButton.style.bottom = '20px';
    installButton.style.right = '20px';
    installButton.style.zIndex = '1000';
    installButton.textContent = '📱 Install App';
    installButton.classList.add('btn', 'btn-primary');
    document.body.appendChild(installButton);
    
    installButton.addEventListener('click', () => {
      installButton.style.display = 'none';
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted install');
        }
        deferredPrompt = null;
      });
    });
  });

  // Fungsi untuk memuat splash screen
  console.log('[Splash Template] Starting template initialization...');
        
        // ===== CONFIGURATION =====
        const CONFIG = {
            APP_NAME: 'Aplikasi Data Keuangan',
            BRAND_NAME: '~Ellen Azra~',
            SPLASH_DURATION: 5500,
            ANIMATION_PATH: 'logo.json',
            TYPEWRITER_SPEEDS: {
                MAIN_TEXT: 80,  // Sedikit lebih lambat biar smooth
                SUB_TEXT: 90    // Sedikit lebih lambat
            },
            DELAYS: {
                SPLASH_START: 500,
                SUB_TEXT_START: 2000,  // Delay lebih panjang biar lebih dramatis
                CONTENT_FADE_IN: 6500
            }
        };
        
        console.log('[Config] Configuration loaded:', CONFIG);
        
        // ===== SMOOTH TYPEWRITER FUNCTION =====
        function runTypeWriter(el, text, speed = 80) {
            console.log(`[TypeWriter] Starting SMOOTH animation for: "${text}"`);
            
            let i = 0;
            el.innerHTML = '';
            el.style.width = 'auto';
            el.classList.add('typeWriter');
            el.classList.add('smooth-appear'); // Tambah efek smooth
            
            function typeCharacter() {
                if (i < text.length) {
                    // Efek sound mental (bisa ditambah audio kalo mau)
                     //playTypeSound(); // Uncomment kalo mau ada sound
                    
                    el.innerHTML += text.charAt(i);
                    i++;
                    
                    // Random slight delay untuk efek natural
                    const randomDelay = speed + (Math.random() * 20 - 10);
                    setTimeout(typeCharacter, randomDelay);
                } else {
                    console.log(`[TypeWriter] Smooth animation completed`);
                    // Biarkan cursor blink beberapa kali sebelum hilang
                    setTimeout(() => {
                        el.style.borderRight = 'none';
                        el.classList.remove('typeWriter');
                    }, 1000);
                }
            }
            
            typeCharacter();
        }
        
        // ===== SPLASH SCREEN HANDLER =====
        function showSplashScreen() {
            console.log('[Splash] Checking splash screen...');
            
            const splash = document.getElementById('splash-screen');
            const animContainer = document.getElementById('lottie-animation');
            const mainContent = document.getElementById('main-content');
            
            if (!splash || !animContainer) {
                console.error('[Splash] Splash elements not found!');
                return;
            }
            
            if (sessionStorage.getItem('splashShown')) {
                console.log('[Splash] Splash already shown in this session, skipping...');
                splash.style.display = 'none';
                if (mainContent) {
                    mainContent.style.display = 'block';
                }
                return;
            }
            
            console.log('[Splash] Showing splash screen with SMOOTH typing...');
            
            // Load Lottie animation
            let anim;
            try {
                anim = lottie.loadAnimation({
                    container: animContainer,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: CONFIG.ANIMATION_PATH
                });
                console.log('[Splash] Lottie animation loaded successfully');
            } catch (error) {
                console.error('[Splash] Error loading Lottie animation:', error);
                animContainer.innerHTML = '<div style="color: white; font-size: 48px; font-weight: bold;">✨</div>';
            }
            
            // Show splash screen
            splash.style.display = 'flex';
            splash.classList.remove('splash-hidden');
            sessionStorage.setItem('splashShown', 'true');
            
            // Start SMOOTH typewriter animations
            requestAnimationFrame(() => {
                setTimeout(() => {
                    runTypeWriter(
                        document.getElementById('splash-text'),
                        CONFIG.APP_NAME,
                        CONFIG.TYPEWRITER_SPEEDS.MAIN_TEXT
                    );
                    
                    setTimeout(() => {
                        runTypeWriter(
                            document.getElementById('splash-subtext'),
                            CONFIG.BRAND_NAME,
                            CONFIG.TYPEWRITER_SPEEDS.SUB_TEXT
                        );
                    }, CONFIG.DELAYS.SUB_TEXT_START);
                }, 300); // Initial delay biar lebih dramatis
            });
            
            // Hide splash screen after configured duration
            setTimeout(() => {
                console.log('[Splash] Hiding splash screen');
                splash.classList.add('splash-hidden');
                
                if (anim) anim.stop();
                
                setTimeout(() => {
                    splash.style.display = 'none';
                    if (mainContent) {
                        mainContent.style.display = 'block';
                    }
                    console.log('[Splash] Main content displayed');
                }, 500);
            }, CONFIG.SPLASH_DURATION);
        }
        
        // ===== INITIALIZATION =====
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[Template] DOM ready, starting SMOOTH splash...');
            
            setTimeout(() => {
                showSplashScreen();
            }, CONFIG.DELAYS.SPLASH_START);
        });
        
        console.log('[Template] Smooth splash template loaded successfully');
