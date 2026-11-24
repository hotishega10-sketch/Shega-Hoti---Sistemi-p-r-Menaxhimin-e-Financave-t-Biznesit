# Frontend – Financa (React + Vite)

## Si ta nisësh
```bash
cd frontend
npm install
npm run dev
```
Hape http://localhost:5173. Backend-i duhet të jetë i ndezur në portin 5000 (`npm run dev` te `backend/`).
Vite i përcjell kërkesat `/api` te backend-i (shih `vite.config.js`), prandaj nuk duhet konfigurim shtesë.

## Struktura (`src/`)
| Folderi | Detyra |
| --- | --- |
| `pages/` | Një faqe për ekran: Login, Register, Dashboard, Transactions, Clients, Invoices |
| `components/` | Pjesë të ripërdorshme: Layout, Modal, Field, Loading/Empty/Error, BarChart |
| `services/` | Komunikimi me API-n: `api.js` (token, gabime, 401) dhe shërbimet për secilin burim |
| `hooks/` | `useAuth` (përdoruesi i kyçur dhe rolet), `useFetch` (loading/error/data) |
| `utils/` | Formatimi i parasë/datave dhe validimi në anën e klientit |
| `routes/` | Rrugët dhe mbrojtja sipas përdoruesit dhe rolit |

## Rrjedha e një funksioni (shembull: transaksion i ri)
Veprim i përdoruesit → validim në formë → `transactionService.create` → `api()` shton token-in →
backend (verifyToken, checkRole, validim, SQL) → përgjigje → forma mbyllet dhe lista rifreskohet.
