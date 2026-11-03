# Sistemi per Menaxhimin e Financave te Biznesit

Projekt individual ne lenden **Projekt (Praktike Profesionale)**, Semestri V, viti akademik 2026/2027.
Fakulteti i Shkencave Kompjuterike, Universiteti "Ukshin Hoti" Prizren.

## Pershkrimi

Bizneset e vogla shpesh i ndjekin shpenzimet dhe faturat ne Excel ose ne leter, gje qe sjell gabime dhe humbje te dhenash.
Ky sistem ofron nje vend te vetem ku bizneset regjistrojne transaksionet, krijojne fatura dhe shohin gjendjen financiare.

## Perdoruesit

- **Pronari i biznesit**: qasje e plote; krijon kontabiliste dhe punonjes
- **Kontabilisti**: regjistron dhe shikon transaksione dhe fatura
- **Punonjesi**: regjistron shpenzime dhe shikon transaksionet e veta, por nuk mund te fshije transaksione

## Teknologjite

| Shtresa | Teknologjia |
|---|---|
| Frontend | JavaScript, React.js |
| Backend | Node.js (Express), REST API (JSON) |
| Databaza | MySQL |
| Autentikimi | JWT, bcrypt |
| Testimi i API-t | Postman |

## Struktura e projektit

```
.
├── backend/
│   ├── server.js, app.js      # nisja e serverit dhe konfigurimi i Express
│   ├── config/                # lidhja me MySQL, konstantet
│   ├── routes/                # adresat e API-t
│   ├── middleware/            # verifyToken, checkRole, trajtimi i gabimeve
│   ├── controllers/           # logjika e endpoint-eve dhe query-t SQL
│   ├── utils/                 # validimi i inputit, AppError
│   ├── database/              # schema.sql dhe seed.js (te dhena testuese)
│   └── docs/                  # koleksioni i Postman
├── frontend/                  # React.js
├── docs/                      # raportet dhe diagramet
└── README.md
```

## Si ekzekutohet backend-i

Nevojitet Node.js dhe MySQL (p.sh. XAMPP).

1. Krijo databazen `financa_db` ne MySQL (phpMyAdmin) dhe ekzekuto `backend/database/schema.sql`.
2. Ne folderin `backend/`:
   ```
   npm install
   ```
3. Kopjo `.env.example` ne `.env` dhe vendos vlerat e tua (`DB_PASS`, `JWT_SECRET` me nje vlere te rastesishme e te gjate). Skedari `.env` nuk ngarkohet ne GitHub.
4. Shto te dhenat testuese:
   ```
   npm run seed
   ```
5. Nise serverin:
   ```
   npm run dev
   ```
   Serveri punon ne `http://localhost:5000`. Kontrolli: `GET /api/health`.

Llogarite demo (pas `npm run seed`), fjalekalimi `Demo1234!`: `pronar@demo.com`, `kontabilist@demo.com`, `punjonjes@demo.com`.

## Endpoint-et (permbledhje)

| Metoda | Rruga | Qasja |
|---|---|---|
| POST | `/api/auth/register` | publik (krijon biznes dhe pronar) |
| POST | `/api/auth/login` | publik |
| GET | `/api/auth/me` | i kycur |
| GET, POST | `/api/users` | pronar |
| GET, POST | `/api/categories` | GET: te gjithe; POST: pronar, kontabilist |
| GET | `/api/transactions`, `/api/transactions/summary`, `/api/transactions/:id` | te gjithe (punonjesi vetem te vetat) |
| POST | `/api/transactions` | te gjithe (punonjesi vetem shpenzime) |
| PATCH | `/api/transactions/:id` | pronar, kontabilist |
| DELETE | `/api/transactions/:id` | pronar |

Pjesa tjeter e kerkesave (`Authorization: Bearer <token>`), kodet e pergjigjes dhe shembujt jane ne raportin ne `docs/`.
Koleksioni per testim: `backend/docs/finance-api.postman_collection.json` (importohet ne Postman).

## Statusi

- [x] Raporti 1: analiza, kerkesat, arkitektura, ER diagrami
- [x] Raporti 2: databaza, backend-i dhe API (autentikim, role, kategori, transaksione)
- [ ] Raporti 3: faturat, klientet, dashboard-i dhe frontend-i
- [ ] Raporti 4: testimi, siguria dhe deployment
