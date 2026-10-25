# Nextcloud Talk Desktop (Community Edition by Sairento)

[![GitHub Release](https://img.shields.io/github/v/release/Sairento-92/talk-desktop?color=0082c9&label=Wydanie)](https://github.com/Sairento-92/talk-desktop/releases/latest)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Sairento-92/talk-desktop/build.yml?branch=main&label=Build%20CI)](https://github.com/Sairento-92/talk-desktop/actions)
[![Platform: Windows | macOS | Linux](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-brightgreen)](https://github.com/Sairento-92/talk-desktop/releases/latest)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE.txt)

> **Oficjalny, rozszerzony fork klienta Nextcloud Talk Desktop by Sairento** (`cloud.huriko.com`). Zawiera ponad 20 najważniejszych i najbardziej wyczekiwanych ulepszeń, pull requestów oraz poprawek błędów z oficjalnego repozytorium Nextcloud, które nie doczekały się jeszcze wydania w wersji upstream.

---

## 📥 Pobierz Gotowe Wydanie (Multi-platform)

Wszystkie skompilowane paczki instalacyjne dla najnowszego wydania **v2.4.1** są dostępne w zakładce [GitHub Releases](https://github.com/Sairento-92/talk-desktop/releases/latest):

| System operacyjny | Typ paczki | Link do pobrania |
| :--- | :--- | :--- |
| **🪟 Windows (10/11 x64)** | Samodzielny ZIP (Portable / Installer) | [Nextcloud-Talk-Windows-x64.zip](https://github.com/Sairento-92/talk-desktop/releases/latest/download/Nextcloud-Talk-Windows-x64.zip) |
| **🍎 macOS (Intel & Apple Silicon)** | Aplikacja macOS x64/Rosetta | [Nextcloud-Talk-macOS-x64.zip](https://github.com/Sairento-92/talk-desktop/releases/latest/download/Nextcloud-Talk-macOS-x64.zip) |
| **🐧 Linux (x86_64)** | Archiwum tar.gz | [Nextcloud-Talk-Linux-x64.tar.gz](https://github.com/Sairento-92/talk-desktop/releases/latest/download/Nextcloud-Talk-Linux-x64.tar.gz) |

---

## 🌟 Nowe Funkcje i Ulepszenia w tym Forku

### 🔔 Powiadomienia, Tacka i Interfejs
- **Licznik nieprzeczytanych wiadomości w zasobniku (PR #1605)**:
  - Dynamicznie rysowana czerwona plakietka z cyfrą (1, 2, 5, 99+) na ikonie aplikacji w trayu obok zegara Windows, macOS i Linux.
- **Szybkie odpowiedzi i przyciski akcji w powiadomieniach (PR #1848)**:
  - Obsługa przycisków akcji (*Otwórz*, *Oznacz jako przeczytane*) oraz pola szybkiej odpowiedzi inline w natywnych dymkach powiadomień.
- **Wskaźnik postępu pobierania (Issue #1737)**:
  - Zielony pasek postępu pobierania plików wyświetlany bezpośrednio na ikonie aplikacji na pasku zadań Windows (`Taskbar progress`).
- **Menu aplikacji Nextcloud na belce tytułowej (PR #1690)**:
  - Ikona 9-kropek umożliwia błyskawiczny skok do Plików, Kalendarza, Poczty i Kontaktów bez otwierania przeglądarki.
- **Spolszczone menu kontekstowe (Issue #1887)**:
  - Menu prawego przycisku myszy (*Kopiuj, Wklej, Wytnij, Zaznacz wszystko, Sprawdzanie pisowni*) w pełni przetłumaczone na język polski.
- **Konfiguracja sprawdzania pisowni (PR #855)**:
  - Słowniki PL, EN, DE z szybkim przełącznikiem sprawdzania w menu kontekstowym.
- **Niestandardowe style Custom CSS (PR #1745)**:
  - Wsparcie dla pliku `custom.css` w ustawieniach aplikacji, pozwalające na pełną personalizację wyglądu czatu.

### 🛡️ Bezpieczeństwo, Połączenia i Udostępnianie Ekranu
- **Eliminacja efektu lustra przy udostępnianiu (PR #1826)**:
  - Natywne wykluczanie okna Talk z nagrywania całego pulpitu (`BrowserWindow.setContentProtection(true)` / Windows `WDA_EXCLUDEFROMCAPTURE`), zapobiegające nieskończonej pętli odbić w transmitowanym obrazie.
- **Żółta ramka DWM transmitowanego okna/ekranu (PR #1974)**:
  - Włączenie flag Chromium WebRTC oznaczających udostępniany monitor wyraźną żółtą ramką Windows DWM.
- **Strażnik zamykania aktywnej rozmowy (Issue #2003)**:
  - Ostrzeżenie z pytaniem czy opuścić rozmowę, czy kontynuować w tle przy kliknięciu [X] w trakcie trwającego połączenia.
- **Automatyczny status „W trakcie rozmowy” (Issue #1768)**:
  - Automatyczna zmiana statusu użytkownika na `Zajęty / W trakcie rozmowy` podczas aktywnego połączenia i przywracanie stanu po rozłączeniu.
- **Poprawka błędu audio NotReadableError na Windows (Issue #2002)**:
  - Wyłączenie flagi `AudioServiceSandbox`, eliminujące błąd zacinania mikrofonu w Windows 10/11.
- **Optymalizacja 4K / HiDPI / RDP (Issue #1787)**:
  - Włączona sprzętowa akceleracja rasteryzacji GPU (`--enable-gpu-rasterization`, `--enable-zero-copy`).
- **Zabezpieczenie przed zamrażaniem powiadomień po zerwaniu sieci (PR #1975)**:
  - Eliminacja błędu statusu 500 wydłużającego interwał sprawdzania wiadomości aż do 2,5 godziny po zmianie Wi-Fi.
- **Przycisk wylogowania na ekranie powitalnym (PR #1012)**:
  - Przycisk `Log out` na ekranie startowym ułatwiający zmianę konta w razie problemów z siecią.
- **Akcja „Dołącz przez link” (PR #1541)**:
  - Opcja wklejenia linku do pokoju rozmowy z poziomu menu głównego aplikacji.

### 🔄 Dedykowany Auto-Updater
Klient posiada wbudowaną obsługę automatycznych aktualizacji połączoną bezpośrednio z repozytorium wydań:
`https://api.github.com/repos/Sairento-92/talk-desktop/releases`

---

## 🛠️ Budowanie ze Źródeł (Development)

Wymagania: Node.js 20+ lub 24+, npm.

```bash
# Instalacja zależności
npm ci

# Uruchomienie w trybie deweloperskim
npm run dev

# Sprawdzenie typów TypeScript
npm run ts:check

# Kompilacja paczek produkcyjnych
npm run build          # Bieżąca platforma
npm run build:windows  # Windows x64
npm run build:linux    # Linux x64
npm run build:mac      # macOS Universal
```

---

## 👤 Autor i Społeczność
- **Autor forka:** Sairento ([@Sairento-92](https://github.com/Sairento-92))
- **Email:** `jakubbojarski92@gmail.com`
- **Studio:** Huriko Cloud (`cloud.huriko.com`)
- **Licencja:** AGPL-3.0
