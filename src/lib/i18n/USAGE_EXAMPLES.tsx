// Example: How to use the i18n system in your components

import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSwitcher } from '@/lib/i18n/LanguageSwitcher';

// Example Component
export function ExampleComponent() {
  const { t, language } = useLanguage();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('yourHealth')}, {t('ourPriority')}</p>
      
      <button>{t('save')}</button>
      <button>{t('cancel')}</button>
      
      <p>Current language: {language}</p>
    </div>
  );
}

// Example: Sidebar Navigation
export function SidebarExample() {
  const { t } = useLanguage();

  return (
    <nav>
      <a href="/home">{t('home')}</a>
      <a href="/appointments">{t('appointments')}</a>
      <a href="/records"}{t('records')}</a>
      <a href="/reports">{t('reports')}</a>
      <a href="/wellness">{t('wellness')}</a>
    </nav>
  );
}

// Example: Dashboard Greeting
export function DashboardGreeting() {
  const { t } = useLanguage();
  const hour = new Date().getHours();
  
  let greeting = t('goodMorning');
  if (hour >= 12 && hour < 18) greeting = t('goodAfternoon');
  if (hour >= 18) greeting = t('goodEvening');

  return <h2>{greeting}! {t('welcomeBack')}</h2>;
}

// Example: Form
export function LoginForm() {
  const { t } = useLanguage();

  return (
    <form>
      <label>{t('email')}</label>
      <input type="email" placeholder={t('email')} />
      
      <label>{t('password')}</label>
      <input type="password" placeholder={t('password')} />
      
      <button type="submit">{t('signIn')}</button>
    </form>
  );
}
