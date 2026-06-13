# 🤖 Backend — Emploi Concours CI (Supabase)

Collecteur automatique + API sécurisée (webhook GeniusPay).

## 🔐 Sécurité — règles appliquées

| Règle | Implémentation |
|---|---|
| Secrets en `.env` uniquement | Aucune clé en dur. `dotenv` chargé partout. `.env` dans `.gitignore`, `.env.example` fourni |
| Clé `service_role` côté serveur seulement | `backend/lib/supabase.js` — jamais importé par le frontend |
| Clé `anon` seule au frontend | `src/lib/supabaseClient.ts` (variables `VITE_*`) |
| RLS sur toutes les tables | `supabase/schema.sql` — chaque table a ses policies |
| Un utilisateur ne voit que ses données | Policies `auth.uid() = user_id` sur profiles, favoris, quiz, paiements |
| CORS restreint | Fonctions appelées en same-origin via Vercel (`/api/*`) |
| Pas d'erreur technique au client | Toutes les routes répondent `{ "error": "Une erreur est survenue" }` |
| Logs d'erreurs → Sentry | Fonctions Vercel `/api/*` (si `SENTRY_DSN`) |
| Rate limiting | 60 req/min/IP sur tous les endpoints |
| Headers de sécurité | nosniff, X-Frame-Options DENY, HSTS 1 an, CSP, Referrer-Policy |
| Paiement validé par webhook seul | Signature HMAC-SHA256 vérifiée (timing-safe) AVANT toute activation |
| Plan non modifiable par le client | Trigger SQL `protect_plan_columns` : seul `service_role` peut changer `plan` |
| Limite quiz infalsifiable | Trigger SQL `enforce_quiz_free_limit` côté base |

## 🚀 Installation

### 1. Créer les tables Supabase

Dashboard Supabase → **SQL Editor** → coller et exécuter :

```
supabase/schema.sql
```

Cela crée : `profiles`, `listings`, `saved_listings`, `quiz_attempts`,
`payments`, `purchased_papers`, `scrape_logs`, `contact_messages`
— avec **RLS activé** et toutes les policies.

### 2. Configurer les clés

```bash
cp .env.example .env
# puis remplir : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
#                VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
#                RESEND_*, GENIUSPAY_*, SENTRY_DSN
```

⚠ Le repo GitHub doit être **PRIVÉ**. Vérifier que `.env` n'apparaît
jamais dans `git status` avant tout commit.

### 3. Lancer

```bash
node backend/collector.js     # collecte unique (test)
node backend/scheduler.js     # collecte immédiate + toutes les 6h
node backend/digest.js        # envoi manuel du digest email Resend
node backend/show-logs.js     # journal des exécutions (table scrape_logs)
```

Production (pm2) :
```bash
pm2 start backend/scheduler.js --name collecteur-ecci
pm2 save
```

## 📡 Pipeline de collecte (toutes les 6h)

```
1. Scrape 10 sites officiels de concours
   INFAS · CAFOP · ENS · INFJ · Police · Défense/Gendarmerie/AFA
   INJS · INSFS · IPNETP · MEMFPMA/GUCACI
2. Scrape l'emploi public (Agence Emploi Jeunes, Fonction Publique)
3. Scrape Google News (RSS) :
   « concours Côte d'Ivoire 2026 » · « offre emploi public Côte d'Ivoire »
   · « recrutement Côte d'Ivoire »
4. Déduplication : hash SHA-256 (titre normalisé + URL) vs table listings
5. Tag automatique : 'emploi' ou 'concours'
6. Journalisation dans scrape_logs (heure, durée, totaux, erreurs)
7. Envoi email séparé : digest Resend lundi et jeudi
   (type + secteurs + niveau) — lus depuis profiles avec service_role
```

## 💳 Webhook GeniusPay

`POST /api/webhook-geniuspay`

1. **Vérification de la signature** HMAC-SHA256 (`x-webhook-signature`) avec
   `GENIUSPAY_WEBHOOK_SECRET` — comparaison en temps constant.
   Signature invalide → 401, rien n'est traité.
2. Enregistrement idempotent dans `payments` (unicité transaction).
3. **Si et seulement si** `status === 'success'` :
   - `kind=abonnement` → `profiles.plan='premium'` + expiry +1 mois
   - `kind=sujet` → ligne dans `purchased_papers`
4. Le client n'est **jamais** cru : aucune activation côté frontend.

## 🗄 Fréquence

| Souhait | Variable |
|---|---|
| Toutes les 6 h (défaut) | `COLLECT_CRON='0 */6 * * *'` |
| 1 fois par jour à 6h | `COLLECT_CRON='0 6 * * *'` |
| Emails candidats lundi/jeudi à 8h | `EMAIL_DIGEST_CRON='0 8 * * 1,4'` |

Fuseau : `Africa/Abidjan`.
