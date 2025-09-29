let currentWozek = null;
let lastScan = "";
let lastScanTime = 0;
const cooldown = 2000; // 2 sekundy blokady po skanie

// Ładowanie przypisań z pliku JSON
async function loadData() {
  const response = await fetch("data.json");
  return await response.json();
}

// Funkcja resetująca stan
function resetScanner() {
  currentWozek = null;
  lastScan = "";
  lastScanTime = 0;
  document.getElementById("status").textContent =
    "Najpierw zeskanuj kod QR wózka.";
  document.getElementById("status").className = "";
}

// Inicjalizacja czytnika
function startScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  const qrBoxSize = Math.min(window.innerWidth * 0.8, 300);

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: qrBoxSize
    },
    async (decodedText) => {
      const now = Date.now();

      // Sprawdź cooldown
      if (now - lastScanTime < cooldown) return;

      // Sprawdź czy nie skanujemy w kółko tego samego
      if (decodedText === lastScan) return;

      lastScan = decodedText;
      lastScanTime = now;

      if (!currentWozek) {
        // Pierwszy skan = wózek
        currentWozek = decodedText;
        document.getElementById("status").textContent =
          `Zeskanowano wózek: ${currentWozek}. Teraz zeskanuj skaner.`;
        document.getElementById("status").className = "";
      } else {
        // Drugi skan = skaner
        const skaner = decodedText;
        const data = await loadData();

        if (data[currentWozek] && data[currentWozek].includes(skaner)) {
          document.getElementById("status").textContent =
            `✅ Skaner ${skaner} jest przypisany do wózka ${currentWozek}`;
          document.getElementById("status").className = "success";
        } else {
          document.getElementById("status").textContent =
            `❌ Skaner ${skaner} NIE jest przypisany do wózka ${currentWozek}`;
          document.getElementById("status").className = "error";
        }

        // Automatyczny reset po 5 sekundach
        setTimeout(resetScanner, 5000);
      }
    },
    (errorMessage) => {
      // Ignorujemy błędy odczytu
    }
  ).catch((err) => {
    console.error("Błąd uruchamiania kamery: ", err);
    document.getElementById("status").textContent =
      "❌ Nie udało się uruchomić kamery. Sprawdź uprawnienia.";
    document.getElementById("status").className = "error";
  });

  // Obsługa ręcznego resetu
  document.getElementById("resetBtn").addEventListener("click", resetScanner);
}

// Start skanera
startScanner();
