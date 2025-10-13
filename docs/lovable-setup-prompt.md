# Prompt per Lovable – Setup completo SideQuest

## Contesto sintetico
- **Stack**: Vite + React + TypeScript, Supabase (DB/Auth/Realtime), Stripe (test), React Query.
- **Problema attuale**: su desktop la dashboard non carica in modo affidabile; molte feature server-side sono incomplete o disallineate con il front-end.
- **Outcome atteso**: portare l'app ad uno stato pienamente funzionante e sincronizzato tra front-end e backend, con esperienza desktop-first.

## Obiettivi prioritari
1. **Stabilizzare l'accesso desktop**
   - Routing coerente con guardie (ProtectedRoute + RoleGuard).
   - Dashboard caricabile con layout responsive (desktop prioritario, mobile non regressivo).
   - Bottom navigation visibile solo dove serve; layout desktop con sezioni distinte.

2. **Allineare backend e frontend**
   - Catalogo missioni completo (CRUD, filtri, paginazione, "consigliate", "vedi tutte").
   - Catalogo utenti/profili con ruoli e collegamento alle missioni.
   - Creazione missione end-to-end (form validata → insert DB → comparsa nel catalogo con stati coerenti).
   - Chat missione realtime (storico + allegati minimi).
   - Badge page (scheda utente con badge/achievements e regole base).
   - Autocomplete vie/località su campo indirizzo (tabella `streets` con indice trigram o fonte esterna).

3. **Esperienza Home desktop-first**
   - Hero compatta + missioni consigliate + CTA "Vedi tutte".
   - Accesso rapido al Portafoglio dalla Home.
   - Profilo accessibile/modificabile.
   - Categorie complete (es. web/digital, supporto emotivo, ecc.) con "Mostra altro".
   - Se la "divisione in 4" attuale non è adatta al desktop, convergere su un'unica pagina con sezioni chiare e spaziatura ampia.

## Vincoli e linee guida
- **Affidabilità dati**: React Query abilitato solo dopo che la sessione è pronta; gestire loading/error esplicitamente.
- **Sicurezza**: RLS Supabase per ruoli (owner/runner/admin); nessun dato sensibile in client senza protezione.
- **Performance**: indicizzare query (`status`, `created_at`, ricerca testo); usare lazy loading/pagination per liste.
- **Accessibilità**: ruoli ARIA, gestione focus, contrasto adeguato, navigazione tastiera.
- **Responsive**: desktop è la priorità ma il mobile non deve peggiorare.

## Deliverable richiesti
- **Schema DB & migrazioni** per: `missions`, `profiles/users`, `categories`, `conversations/messages`, `streets` (autocomplete), `badges`.
- **API / Edge Functions** (se necessarie) per: creazione/aggiornamento missioni, listing filtrato/paginato, chat realtime, autocomplete vie.
- **Pagine/Sezioni** aggiornate: Home (missioni consigliate + CTA "Vedi tutte" + wallet quick access), Missions list (filtri/paginazione), Mission details (info arricchite + CTA), Create mission (validazione + insert), User catalog + profilo pubblico, Chat, Badge page.
- **Dashboard desktop** funzionante (routing/guardie, layout coerente) con profilo/edit operativo.
- **/debug/auth** e note di test manuale.
- `.env.example` aggiornato + documentazione su Redirect URL Supabase e variabili richieste da Lovable.
- CI verde: `npm run typecheck && npm run lint && npm run build`.

## Criteri di accettazione
- Da desktop funzionano: `/dashboard`, `/missions`, `/missions/:id`, `/create-mission`, `/chat`, `/profile`, `/badges`.
- Creando una missione dal form, questa appare nel catalogo con stato e dettagli coerenti.
- Home mostra blocco "missioni consigliate" con CTA "Vedi tutte".
- Categorie navigabili con pulsante "Mostra altro".
- Autocomplete vie attivo e reattivo sul campo indirizzo.
- Nessun freeze in login, nessuna 404 inattesa; routing con deep-link post-login.

## Note finali
- Libertà nel proporre varianti architetturali (es. Supabase Edge Functions vs API dedicate) purché motivate nella PR e ottimizzate per affidabilità/tempo.
- Documentare nelle PR scelte tecniche, migrazioni e test manuali eseguiti.
- Coordinarsi con i fallback esistenti: mantenere demo data solo come backup quando il backend non risponde.

Fornisci una PR (o serie di PR piccole) che copra gli obiettivi sopra, con descrizione dettagliata, checklist di test e indicazioni su eventuali step manuali lato Supabase/Stripe.
