# Sistemi për Menaxhimin e Porosive Online (E-Commerce)

**Projekti:** Raporti Teknik 1 – Analiza, Kërkesat dhe Dizajni Teknik[cite: 2, 4]  
**Lënda:** Projekt (Praktikë Profesionale) – Semestri V[cite: 1]  
**Fakulteti:** Fakulteti i Shkencave Kompjuterike – Dizajn Softueri[cite: 1]  
**Universiteti:** Universiteti "Ukshin Hoti" Prizren[cite: 1]  
**Studentja:** Genta Olloni  
**Profesori:** Prof. Ass. Dr. Endrit Fetahi[cite: 1]  

---

## Përshkrimi i Projektit

Ideja është të bëhet një sistem për menaxhimin e porosive online, në mënyrë që klientët të shohin produktet dhe të bëjnë porosi më lehtë, ndërsa administratori t'i menaxhojë produktet dhe porositë në një vend të vetëm, pa gabime dhe pa porosi të humbura.

---

## Kërkesat e Sistemit

- Sistemi duhet të lejojë qasjen e klientëve dhe të administratorit
- Klienti mund të regjistrohet dhe të hyjë me email dhe fjalëkalim
- Klienti mund t'i shohë produktet dhe t'i kërkojë ose filtrojë sipas kategorisë dhe çmimit
- Klienti mund të shohë detajet e produktit (përshkrimi, çmimi dhe sa copë ka në stok)
- Klienti mund të shtojë produkte në shportë, t'i heqë ato ose t'ia ndryshojë sasinë
- Klienti mund ta bëjë porosinë duke shkruar adresën e dërgesës, ku pagesa bëhet kur e merr porosinë
- Klienti mund ta shohë historikun e porosive dhe në çfarë statusi janë
- Klienti mund ta anulojë porosinë vetëm derisa ajo nuk është konfirmuar ende nga admini
- Administratori mund të shtojë, ndryshojë dhe fshijë produkte dhe kategori
- Administratori mund t'i shohë të gjitha porositë dhe ta ndryshojë statusin e tyre (në pritje, konfirmuar, dërguar, dorëzuar ose anuluar)
- Kur bëhet një porosi, stoku i produktit zvogëlohet vetë, dhe nëse nuk ka mjaftueshëm produkte porosia nuk pranohet
- Në website duhet të konfirmohet regjistrimi, pra autentifikim
- Fjalëkalimet duhet të ruhen me hash (të fshehura, jo si tekst i lexueshëm)[cite: 5, 17]
- Çdo përdorues, produkt dhe porosi duhet të ketë ID të veçantë
- Website duhet të jetë responsiv për çdo lloj ekrani[cite: 5]
- Duhet të jetë i lehtë për t'u kuptuar dhe për t'u përdorur
- Secili rol (klient ose administrator) duhet të bëjë vetëm funksionet e veta

---

## Teknikat dhe Arkitektura

### Frontend
- **HTML, CSS, JavaScript, Bootstrap**
- Faqet e klientit dhe të administratorit, dizajn responsiv

### Backend
- **PHP (me XAMPP):** hyrja dhe regjistrimi, rolet, produktet, shporta dhe porositë

### Database
- **MySQL:** përdoruesit, produktet, kategoritë, shporta, porositë dhe pagesat

### Modeli fillestar i databazës

| Tabela | Për çfarë shërben |
|---|---|
| `users` | Llogaritë, email-i, password hash dhe roli (klient ose administrator) |
| `addresses` | Adresat e dërgesës të klientit |
| `categories` | Kategoritë e produkteve |
| `products` | Produktet me çmim, stok dhe kategori |
| `cart_items` | Produktet që klienti i ka në shportë |
| `orders` | Porositë me klientin, adresën, statusin dhe totalin |
| `order_items` | Produktet brenda një porosie, me sasinë dhe çmimin |
| `payments` | Pagesa e secilës porosi |

**Lidhjet kryesore midis tabelave:**
- Një përdorues mund të ketë shumë porosi
- Një kategori ka shumë produkte
- Një porosi ka shumë produkte brenda (tabela `order_items`)
- Një porosi ka një pagesë

### Arkitektura
Sistemi ndahet në tri pjesë: frontend (çfarë e shohin përdoruesit), backend (PHP, që i përpunon kërkesat) dhe database (MySQL, ku ruhen të dhënat).

**Modulet:** Përdoruesit, produktet, shporta, porositë, pagesat, administrimi.

---

## Plan pune

sugjerimi: kërkesat -> dizajnimi -> implementimi -> testimi

| Faza | Aktivitetet kryesore | Rezultati i pritshëm |
|---|---|---|
| Analiza e kërkesave | Përcaktimi i funksioneve dhe roleve të sistemit | Lista e kërkesave |
| Dizajnimi | Arkitektura dhe modeli i databazës | Dizajni i sistemit |
| Krijimi i databazës | Krijimi i tabelave dhe lidhjeve në MySQL | Databaza e gatshme |
| Backend-i | Hyrja, regjistrimi, produktet, shporta dhe porositë në PHP | Pjesa e serverit funksionale |
| Frontend-i | Faqet për klientin dhe administratorin | Ndërfaqe responsive |
| Testimi | Provimi i funksioneve dhe rregullimi i gabimeve | Version i testuar |

### Orari i propozuar

- **Java 1:** analiza e kërkesave, dizajni dhe databaza
- **Java 2-3:** backend-i (hyrja, produktet, shporta, porositë)
- **Java 4-5:** frontend-i dhe lidhja me backend-in
- **Java 6-7:** testimi dhe rregullimi i gabimeve
- **Java 8:** finalizimi