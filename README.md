# Nextcloud Talk Desktop (Community Edition by Sairento)

[![GitHub Release](https://img.shields.io/github/v/release/Sairento-92/talk-desktop?color=0082c9&label=Wydanie)](https://github.com/Sairento-92/talk-desktop/releases/latest)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Sairento-92/talk-desktop/build.yml?branch=main&label=Build%20CI)](https://github.com/Sairento-92/talk-desktop/actions)
[![Platform: Windows | macOS | Linux](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-brightgreen)](https://github.com/Sairento-92/talk-desktop/releases/latest)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE.txt)

> **Oficjalny, rozszerzony fork klienta Nextcloud Talk Desktop by Sairento** (`cloud.huriko.com`). Zawiera ponad 25 najważniejszych i najbardziej wyczekiwanych ulepszeń, pull requestów oraz poprawek błędów z oficjalnego repozytorium Nextcloud, które nie doczekały się jeszcze wydania w wersji upstream.

---

## 📦 Pobierz Gotowe Wydanie (Multi-platform)

Wszystkie skompilowane paczki instalacyjne dla najnowszego wydania **v2.4.1** są dostępne w zakładce [GitHub Releases](https://github.com/Sairento-92/talk-desktop/releases/latest):

| System operacyjny | Typ paczki | Link do pobrania |
| :--- | :--- | :--- |
| **🪟 Windows (10/11 x64)** | **Natywny Instalator (Zalecany)** | [Nextcloud-Talk-Setup-v2.4.1.exe](https://github.com/Sairento-92/talk-desktop/releases/latest/download/Nextcloud-Talk-Setup-v2.4.1.exe) |
| **🪟 Windows (10/11 x64)** | Samodzielny ZIP (Portable) | [Nextcloud-Talk-Windows-x64.zip](https://github.com/Sairento-92/talk-desktop/releases/latest/download/Nextcloud-Talk-Windows-x64.zip) |
| **🍏 macOS (Intel & Apple Silicon)** | Aplikacja macOS x64/Rosetta | [Nextcloud-Talk-macOS-x64.zip](https://github.com/Sairento-92/talk-desktop/releases/latest/download/Nextcloud-Talk-macOS-x64.zip) |
| **🐧 Linux (x86_64)** | Archiwum tar.gz | [Nextcloud-Talk-Linux-x64.tar.gz](https://github.com/Sairento-92/talk-desktop/releases/latest/download/Nextcloud-Talk-Linux-x64.tar.gz) |

---

## 🔄 Pełne Zestawienie Zmian Względem Oryginalnej Wersji (Upstream Nextcloud)

Poniższa tabela oraz zestawienie szczegółowo prezentują różnice pomiędzy oryginalnym wydaniem Nextcloud Talk Desktop a niniejszym forkiem:

| Obszar / Funkcja | Oryginalny Talk Desktop (Upstream) | Fork Sairento (Community Edition) |
| :--- | :--- | :--- |
| **Instalator Windows** | Brak natywnego instalatora `.exe` (tylko zip/msi) | **Dedykowany instalator Inno Setup** z ikonami, autostartem i deinstalatorem |
| **Uruchamianie okna** | Błąd z ukrywaniem okna (`show: false`, fałszywy autostart) | **Natychmiastowa widoczność okna** i obsługa wyciągania na wierzch (single instance) |
| **Tłumienie szumów AI** | ❌ Brak (tylko podstawowe AGC/echo z przeglądarki) | **Wbudowana sieć neuronowa RNNoise WASM (48 kHz)** tłumiąca klawiaturę i tło |
| **Podgląd wideo (PiP)** | ❌ Brak (minimalizacja okna ukrywa wideo) | **Pływające okno Picture-in-Picture** z przyciskami mikrofonu, kamery i rozłączenia |
| **Paleta komend (`Ctrl+K`)**| ❌ Brak szybkiego przełącznika pokoi | **Błyskawiczna wyszukiwarka pokoi i akcji** pod skrótem `Ctrl + K` |
| **Dźwięki mikrofonu** | ❌ Brak sygnalizacji wyciszenia | **Syntetyzowane akordy audio (chimes)** przy wyciszaniu i włączaniu mikrofonu |
| **Podsumowania spotkań** | ❌ Brak | **Komenda `/summary`** generująca agendę i zadania z eksportem do Markdown |
| **Głosowania i ankiety** | ❌ Brak ankiet na czacie | **Komenda `/poll`** do interaktywnych ankiet z głosowaniem na żywo |
| **Nagrywarka wycinków** | ❌ Brak rejestratora ekranu | **Komenda `/record`** nagrywająca wybrany fragment ekranu lub rozmowę do WebM/MP4 |
| **Licznik w zasobniku** | ❌ Brak (zwykła statyczna ikona w trayu) | **Dynamiczna czerwona plakietka z liczbą wiadomości** (PR #1605) |
| **Powiadomienia OS** | Tylko prosty dymek informacyjny | **Szybkie odpowiedzi inline i przyciski akcji** w dymkach Windows/macOS (PR #1848) |
| **Udostępnianie ekranu** | Efekt nieskończonego lustra przy transmisji | **Ochrona przed pętlą lustra** (`WDA_EXCLUDEFROMCAPTURE`, PR #1826) |
| **Ramka udostępniania** | ❌ Brak wizualnego oznaczenia monitora | **Żółta ramka Windows DWM** na nagrywanym monitorze (PR #1974) |
| **Zamykanie w trakcie rozmowy**| Zamknięcie okna natychmiast rozłączało rozmowę | **Strażnik zamykania (dialog)** pytający czy kontynuować w tle (Issue #2003) |
| **Status użytkownika** | Ręczna zmiana statusu | **Automatyczne przełączanie na „W trakcie rozmowy”** i powrót (Issue #1768) |
| **Zamrażanie sieci Wi-Fi** | Zerwanie sieci blokowało powiadomienia do 2,5h | **Auto-reconnect z natychmiastowym odświeżeniem** po uśpieniu/zmianie sieci (PR #1975) |
| **Język interfejsu** | Angielskie menu kontekstowe, brak słowników | **W pełni spolszczone menu**, słowniki pisowni PL, EN, DE (PR #855, Issue #1887) |
| **Pasek pobierania** | Brak wskaźnika pobierania | **Zielony pasek postępu pobierania** na ikonie paska zadań (Issue #1737) |
| **Menu aplikacji Nextcloud**| Brak dostępu do innych aplikacji z poziomu belki | **Ikona 9-kropek na belce tytułowej** (Pliki, Kalendarz, Poczta, Kontakty, PR #1690) |
| **Własny styl graficzny** | ❌ Brak opcji personalizacji stylów CSS | **Obsługa pliku `custom.css`** do zmiany wyglądu i motywów (PR #1745) |
| **Obsługa 4K / HiDPI / RDP** | Artefakty i spowolnienia renderowania | **Sprzętowa rasteryzacja GPU** (`--enable-gpu-rasterization`, Issue #1787) |
| **Obsługa mikrofonu Windows**| Błąd `NotReadableError` blokujący mikrofon | **Wyłączony `AudioServiceSandbox`** eliminujący zawieszanie audio (Issue #2002) |
| **Ekran logowania** | Brak opcji wylogowania przy błędzie sieci | **Przycisk wylogowania** na ekranie powitalnym (PR #1012) |
| **Dołączanie do pokoju** | Tylko kliknięcie z czatu | **Akcja „Dołącz przez link”** w menu głównym aplikacji (PR #1541) |
| **Podgląd zdjęć** | Statyczny podgląd bez rotacji | **Przyciski obracania zdjęć w podglądzie** (Issue #1757) |

---

## ✨ Szczegółowy Opis Wprowadzonych Modułów

### 🤖 1. Audio AI, Picture-in-Picture & Efekty Dźwiękowe
- **Redukcja szumów w czasie rzeczywistym AI (RNNoise WASM / WebAudio)**:
  - Zaawansowany filtr neuronowy Mozilla/Xiph RNNoise eliminujący dźwięki uderzeń w klawiaturę, szum wentylatorów chłodzenia PC i hałas z otoczenia w czasie rzeczywistym (48 kHz).
  - Przełącznik on/off w sekcji *Ulepszenia Audio & Video* w ustawieniach aplikacji.
- **Pływające okno Picture-in-Picture (PiP / Mini-Player)**:
  - Zawsze na wierzchu (Always-on-Top) miniaturowy odtwarzacz wideo podczas minimalizacji Talka lub pracy w innych oknach.
  - Płynny podgląd aktywnego mówcy, licznik czasu połączenia oraz szybkie przyciski wyciszenia mikrofonu 🎙️, kamery 📹, przywrócenia okna 🗖 i zakończenia rozmowy ❌.
- **Dźwiękowe potwierdzenia mikrofonu (Audio Chimes)**:
  - Dyskretne, syntetyzowane akordy dźwiękowe potwierdzające wyciszenie oraz ponowne włączenie mikrofonu, zapobiegające mówieniu przy wyłączonym mikrofonie.

### ⚡ 2. Narzędzia Produktywności i Nowe Komendy
- **Szybki przełącznik / Paleta komend (`Ctrl + K`)**:
  - Błyskawiczna nawigacja po pokojach rozmów i skrótach bez użycia myszki.
- **Generator podsumowań i notatek ze spotkań (`/summary`)**:
  - Błyskawiczny szablon ustaleń, agendy i zadań (Action Items) z eksportem do formatu Markdown.
- **Interaktywne ankiety na czacie (`/poll`)**:
  - Narzędzie do błyskawicznego zbierania głosów uczestników spotkania bezpośrednio w oknie czatu.
- **Wbudowany rejestrator klipów ekranu i rozmów (`/record`)**:
  - Jednoklikowe nagrywanie fragmentu ekranu lub rozmowy do pliku WebM/MP4.

### 🔔 3. Powiadomienia, Tacka i Interfejs
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

### 🔒 4. Bezpieczeństwo, Połączenia i Udostępnianie Ekranu
- **Eliminacja efektu lustra przy udostępnianiu (PR #1826)**:
  - Natywne wykluczanie okna Talk z nagrywania całego pulpitu (`BrowserWindow.setContentProtection(true)` / Windows `WDA_EXCLUDEFROMCAPTURE`), zapobiegające nieskończonej pętli odbić w transmitowanym obrazie.
- **Żółta ramka DWM transmitowanego okna/ekranu (PR #1974)**:
  - Włączenie flag Chromium WebRTC oznaczających udostępniany monitor wyraźną żółtą ramką Windows DWM.
- **Strażnik zamykania aktywnej rozmowy (Issue #2003)**:
  - Ostrzeżenie z pytaniem czy opuścić rozmowę, czy kontynuować w tle przy kliknięciu [X] w trakcie trwającego połączenia.
- **Automatyczny status „W trakcie rozmowy” (Issue #1768)**:
  - Automatyczna zmiana statusu użytkownika na `Zajęty / W trakcie rozmowy` podczas aktywnego połączenia i przywracanie stanu po rozłączeniu.
- **Poprawka błędu uruchamiania i widoczności okna**:
  - Okno główne pojawia się natychmiast po uruchomieniu aplikacji ze skrótu lub autostartu, z prawidłową obsługą wyciągania okna na wierzch przy próbie ponownego uruchomienia.
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

---

## 🛠️ Budowanie ze Źródeł

### Wymagania wstępne:
- Node.js LTS (wersja 20 lub 22)
- npm 10+
- Inno Setup 6 (do budowania instalatora Windows `.exe`)

```bash
# Klonowanie repozytorium
git clone https://github.com/Sairento-92/talk-desktop.git
cd talk-desktop

# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm start

# Budowanie paczki Windows x64
npm run build:windows:x64

# Kompilacja instalatora Windows Inno Setup
& "C:\Users\<user>\AppData\Local\Programs\Inno Setup 6\iscc.exe" installer.iss
```

---

## 📄 Licencja

Aplikacja jest udostępniana na warunkach wolnej licencji **GNU Affero General Public License v3.0 (AGPLv3)**.
Oryginalny kod: © Nextcloud GmbH and Nextcloud contributors.
Modyfikacje i usprawnienia forka: © Sairento.
