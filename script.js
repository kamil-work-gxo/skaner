let currentWozek = null;

// Ładowanie przypisań z pliku JSON
async function loadData() {
  const response = await fetch("data.json");
  return await response.json();
}

// Inicjalizacja czytnika
function startScanner() {
  const html5QrCode = new Html5Qrcode("reader");

  // Dynamiczne dopasowanie rozmiaru pola QR do ekranu
  const qrBoxSize = Math.min(window.innerWidth * 0.8, 300);

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: qrBoxSize
    },
    async (decodedText) => {
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

        // Reset po 5 sekundach
        setTimeout(() => {
          currentWozek = null;
          document.getElementById("status").textContent =
            "Najpierw zeskanuj kod QR wózka.";
          document.getElementById("status").className = "";
        }, 5000);
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
}

// Start skanera
startScanner();
