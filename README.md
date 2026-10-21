# 💰 Sistemi për Menaxhimin e Financave të Biznesit

**Projekti:** Raporti Teknik 1 – Analiza, Kërkesat dhe Dizajni Teknik  
**Lënda:** Projekt (Praktikë Profesionale) – Semestri V  
**Fakulteti:** Fakulteti i Shkencave Kompjuterike – Dizajn Softueri  
**Universiteti:** Universiteti "Ukshin Hoti" Prizren  
**Studentja:** Shega Hoti  
**Profesori:** Prof. Ass. Dr. Endrit Fetahi  

---

## 📝 Përshkrimi i Projektit

Sistemi është i menduar për bizneset e vogla që shpesh ndjekin shpenzimet apo faturat e tyre në Excel ose letër, gjë që mund të rezultojë në gabime dhe humbje të dhënash të gjendjes financiare. Ky sistem ofron një vend të vetëm ku bizneset mund të regjistrojnë transaksionet, të krijojnë fatura dhe të shohin gjendjen financiare.

---

## 👥 Përdoruesit dhe Rolet

- **Pronari i biznesit:** Ka qasje të plotë në të gjitha modulet e sistemit, regjistrimin e përdoruesve dhe raportet financiare.
- **Kontabilisti:** Regjistron dhe shikon transaksione dhe fatura.
- **Punonjësi:** Mund të regjistrojë vetëm shpenzime dhe të shohë transaksionet e veta, por nuk mund të fshijë transaksione.

---

## 🎯 Kërkesat e Sistemit

### Kërkesat Funksionale (KF)
- **KF1:** Përdoruesi mund të regjistrohet me email dhe fjalëkalim. Pronari mund të regjistrojë kontabilistin dhe punonjësit (çdo regjistrim i pavarur krijohet si një llogari pronari).
- **KF2:** Përdoruesi mund të hyjë me email dhe fjalëkalim.
- **KF3:** Kontabilisti mund të regjistrojë një transaksion me shumën, tipin (e hyrë ose shpenzim), kategorinë dhe datën. Punonjësi mund të regjistrojë vetëm shpenzime.
- **KF4:** Pronari dhe kontabilisti mund të krijojnë një faturë për një klient me totalin e shënuar.
- **KF5:** Fatura ka statusin e vet (`e_papaguar`, `e_paguar`, `e_vonuar`) dhe automatikisht kalon në `e_vonuar` kur data e afatit kalon dhe fatura ende nuk është paguar.
- **KF6:** Në dashboard paraqiten të hyrat, shpenzimet dhe fitimi neto për periudhën e zgjedhur.
- **KF7:** Raportet mund të filtrohen sipas periudhës dhe kategorisë, si dhe të eksportohen në PDF.

### Kërkesat Jofunksionale (KJ)
- **KJ1:** Fjalëkalimet ruhen vetëm si hash (`bcrypt`).
- **KJ2:** Endpoint-et private kërkojnë autentikim me JWT dhe autorizimi sipas rolit kryhet në backend.
- **KJ3:** Shumat monetare ruhen si `DECIMAL`, jo `FLOAT`.
- **KJ4:** Inputi validohet në backend dhe gabimet kthehen në format JSON.
- **KJ5:** Funksionet kryesore janë të përdorshme edhe në ekran mobil (dizajn responsiv).

---

## ⛔ Jashtë Scope-it (Për këtë semestër)

1. TVSH dhe taksat.
2. Bilanc i plotë kontabël.
3. Integrim me banka.
4. Njoftime me email.
5. Aplikacion i veçantë mobil (Nativ).

---

## 🛠️ Teknologjitë dhe Arkitektura

- **Frontend:** React.js, JavaScript (Struktura të lehta kodi dhe të ripërdorshme).
- **Backend:** Node.js (Express) (Përputhje me JS të frontend-it, i përshtatshëm për REST API).
- **Databaza:** MySQL (Për garantimin e constraints dhe foreign keys për të dhënat financiare).
- **Autentikimi:** JWT (JSON Web Token) & `bcrypt` (Ruajtje e sigurt e fjalëkalimeve).
- **Komunikimi:** REST API (HTTPS + JSON).

---

## 🗄️ Modeli Fillestar i Databazës (Entitetet Kryesore)

| Tabela | Për çfarë shërben |
|---|---|
| `businesses` | Identifikuesi i biznesit dhe emri i tij |
| `users` | Llogaritë e përdoruesve, email, password_hash, roli dhe `business_id` |
| `categories` | Kategoritë e transaksioneve (të hyra ose shpenzime) |
| `transactions` | Transaksionet me shumën, tipin, datën, përdoruesin dhe kategorinë |
| `invoices` | Faturat me klientin, totalin, statusin dhe datën e afatit |

---

## 📅 Plan pune (Deri te Raporti 2)

### Databaza
- Skema MySQL e krijuar me PK, FK dhe constraints.
- Të dhëna testuese për secilën tabelë.

### Backend (Node.js + Express)
- Struktura e projektit (`routes`, `controllers`, `services`).
- Autentikimi: `POST /api/auth/register` dhe `POST /api/auth/login` (`bcrypt` + JWT).
- Middleware për verifikimin e token-it dhe kontrollin e rolit.
- CRUD për transaksionet (`/api/transactions`) dhe leximi i kategorive (`/api/categories`).
- Validimi dhe trajtimi i gabimeve (400, 401, 403, 404) në format JSON.

### Testimi dhe Demonstrimi
- Thirrje reale të endpoint-eve me Postman.
- Git history me commit-e të qarta (`feat:`, `fix:`).