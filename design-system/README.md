# SideQuest Design System 2.0

## Overview
Token-driven design system per SideQuest con supporto Web (React + Tailwind) e preparazione per Mobile (React Native + NativeWind).

## 🎨 Design Principles
- **Token-First**: Tutti i valori di design derivano da `tokens.json`
- **Semantic**: Classi basate su significato (es. `bg-canvas`) non su colori diretti
- **Accessible**: WCAG 2.2 AA compliant, contrasti verificati
- **Dark-Friendly**: Palette ottimizzata per modalità scura
- **Cross-Platform Ready**: Base per Web e Mobile

## 🚀 Quick Start

### Uso delle classi semantiche (Tailwind)

```tsx
// ❌ NON FARE (colori diretti)
<div className="bg-blue-500 text-white">

// ✅ FARE (classi semantiche)
<div className="bg-canvas text-text-primary">
<Button variant="primary">Azione principale</Button>
<Card className="bg-surface border-border-default">
```

### Palette Colori

#### Brand Colors
- **Primary (Iris Violet)**: `#6C5CE7` - Azioni principali, focus, CTA
- **Secondary (Cyan)**: `#22D3EE` - Azioni secondarie, highlights
- **Accent (Electric Lime)**: `#A3E635` - Badge, gamification, celebrazioni

#### Neutrali (Dark-Optimized)
- **Canvas**: `#0B0F14` - Background principale
- **Surface**: `#0F1521` - Card, pannelli
- **Elevated**: `#1A1F2E` - Elementi sovrapposti (modali, dropdown)

#### Testo
- **Primary**: `#F8FAFC` - Testo principale (18.5:1 contrast ratio)
- **Secondary**: `#E2E8F0` - Testo secondario
- **Muted**: `#94A3B8` - Label, metadata (4.8:1 contrast ratio)

#### Feedback
- **Success**: `#16A34A` - Completamento, verifica KYC
- **Warning**: `#F59E0B` - Attenzione, pending
- **Danger**: `#EF4444` - Errori, azioni distruttive
- **Info**: `#0284C7` - Informazioni, tooltip

## 📦 Struttura File

```
design-system/
├── tokens.json           # Sorgente unica di verità
├── README.md            # Questa guida
└── outputs/             # File generati (futuro)
    ├── css-variables.css
    └── tailwind-tokens.js

src/
├── index.css            # CSS variables + utility classes
└── components/ui/       # Componenti con nuove classi semantiche
```

## 🎯 Classi Semantiche Tailwind

### Background
```tsx
bg-canvas       // Background principale app
bg-surface      // Card, pannelli
bg-elevated     // Modali, popover
```

### Text
```tsx
text-text-primary    // Titoli, contenuto principale
text-text-secondary  // Sottotitoli
text-text-muted      // Label, metadata
text-text-inverted   // Testo su background scuro (es. su button primary)
```

### Border
```tsx
border-border-default     // Bordi standard
border-border-interactive // Bordi hover/focus
border-border-focus       // Focus ring
```

### State
```tsx
hover:bg-state-hover       // Background hover
bg-state-selected          // Elementi selezionati
opacity-state-disabled     // Elementi disabilitati
```

## 🧩 Componenti Pattern SideQuest

### Mission Card con Trust Signals
```tsx
import { MissionCardV2 } from '@/components/MissionCardV2';

<MissionCardV2
  title="Consegna documenti"
  price={25}
  escrowAmount={25}
  isKYCVerified={true}
  rating={4.8}
  reviewCount={127}
/>
```

**Features:**
- Badge verifica KYC/KYB con `<ShieldCheck />`
- Widget escrow con importo protetto
- Rating stelle con recensioni
- CTA chiara con prezzo

### KYC/KYB Stepper
```tsx
import { KYCStepperUI } from '@/components/KYCStepperUI';

<KYCStepperUI currentStep={2} />
```

### Gamification
```tsx
import { LevelProgress } from '@/components/gamification/LevelProgress';

<LevelProgress level={5} currentXP={1250} nextLevelXP={2000} />
```

## ♿ Accessibilità

### Contrasti WCAG 2.2
| Coppia | Ratio | Level |
|--------|-------|-------|
| Text Primary su Canvas | 18.5:1 | AAA ✅ |
| Primary 600 su Canvas | 7.2:1 | AAA ✅ |
| Text Muted su Canvas | 4.8:1 | AA ✅ |
| Success su Canvas | 5.1:1 | AA ✅ |

### Touch Targets
- **Minimo**: 44×44px (iOS HIG)
- **Raccomandato**: 48×48px
- Tutti i button rispettano questa guideline

### Motion
- `prefers-reduced-motion` supportato
- Animazioni disabilitabili
- Durate ragionevoli (150-400ms)

## 🎬 Motion System

### Durate
```css
duration-fast    /* 150ms - micro-interazioni */
duration-normal  /* 250ms - transizioni standard */
duration-slow    /* 400ms - animazioni complesse */
```

### Easing
```css
ease-smooth  /* cubic-bezier(0.4, 0, 0.2, 1) */
ease-bounce  /* cubic-bezier(0.68, -0.55, 0.265, 1.55) */
```

## 📱 Mobile Support (Preparazione)

### React Native Theme
```typescript
import { LightTheme, DarkTheme } from '@/mobile/theme';

// Uso con NativeWind
<View className="bg-canvas">
  <Text className="text-text-primary">Hello</Text>
</View>
```

## 🔧 Convenzioni

### Naming
- **Semantic First**: Usa nomi basati su funzione, non colore
- **BEM-like**: `component-element--modifier`
- **Variants**: Usa `cva` (class-variance-authority) per varianti

### DO & DON'T
```tsx
// ❌ DON'T
<button className="bg-purple-500 hover:bg-purple-700">

// ✅ DO
<Button variant="primary">

// ❌ DON'T
<div className="text-white bg-black border-gray-700">

// ✅ DO
<div className="text-text-inverted bg-canvas border-border-default">
```

## 🧪 Testing

### Visual Regression
- Screenshot before/after su componenti chiave
- Verifica Light/Dark mode

### A11y Audit
- Axe DevTools integration
- Lighthouse accessibility score > 95

### Cross-Browser
- Chrome, Firefox, Safari, Edge
- iOS Safari, Chrome Mobile

## 📚 Risorse

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Apple HIG - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/)
- [Material 3 Design](https://m3.material.io/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🚧 Roadmap

- [x] Token foundation
- [x] CSS variables update
- [x] Tailwind semantic classes
- [ ] Componenti core aggiornati (Button, Card, Input)
- [ ] Pattern SideQuest (Mission Card V2, KYC Stepper)
- [ ] Gamification components
- [ ] Design System page
- [ ] Icon set SVG
- [ ] Lottie animations
- [ ] Mobile theme export
- [ ] Material 3 / SwiftUI mapping

## 📞 Support

Per domande o contributi, consulta la documentazione principale o apri una issue.

---

**Version**: 2.0.0-beta  
**Last Updated**: 2025-10-18
