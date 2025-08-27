# Firebase Admin Setup Instructies

## Stap 1: Firebase Console Setup

1. Ga naar [Firebase Console](https://console.firebase.google.com)
2. Selecteer je project: `dinner-theater-booking`
3. Ga naar **Authentication** > **Users**
4. Klik **Add user**
5. Voeg een admin gebruiker toe:
   - Email: `admin@dinnertheater.nl` (of jouw gewenste admin email)
   - Password: Een sterk wachtwoord
   - Klik **Add user**

## Stap 2: Test de Admin Functionaliteit

### Voor bezoekers (niet ingelogd):
1. Open je website: http://localhost:5175
2. Zoek het kleine **©** symbool linksonder
3. Klik 5 keer snel op het © symbool (binnen 3 seconden)
4. De admin login modal verschijnt
5. Log in met je admin credentials
6. Na succesvol inloggen verandert het © symbool naar ⚙️

### Voor ingelogde admin:
1. Het ⚙️ symbool is nu zichtbaar linksonder
2. Klik erop voor admin opties:
   - **OK** = Ga naar admin dashboard
   - **Cancel** = Uitloggen

## Stap 3: Admin Email Configuratie

In `src/contexts/AuthContext.tsx` kun je admin emails aanpassen:

```typescript
const adminEmails = [
    'admin@dinnertheater.nl',
    'beheer@dinnertheater.nl', 
    'bradley@dinnertheater.nl'  // Voeg je eigen email toe
];
```

## Stap 4: Beveiligde Admin Routes

Voor admin-only pagina's, wrap ze in `<ProtectedRoute>`:

```tsx
import { ProtectedRoute } from './components/admin/ProtectedRoute';

// Admin pagina
<ProtectedRoute>
    <AdminDashboard />
</ProtectedRoute>
```

## Functies:

✅ **Discrete toegang**: © symbool voor bezoekers
✅ **Secure login**: Firebase Authentication  
✅ **Remember login**: Email wordt onthouden
✅ **Visual feedback**: ⚙️ voor ingelogde admins
✅ **Auto logout**: Via admin menu
✅ **Protected routes**: Automatische beveiliging
✅ **Error handling**: Gebruiksvriendelijke foutmeldingen

## Security Features:

- Firebase Auth beveiligt alle admin functies
- Admin emails zijn configureerbaar
- Session management via Firebase
- Automatic token refresh
- Secure logout functionaliteit

De implementatie is nu compleet en klaar voor gebruik!
