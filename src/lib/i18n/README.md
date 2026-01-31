# 🌐 Multilingual Support (i18n) - Implementation Guide

## 📁 Files Created

```
src/lib/i18n/
├── translations.ts       # All translations for 6 languages
├── LanguageContext.tsx   # React Context for language state
├── LanguageSwitcher.tsx  # UI component for language selection
└── USAGE_EXAMPLES.tsx    # Examples of how to use the system
```

## 🚀 Quick Start

### Step 1: Wrap Your App with LanguageProvider

In your `App.tsx` or `main.tsx`:

```tsx
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      {/* Your app components */}
      <YourAppContent />
    </LanguageProvider>
  );
}
```

### Step 2: Add Language Switcher

Place the `LanguageSwitcher` component anywhere in your UI:

```tsx
import { LanguageSwitcher } from '@/lib/i18n/LanguageSwitcher';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <LanguageSwitcher />  {/* Default style */}
      {/* OR */}
      <LanguageSwitcher variant="compact" />  {/* Compact style */}
    </header>
  );
}
```

### Step 3: Use Translations in Components

```tsx
import { useLanguage } from '@/lib/i18n/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();  // t = translate function

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('save')}</button>
      <p>{t('dashboard')}</p>
    </div>
  );
}
```

## 📖 Supported Languages

1. 🇬🇧 **English** (en) - Default
2. 🇮🇳 **Hindi** (hi) - हिंदी
3. 🇮🇳 **Marathi** (mr) - मराठी
4. 🇮🇳 **Tamil** (ta) - தமிழ்
5. 🇮🇳 **Telugu** (te) - తెలుగు
6. 🇮🇳 **Bengali** (bn) - বাংলা

## ✨ Features

✅ **Instant language switching** - No page reload  
✅ **localStorage persistence** - Language preference saved  
✅ **Fallback support** - Falls back to English if translation missing  
✅ **Type-safe** - TypeScript support with autocomplete  
✅ **Accessible** - Updates HTML lang attribute  
✅ **Easy to extend** - Add new languages or translations easily

## 🔧 How to Add New Translations

### 1. Open `translations.ts`

### 2. Add new key to English translations:

```typescript
en: {
  // ... existing translations
  myNewKey: "My New Text",
}
```

### 3. Add the same key to ALL languages:

```typescript
hi: {
  // ... existing translations
  myNewKey: "मेरा नया पाठ",
},
mr: {
  // ... existing translations
  myNewKey: "माझा नवीन मजकूर",
},
// ... repeat for ta, te, bn
```

### 4. Use it in your component:

```tsx
<p>{t('myNewKey')}</p>
```

## 🎨 LanguageSwitcher Variants

### Default Variant (Box style with shadow)
```tsx
<LanguageSwitcher />
```

### Compact Variant (Minimal style)
```tsx
<LanguageSwitcher variant="compact" />
```

### Custom Styling
```tsx
<LanguageSwitcher className="my-custom-class" />
```

## 🔍 Available Translation Keys

Common keys available in all languages:

### General
- `welcome`, `loading`, `error`, `success`
- `save`, `cancel`, `delete`, `edit`, `close`, `search`

### Navigation
- `home`, `appointments`, `records`, `reports`
- `consultation`, `medicalStore`, `wellness`
- `settings`, `logout`

### Dashboard
- `dashboard`, `goodMorning`, `goodAfternoon`, `goodEvening`
- `welcomeBack`, `yourHealth`, `ourPriority`

### Appointments
- `bookAppointment`, `nextAppointment`
- `availableNow`, `joinCall`

### Vitals
- `bloodPressure`, `bloodSugar`, `heartRate`, `oxygenLevel`
- `checkYourVitals`, `enterHealthNumbers`

### Auth
- `signIn`, `signUp`, `email`, `password`
- `fullName`, `phoneNumber`

## 💡 Best Practices

1. **Always use translation keys** instead of hardcoded text
   ```tsx
   // ❌ Bad
   <button>Save</button>
   
   // ✅ Good
   <button>{t('save')}</button>
   ```

2. **Add translations for ALL languages** when adding new keys
   - This ensures no language is left with missing translations

3. **Use descriptive key names**
   ```tsx
   // ❌ Bad
   text1: "Click here",
   
   // ✅ Good
   clickHereToStart: "Click here",
   ```

4. **Keep translations short and clear**
   - UI text should be concise in all languages

## 🐛 Troubleshooting

### Text not changing when switching language?
- Make sure you wrapped your app with `<LanguageProvider>`
- Check that you're using `t('key')` instead of hardcoded text

### Translation showing as key name?
- The key doesn't exist in translations.ts
- Check spelling of the key
- Make sure the key exists in the English translation

### Language not persisting on refresh?
- Check browser localStorage is enabled
- The system auto-saves to localStorage on language change

## 📝 Example Integration

Here's a complete example of a component using the i18n system:

```tsx
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from '@/lib/i18n/LanguageSwitcher';

function Dashboard() {
  const { t, language } = useLanguage();
  
  return (
    <div>
      {/* Language selector in header */}
      <header>
        <h1>{t('dashboard')}</h1>
        <LanguageSwitcher variant="compact" />
      </header>
      
      {/* Translated content */}
      <main>
        <h2>{t('welcomeBack')}</h2>
        <div className="vitals">
          <h3>{t('checkYourVitals')}</h3>
          <p>{t('bloodPressure')}: 120/80</p>
          <p>{t('bloodSugar')}: 95</p>
        </div>
        
        <button>{t('bookAppointment')}</button>
      </main>
      
      {/* Current language indicator */}
      <footer>
        <p>Current: {language}</p>
      </footer>
    </div>
  );
}
```

## 🎯 Next Steps

1. Wrap your `App.tsx` with `LanguageProvider`
2. Add `LanguageSwitcher` to your header/navigation
3. Replace all hardcoded text with `t('key')`
4. Test switching between languages
5. Add more translations as needed!

---

**Need help?** Check `USAGE_EXAMPLES.tsx` for more examples!
