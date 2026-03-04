Formulaire email actif - Backend (Node.js + Nodemailer)

1) But

  Fournir un backend simple pour recevoir les soumissions du formulaire et envoyer un email via SMTP.

2) Installation

  - Installer les dépendances :

```bash
npm install
```

3) Variables d'environnement

  Créez un fichier `.env` (ne pas commiter) ou définissez les variables d'environnement suivantes :

  - `SMTP_HOST` (ex: smtp.gmail.com)
  - `SMTP_PORT` (ex: 587)
  - `SMTP_SECURE` (true pour SSL/TLS, false pour STARTTLS)
  - `SMTP_USER` (compte SMTP)
  - `SMTP_PASS` (mot de passe/app password)
  - `TO_EMAIL` (adresse destinataire, optionnel)

4) Lancer le serveur

```bash
npm start
```

5) Intégration côté site

  Le front-end envoie un POST JSON sur `/send` (même origine ou via CORS). Le serveur renvoie `{ ok: true }` en cas de succès.

6) Remarques de sécurité

  - Pour Gmail, utilisez un mot de passe d'application ou OAuth2 (non inclus ici).
  - En production, verrouillez l'accès (authentification) et utilisez HTTPS.

7) Stockage des messages

  Par défaut le serveur enregistre chaque message dans le dossier `data/` créé à la racine du projet :

  - `messages.ndjson` : chaque ligne est un JSON (pratique pour l'archivage et l'import)
  - `messages.csv` : fichier CSV avec en-tête, compatible tableurs
  - `messages.json` : tableau JSON complet (pratique pour lecture humaine)

  Ces fichiers sont créés automatiquement lors du premier envoi. Pour une utilisation en production, préférez une vraie base (SQLite, MySQL, MongoDB) si vous attendez un fort trafic.

8) Admin - lister/télécharger

  Le serveur propose une simple interface d'administration :

  - `GET /admin` : page listant les fichiers `messages.csv`, `messages.json`, `messages.ndjson` (si présents) avec liens de téléchargement.
  - `GET /admin/download?file=messages.csv` : télécharge le fichier demandé.

  Protection optionnelle : définir la variable d'environnement `ADMIN_KEY` (ex: `export ADMIN_KEY="monsecret"`). Si `ADMIN_KEY` est définie, il faudra fournir `?key=monsecret` dans l'URL pour accéder aux routes.
