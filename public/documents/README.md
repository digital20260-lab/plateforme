# Documents - Sujets d'Examen

Ce dossier contient les PDF des sujets d'examen téléchargeables par les utilisateurs.

## Fichiers attendus

Pour que le système de téléchargement fonctionne, les fichiers suivants doivent être présents :

| ID | Fichier | Concours | Année |
|----|---------|----------|-------|
| p1 | `infas-2025.pdf` | INFAS | 2025 |
| p2 | `ordre-general-2024.pdf` | Fonction Publique (Culture Générale) | 2024 |
| p3 | `cafop-2024.pdf` | CAFOP | 2024 |
| p4 | `ens-2023.pdf` | ENS Abidjan | 2023 |

## Mise en place des PDFs

### Étape 1 : Copier le PDF de test
Le PDF fourni dans `backend/document/` doit être copié ici :

```bash
cp "backend/document/Support_SUJET D'ORDRE GENERAL 2024  BONNE VERSION.pdf" "public/documents/ordre-general-2024.pdf"
```

### Étape 2 : Tester le téléchargement
1. Aller sur la page de préparation
2. Cliquer sur "Obtenir l'accès" pour un sujet
3. Procéder au paiement (test)
4. Vérifier que le téléchargement fonctionne

### Étape 3 : Ajouter les autres PDFs
Répéter le processus pour chaque concours avec les PDFs correspondants.

## Naming Convention
Les fichiers doivent être nommés en minuscules avec des tirets (pas d'espaces) :
- ✅ `ordre-general-2024.pdf`
- ✅ `infas-2025.pdf`
- ❌ `Support SUJET D'ORDRE GENERAL 2024 BONNE VERSION.pdf`

## API du système

Le système cherche les PDFs à :
- URL : `/documents/{filename}`
- Stockage : `public/documents/`

Les métadonnées sont définies dans `src/data.ts` (array `mockPastPapers`).
