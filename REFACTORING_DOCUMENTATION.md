# Diner Theater Reserveringen - Refactoring Documentatie

## Overzicht van de Refactoring

Dit document beschrijft de uitgebreide refactoring die is uitgevoerd op het Diner Theater Reserveringsapplicatie om de codebase te moderniseren, de onderhoudbaarheid te verbeteren en een betere ontwikkelaarservaring te bieden.

## 🎯 Doelstellingen

- **Code Organisatie**: Herstructurering van mappenstructuur voor betere navigatie
- **State Management**: Implementatie van Zustand voor centraal state beheer
- **UI Consistentie**: Integratie van Radix UI voor consistente interface elementen
- **Internationalisatie**: i18n implementatie voor meertalige ondersteuning
- **Service Architectuur**: Scheiding van Firebase logica naar dedicated services
- **Type Safety**: Verbeterde TypeScript ondersteuning

## 📁 Nieuwe Mappenstructuur

```
src/
├── components/          # UI Componenten
│   ├── ui/             # Herbruikbare UI elementen (Button, Modal, etc.)
│   ├── layout/         # Layout componenten
│   ├── forms/          # Formulier componenten
│   ├── calendar/       # Kalender specifieke componenten
│   └── ...
├── pages/              # Pagina componenten
├── context/            # React Context providers
├── stores/             # Zustand state stores
├── services/           # Firebase en externe service lagen
├── hooks/              # Custom React hooks
├── i18n/               # Internationalisatie bestanden
├── types/              # TypeScript type definities
└── utils/              # Utility functies
```

## 🔧 Belangrijke Veranderingen

### 1. State Management met Zustand

Geïmplementeerde stores:
- **ReservationStore**: Beheer van alle reserveringen
- **ShowStore**: Beheer van voorstellingen en shows
- **UserStore**: Gebruikersauthenticatie en profiel data

```typescript
// Voorbeeld gebruik
import { useReservationStore } from '../stores';

const reservations = useReservationStore(state => state.reservations);
const addReservation = useReservationStore(state => state.addReservation);
```

### 2. Service Architectuur

Alle Firebase operaties zijn verplaatst naar dedicated service klassen:
- `ShowEventsService`: Voorstellingen beheer
- `ReservationsService`: Reserveringen beheer
- `WaitingListService`: Wachtlijst functionaliteit
- `CustomersService`: Klant informatie

### 3. UI Component Library

Geïmplementeerde Radix UI componenten:
- **Button**: Consistente knoppen met variants
- **Modal**: Toegankelijke dialogen
- **Input/Textarea**: Formulier velden met validatie
- **Select**: Dropdown selecties
- **Checkbox**: Checkbox elementen

### 4. Internationalisatie (i18n)

- **Nederlandse UI**: Standaard taal voor gebruikersinterface
- **Engelse Code**: Alle code commentaren en variabelen in het Engels
- **Type-safe Translations**: Sterke TypeScript ondersteuning

## 🚀 Gebruikersinstructies

### Voor Ontwikkelaars

#### 1. Nieuwe Componenten Maken

```typescript
// Gebruik de nieuwe UI componenten
import { Button, Modal, Input } from '../components/ui';
import { useI18n } from '../hooks';

const MyComponent = () => {
  const { t } = useI18n();
  
  return (
    <div>
      <Button variant="primary">{t('common.save')}</Button>
    </div>
  );
};
```

#### 2. State Management

```typescript
// Gebruik Zustand stores
import { useReservationStore } from '../stores';

const MyComponent = () => {
  const { reservations, addReservation, isLoading } = useReservationStore();
  
  // Component logica
};
```

#### 3. Firebase Services

```typescript
// Gebruik services in plaats van directe Firebase calls
import { ReservationsService } from '../services';

const reservationsService = new ReservationsService();
const reservations = await reservationsService.getAllReservations();
```

### Voor Content Beheerders

#### Teksten Wijzigen

Teksten kunnen worden gewijzigd in de i18n bestanden:
- **Nederlands**: `src/i18n/locales/nl.json`
- **Engels**: `src/i18n/locales/en.json`

```json
{
  "reservations": {
    "title": "Reserveringen",
    "newReservation": "Nieuwe Reservering"
  }
}
```

## 🗃️ Gearchiveerde Bestanden

De volgende verouderde bestanden zijn verplaatst naar de `archive/` map:
- `AdminCalendarView_backup.tsx`
- `TestCalendarView.tsx`

## 🔄 Migratie Gids

### Van Oude naar Nieuwe Structuur

1. **Context Usage**: Vervang oude context imports door nieuwe unified providers
2. **Component Imports**: Update imports naar nieuwe mappenstructuur
3. **State Logic**: Migreer local state naar Zustand stores waar van toepassing
4. **Firebase Calls**: Vervang directe Firebase calls door service methoden

### Voorbeeld Migratie

**Voor:**
```typescript
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const getReservations = async () => {
  const snapshot = await getDocs(collection(db, 'reservations'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

**Na:**
```typescript
import { useReservations } from '../hooks';

const MyComponent = () => {
  const { reservations, loadReservations } = useReservations();
  
  useEffect(() => {
    loadReservations();
  }, []);
};
```

## 🛠️ Ontwikkel Tools

### Nieuwe Dependencies
- `zustand`: State management
- `@radix-ui/*`: UI componenten
- `react-i18next`: Internationalisatie
- `i18next`: Translation framework

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run type-check   # TypeScript validatie
```

## 📝 Best Practices

### Code Organisatie
1. Gebruik barrel exports (`index.ts`) voor schone imports
2. Groepeer gerelateerde componenten in mappen
3. Houd service logica gescheiden van UI logica

### State Management
1. Gebruik Zustand stores voor gedeelde state
2. Houd local state voor component-specifieke data
3. Implementeer loading en error states consistent

### Styling
1. Gebruik CSS variabelen voor themeing
2. Implementeer responsive design met utility classes
3. Volg bestaande design patterns

## 🔍 Troubleshooting

### Veelvoorkomende Problemen

1. **Import Errors**: Controleer of nieuwe mappenstructuur wordt gebruikt
2. **Type Errors**: Zorg ervoor dat types correct geïmporteerd zijn
3. **Missing Translations**: Voeg ontbrekende keys toe aan i18n bestanden

### Development Tips

1. Gebruik TypeScript strict mode voor betere type safety
2. Implementeer error boundaries voor robuuste error handling
3. Test componenten met verschillende states (loading, error, success)

---

*Deze refactoring verbetert de codebase aanzienlijk en legt een sterke basis voor toekomstige ontwikkeling.*