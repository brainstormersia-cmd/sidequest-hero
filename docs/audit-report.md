# SideQuest – Technical Audit Report

## Indice
- [1. Panoramica progetto](#1-panoramica-progetto)
  - [1.1 Repository e stack](#11-repository-e-stack)
  - [1.2 Struttura e moduli](#12-struttura-e-moduli)
  - [1.3 Dipendenze chiave](#13-dipendenze-chiave)
  - [1.4 Variabili d'ambiente](#14-variabili-dambiente)
  - [1.5 Avvio locale verificato](#15-avvio-locale-verificato)
- [2. Mappa pagine & flussi](#2-mappa-pagine--flussi)
  - [2.1 Pagine attive](#21-pagine-attive)
  - [2.2 Pagine/feature mancanti](#22-paginefeature-mancanti)
  - [2.3 User journeys & attriti](#23-user-journeys--attriti)
- [3. Bug, warning e problemi tecnici](#3-bug-warning-e-problemi-tecnici)
- [4. Frontend – stato tecnico](#4-frontend--stato-tecnico)
- [5. Backend/Supabase – stato tecnico](#5-backendsupabase--stato-tecnico)
- [6. Stato funzionalità](#6-stato-funzionalità)
- [7. Roadmap prioritaria 90 giorni](#7-roadmap-prioritaria-90-giorni)
- [8. Integrazioni e passi successivi](#8-integrazioni-e-passi-successivi)
- [9. Script npm consigliati](#9-script-npm-consigliati)
- [10. Checklist di rilascio](#10-checklist-di-rilascio)
- [11. Allegati prodotti](#11-allegati-prodotti)

---

## 1. Panoramica progetto

### 1.1 Repository e stack
- Monorepo: **no**, singola app Vite/React (`src/`, `public/`, `supabase/`). La root contiene configurazioni Vite/TypeScript e Tailwind.【F:src/App.tsx†L1-L61】【F:tailwind.config.ts†L1-L76】
- Stack attuale: Vite + React 18, TypeScript, Tailwind/Shadcn UI, React Query, Supabase client v2.【F:package.json†L6-L83】

### 1.2 Struttura e moduli
- `src/pages/` ospita le route principali (Landing, Onboarding, Dashboard comunità, Missioni, Chat, Wallet, Profilo, Notifiche).【F:src/App.tsx†L28-L40】
- `src/components/` contiene widget riutilizzabili (onboarding, registro multi-step, feed attività live, componenti wallet).【F:src/components/MultiStepRegistration.tsx†L25-L200】【F:src/components/LiveActivityFeed.tsx†L1-L120】
- `src/contexts/AuthContext.tsx` gestisce la sessione Supabase e fornisce helper di autenticazione.【F:src/contexts/AuthContext.tsx†L1-L158】
- `supabase/` include due migrazioni SQL che definiscono schema, trigger e policy RLS di base.【F:supabase/migrations/20250927152002_277b32bc-b86a-4087-a674-33ccc7cf526b.sql†L1-L200】【F:supabase/migrations/20250927152135_64da440d-e427-46ba-b09a-5a78607b28fa.sql†L1-L60】

### 1.3 Dipendenze chiave
- UI & UX: Shadcn UI (Radix), Tailwind, lucide-react icone.【F:package.json†L13-L63】
- Stato e dati: @tanstack/react-query per caching e fetch; Supabase JS per backend; date-fns per formattazioni.【F:package.json†L13-L63】
- Tooling: ESLint 9, TypeScript 5.8, Vite 5.4.【F:package.json†L65-L83】

### 1.4 Variabili d'ambiente
- Template aggiornato con chiavi Vite (`VITE_SUPABASE_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`) e segreti server (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`), oltre a defaults per DB locale e logging.【F:.env.example†L1-L41】

### 1.5 Avvio locale verificato
1. `npm install`
2. `npm run dev` (porta 5173)
3. Build di produzione riuscita (`npm run build`) con warning su bundle >500 kB.【54bea7†L1-L24】
4. `npm run lint` attualmente **fallisce** per errori TypeScript/ESLint (any, require proibiti).【1b4441†L1-L23】

---

## 2. Mappa pagine & flussi

### 2.1 Pagine attive

| Route | Scopo | Stato | Note |
| --- | --- | --- | --- |
| `/` | Landing marketing + selezione flussi (registrazione/login/guest) | Parziale | CTA "Esplora" apre dashboard in modalità guest; contenuti statici.【F:src/pages/Landing.tsx†L33-L139】 |
| `/onboarding` | Wrapper onboarding prima esperienza | Parziale | Richiede utente loggato, ma mostra `FirstTimeOnboarding`; dipende da localStorage.【F:src/pages/OnboardingWrapper.tsx†L7-L58】 |
| `/dashboard` | Dashboard community/utente con fallback demo | Parziale | Query Supabase + fallback; quick action incomplete per desktop nav.【F:src/pages/CommunityDashboard.tsx†L260-L415】 |
| `/missions` | Catalogo missioni | Placeholder | Dataset hard-coded, filtri solo client side.【F:src/pages/Missions.tsx†L119-L190】 |
| `/missions/:id` | Dettaglio missione | Parziale | Fetch Supabase; CTA owner punta a route inesistente; guest perde contesto login.【F:src/pages/MissionDetails.tsx†L420-L499】 |
| `/create-mission` | Wizard creazione missione | Placeholder | Nessun salvataggio su backend, stato locale `any`.【F:src/pages/CreateMission.tsx†L25-L144】 |
| `/chat` / `/chat/:id` | Chat missione | Placeholder | Messaggi mock, link al profilo verso route assente.【F:src/pages/Chat.tsx†L27-L198】 |
| `/wallet` | Portafoglio & analitiche | Placeholder | Transazioni e grafici mock.【F:src/pages/Wallet.tsx†L66-L200】 |
| `/profile` | Profilo utente runner | Parziale | Dati mock; pulsante "Modifica" porta a `/profile/edit` non definito.【F:src/pages/Profile.tsx†L202-L227】 |
| `/notifications` | Centro notifiche | Placeholder | Array statico, nessuna persistenza.【F:src/pages/Notifications.tsx†L98-L199】 |
| `/chat/*` | Chat 1:1 | Placeholder | Vedi sopra. |
| `*` | Not found | OK | Semplice fallback.【F:src/pages/NotFound.tsx†L4-L21】 |

### 2.2 Pagine/feature mancanti
- Onboarding guidato con raccolta dati profilo (documenti, skill, preferenze) e gating legale (ToS/Privacy).【F:src/pages/Onboarding.tsx†L36-L53】
- Gestione proposta missioni (candidatura, stato, escrow) – mancano view per employer/runner.
- Chat real-time con history persistente e allegati (attualmente mock).【F:src/pages/Chat.tsx†L31-L92】
- Pannello escrow, verifica identità e pagamenti (Stripe Connect) – solo UI fittizia nel wallet.【F:src/pages/Wallet.tsx†L74-L127】
- Dashboard employer/azienda distinta dalla community view, gestione dispute, admin panel.
- Preferenze notifiche, Help/FAQ, Terms/Privacy, pagine legali.

### 2.3 User journeys & attriti
- **Employer**: Landing → Registrazione multi-step (Supabase) → Redirect a `/onboarding` con login simulato → `/dashboard` guest → `/create-mission` (nessun salvataggio) → impossibile gestire missione (CTA 404).【F:src/components/MultiStepRegistration.tsx†L55-L75】【F:src/pages/MissionDetails.tsx†L420-L468】
- **Worker**: Landing → Login Supabase → `/dashboard` (dati fallback) → `/missions` (mock) → `/missions/:id` → "Accetta" aggiorna Supabase ma non esiste pipeline escrow, chat mock, wallet statico; dopo login da guest la missione non viene ripristinata.【F:src/pages/MissionDetails.tsx†L420-L441】【F:src/pages/Missions.tsx†L127-L190】
- Attriti UX: bottom nav mobile sempre visibile, assenza di breadcrumb desktop, flusso onboarding interrompe la sessione, nessun deep-link back dopo login.【F:src/components/ui/bottom-navigation.tsx†L32-L55】

---

## 3. Bug, warning e problemi tecnici
- Bug riproducibili documentati in `docs/buglist.json` (8 item con severità/priorità).【F:docs/buglist.json†L1-L138】
- `npm run lint` fallisce (bloccante per CI) per `any` in AuthContext/CreateMission e `require` in tailwind config.【1b4441†L1-L23】【F:src/contexts/AuthContext.tsx†L27-L131】【F:src/pages/CreateMission.tsx†L25-L129】【F:tailwind.config.ts†L1-L75】
- Bundle JS > 1 MB gzip: considerare code-splitting/lazy routing per dashboard e missioni.【54bea7†L9-L20】
- CTA verso route inesistenti: `/profile/edit`, `/missions/:id/manage`, `/profile/:slug` dalla chat.【F:src/pages/Profile.tsx†L219-L227】【F:src/pages/MissionDetails.tsx†L463-L468】【F:src/pages/Chat.tsx†L129-L136】
- Onboarding richiede login mock e può rimandare utente alla landing perdendo progresso.【F:src/pages/Onboarding.tsx†L36-L53】【F:src/pages/OnboardingWrapper.tsx†L12-L29】
- Bottom navigation sempre attiva anche su desktop, coprendo contenuti e mancando indicatori per route nidificate.【F:src/components/ui/bottom-navigation.tsx†L32-L55】

---

## 4. Frontend – stato tecnico
- **Routing**: definito in `App.tsx` senza guardie per ruoli; mancano route employer/admin e gestione nested layout.【F:src/App.tsx†L28-L40】
- **Stato globale**: solo `AuthContext`, nessun store per missioni/notifiche; React Query usato nella dashboard ma non altrove.【F:src/pages/CommunityDashboard.tsx†L296-L409】
- **Componenti riusabili**: esistono widget per onboarding e wallet ma legati a dati mock (`mockData`, `dashboardFallback`).【F:src/lib/dashboardFallback.ts†L1-L110】【F:src/lib/mockData.ts†L1-L60】
- **Forms**: CreateMission/Onboarding non validano con schema (zod non utilizzato), salvataggi mancanti.【F:src/pages/CreateMission.tsx†L73-L144】
- **Accessibilità**: uso di button ghost e icone senza aria-label (es. chat allegati), bottom nav priva di ruoli; dark-mode non gestita.
- **Performance**: dashboard carica grandi blocchi sincroni; LiveActivityFeed subscription non filtra eventi e produce fallback ricorsivo.【F:src/components/LiveActivityFeed.tsx†L32-L99】
- **Responsiveness**: layout principale ora max-width 6xl ma nav mobile non si adatta; modali wallet dimensionati per mobile.【F:src/pages/CommunityDashboard.tsx†L430-L520】

---

## 5. Backend/Supabase – stato tecnico
- Schema relazionale completo per profili, missioni, messaggi, notifiche, transazioni con RLS già definita (vedi `docs/schema.sql` e migrazioni).【F:docs/schema.sql†L1-L135】【F:supabase/migrations/20250927152002_277b32bc-b86a-4087-a674-33ccc7cf526b.sql†L1-L200】
- Policy aggiuntive consolidate in `docs/rls-policies.sql` con enforcement di accesso per ruoli owner/runner.【F:docs/rls-policies.sql†L1-L84】
- Non esiste backend Node/Express: tutte le chiamate previste via Supabase REST/RPC; `docs/openapi.json` definisce l'API da implementare (missions, notifications, wallet, auth session).【F:docs/openapi.json†L1-L200】
- Auth: Supabase email+password; `signUp` usa `window.location.origin` (problema SSR) e non gestisce errori/ritardi di conferma.【F:src/contexts/AuthContext.tsx†L88-L133】
- Pagamenti Stripe: nessuna implementazione server; `docs/stripe-webhooks.md` elenca eventi e responsabilità future.【F:docs/stripe-webhooks.md†L1-L21】
- Notifiche: UI mock; Supabase `notifications` esiste ma non viene popolata lato front.
- Logging/observability: assente (nessun Sentry/log aggregator); `.env` include placeholder per `LOG_LEVEL`/`SENTRY_DSN`.【F:.env.example†L34-L41】

---

## 6. Stato funzionalità

| Feature | Stato | Impatto | Note |
| --- | --- | --- | --- |
| Autenticazione email/password | Parziale | Alta | Sign-up/sign-in funzionano ma onboarding richiede login simulato; manca reset password/social login.【F:src/components/LoginForm.tsx†L27-L62】【F:src/pages/Onboarding.tsx†L36-L53】 |
| Catalogo missioni | Non funzionante (dati reali) | Critico | Lista e filtri sono mock, nessuna query Supabase. |
| Dettaglio missione + accettazione | Parziale | Alta | Fetch reale e update runner_id, ma CTA naviga a route inesistenti e non crea chat/escrow.【F:src/pages/MissionDetails.tsx†L420-L476】 |
| Creazione missione | Non funzionante | Critico | Nessun insert Supabase; stepper solo UI. |
| Chat | Placeholder | Alta | Messaggi statici, nessun realtime/backlog; link a profilo 404.【F:src/pages/Chat.tsx†L66-L136】 |
| Wallet & escrow | Placeholder | Alta | Totali/ricarica mock, nessuna logica Stripe. |
| Notifiche | Placeholder | Media | Dati statici, nessun polling/subscription. |
| Dashboard community | Parziale | Media | Query Supabase con fallback e toasts; nav desktop mancante. |
| Gamification/achievements | Placeholder | Bassa | Calcolati da mockData, non persistenti.【F:src/lib/mockData.ts†L7-L60】 |

---

## 7. Roadmap prioritaria 90 giorni

### Sprint 1–2 (0-30 gg)
- **Stabilizzare auth/onboarding**: rimuovere login mock, usare sessione Supabase, aggiungere verifica email & redirect safe (S, dip. AuthContext).【F:src/pages/OnboardingWrapper.tsx†L12-L58】
- **Catalogo missioni reale**: integrare query Supabase con React Query, filtri server-side, paginazione (M, dip. schema esistente).【F:src/pages/Missions.tsx†L119-L190】
- **Fix bug 404**: rimuovere CTA errati o implementare pagine mancanti (S).【F:src/pages/Profile.tsx†L219-L227】【F:src/pages/MissionDetails.tsx†L463-L468】【F:src/pages/Chat.tsx†L129-L136】
- **Lint/CI green**: tipizzare AuthContext/CreateMission, sostituire `require` Tailwind (S).【1b4441†L1-L23】

### Sprint 3–4 (30-60 gg)
- **Mission lifecycle**: API per creazione/aggiornamento missioni, flusso candidature/accettazione, redirect post-login (L).
- **Wallet & escrow MVP**: connettere Stripe test (PaymentIntent + escrow), registrare transazioni in Supabase (L).【F:docs/stripe-webhooks.md†L5-L21】
- **Chat realtime**: usare Supabase Realtime canali missione, upload minimi (M).【F:src/components/LiveActivityFeed.tsx†L64-L109】
- **Dashboard desktop nav**: introdurre layout responsive, rimuovere bottom nav su breakpoint grandi (S).【F:src/components/ui/bottom-navigation.tsx†L32-L55】

### Sprint 5–6 (60-90 gg)
- **Notifiche & preferenze**: persistenza Supabase + toasts, canali email (M).
- **Admin/dispute tooling**: pagine protette per monitorare escrow, dispute e KYC (L).
- **Observability & compliance**: logging centralizzato, privacy policy, audit trail su missioni/transazioni (M).

---

## 8. Integrazioni e passi successivi
- **Auth**: aggiungere magic link/OTP opzionale (Supabase) e ruoli (worker/employer/admin).【F:src/contexts/AuthContext.tsx†L22-L133】
- **Pagamenti Stripe**: implementare PaymentIntent + manual capture per escrow; seguire tabella webhooks allegata.【F:docs/stripe-webhooks.md†L5-L21】
- **Ricerca/filtri**: usare Postgres full-text + indice trigram su missioni; esporre API `GET /missions` con query param (vedi OpenAPI).【F:docs/openapi.json†L38-L83】
- **Chat realtime**: Supabase Realtime + storage per allegati; moderazione (flag, ban).【F:src/components/LiveActivityFeed.tsx†L64-L109】
- **Notifiche**: combinare Supabase functions + email (Resend/Postmark) e preferenze utente.
- **Admin panel**: role-based route con panoramica missioni, dispute, pagamenti.
- **Compliance**: Terms/Privacy, audit trail (trigger Supabase), log attività.
- **CI/CD**: pipeline lint+test+build, anteprima per PR, branch protection.

---

## 9. Script npm consigliati
| Script | Comando | Note |
| --- | --- | --- |
| `dev` | `vite` | Avvio sviluppo con HMR.【F:package.json†L6-L11】 |
| `build` | `vite build` | Build prod (warning bundle >500 kB).【F:package.json†L6-L11】【54bea7†L9-L20】 |
| `lint` | `eslint .` | Attualmente fallisce, prioritario sistemare.【F:package.json†L6-L11】【1b4441†L1-L23】 |
| `preview` | `vite preview` | Serve dopo `build` per check statico.【F:package.json†L6-L11】 |
| Suggeriti | `typecheck`, `db:migrate`, `db:seed`, `test` | Da aggiungere per orchestrare Supabase CLI e test automatizzati. |

---

## 10. Checklist di rilascio
1. ✅ Lint/test/build verdi (CI).【1b4441†L1-L23】【54bea7†L9-L20】
2. ✅ Variabili `.env` compilate e segreti gestiti (Vault/CI).【F:.env.example†L4-L41】
3. ✅ Migrazioni Supabase applicate + seed (`docs/schema.sql`, `docs/seed.sql`).【F:docs/schema.sql†L1-L135】【F:docs/seed.sql†L4-L64】
4. ✅ Policy RLS verificate (`docs/rls-policies.sql`).【F:docs/rls-policies.sql†L1-L84】
5. ✅ Webhook Stripe registrato e testato con `stripe trigger` seguendo playbook.【F:docs/stripe-webhooks.md†L5-L21】
6. ✅ Monitoraggio errori e logging configurati (Sentry/Logflare) usando placeholder `.env`.
7. ✅ Documentazione API aggiornata (`docs/openapi.json`) e condivisa con backend/mobile.【F:docs/openapi.json†L1-L200】
8. ✅ QA manuale su user journeys worker/employer (registrazione, creazione missione, accettazione, pagamento, chat).

---

## 11. Allegati prodotti
- `.env.example` aggiornato con descrizioni.【F:.env.example†L1-L41】
- `docs/audit-report.md` (questo documento).
- `docs/schema.sql`, `docs/seed.sql`, `docs/rls-policies.sql` per DB. 【F:docs/schema.sql†L1-L135】【F:docs/seed.sql†L4-L64】【F:docs/rls-policies.sql†L1-L84】
- `docs/openapi.json` per superficie API.【F:docs/openapi.json†L1-L200】
- `docs/stripe-webhooks.md` con playbook eventi.【F:docs/stripe-webhooks.md†L1-L21】
- `docs/buglist.json` con backlog bug prioritizzati.【F:docs/buglist.json†L1-L138】

