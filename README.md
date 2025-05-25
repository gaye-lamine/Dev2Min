# Dev2Min 🎙️

➡️ [Essayez l'app en ligne](https://2min.netlify.app/) 

**Dev2Min** est une application de micro-podcasts tech, conçue pour permettre aux développeurs africains (et au-delà) de partager des idées, tips ou expériences en **2 minutes max**.  
📱 Version Web Progressive (PWA), pensée mobile-first.

---

## 🚀 Stack Technique

- React (TypeScript)
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- MediaRecorder API (enregistrement audio)
- PWA Ready

---

## ✨ Fonctionnalités

- 🔐 Authentification via email/password (Supabase)
- 🎙️ Enregistrement audio depuis le navigateur (max 2 minutes)
- ☁️ Upload automatique de l'audio vers Supabase Storage
- 🗂️ Publication d’un mini épisode (titre + lien audio)
- 🔊 Lecture des podcasts via un lecteur intégré
- 📲 Installation sur mobile (PWA)

---

## 🛠️ Installation (local)

```bash
git clone https://github.com/gaye-lamine/dev2min.git
cd dev2min
npm install
npm run dev
