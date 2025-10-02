# Next.js + Prisma + Supabase - Reglas de Desarrollo

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Base de Datos**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Lenguaje**: TypeScript (estricto)
- **Estilos**: Tailwind CSS + CSS Variables
- **i18n**: react-i18next
- **Validación**: Zod
- **Auth**: Supabase Auth

---

## Estructura de Proyecto

```
/src
  /app
    /(auth)
    /(dashboard)
    /actions          # Server Actions
    /api              # API Routes
  /components
    /ui               # Componentes base (Button, Input, Card)
    /features         # Componentes específicos de features
    /layouts          # Layouts compartidos
  /lib
    /prisma
      /client.ts
      /queries        # Queries complejas
    /supabase
      /client.ts
      /server.ts
    /utils
    /validations      # Esquemas Zod
  /hooks
  /types
  /styles             # globals.css con CSS variables
  /i18n
    /locales
      /es
        /common.json
        /auth.json
        /[feature].json
      /en
    /config.ts
    /client.ts
    /server.ts
/prisma
  /schema.prisma
  /migrations
```

---

## Reglas TypeScript

### Configuración Estricta OBLIGATORIA

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

### Nomenclatura

- **Archivos**: PascalCase para componentes, camelCase para utils
- **Variables/Funciones**: camelCase
- **Tipos/Interfaces**: PascalCase
- **Constantes globales**: UPPER_SNAKE_CASE

### Prohibiciones

- ❌ NUNCA usar `any` → usar tipos específicos o `unknown`
- ❌ NUNCA usar `as any` → usar type guards
- ❌ NUNCA imports de `default export` innecesarios

---

## Prisma + Supabase

### Schema Base

```prisma
// Todos los modelos DEBEN incluir:
model User {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  email     String   @unique
  name      String?
  
  @@map("users")
}
```

**Reglas**:
- Nombres: PascalCase en Prisma, snake_case en DB con `@map`
- Tablas: plural con `@@map`

### Cliente Prisma

```typescript
// lib/prisma/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Server Actions (OBLIGATORIO para mutaciones)

```typescript
// app/actions/users.ts
'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function createUser(formData: FormData) {
  const result = schema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  });
  
  if (!result.success) {
    return { success: false, error: result.error.flatten() };
  }

  try {
    const user = await prisma.user.create({ data: result.data });
    revalidatePath('/users');
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: 'Error al crear usuario' };
  }
}
```

### Supabase Auth

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// lib/auth/session.ts
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');
  return session;
}
```

---

## Componentes

### Server vs Client

**Server por defecto**, `'use client'` solo cuando:
- Necesitas hooks (useState, useEffect)
- Event listeners (onClick, onChange)
- Browser APIs (localStorage, window)

```typescript
// ✅ Server Component
export default async function UsersPage() {
  const users = await prisma.user.findMany();
  return <UserList users={users} />;
}

// ✅ Client Component
'use client';
export function UserList({ users }: { users: User[] }) {
  const [filter, setFilter] = useState('');
  // ...
}
```

### Estructura

```typescript
interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  className?: string;
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  return (
    <Card className={className}>
      {/* content */}
    </Card>
  );
}
```

---

## Estilos y Theming

### CSS Variables (OBLIGATORIO)

```css
/* styles/globals.css */
@layer base {
  :root {
    --color-primary: 222 47% 11%;
    --color-primary-foreground: 210 40% 98%;
    --color-background: 0 0% 100%;
    --color-foreground: 222 47% 11%;
    --color-border: 214 32% 91%;
    --radius-md: 0.5rem;
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }

  .dark {
    --color-primary: 210 40% 98%;
    --color-background: 222 47% 11%;
    --color-foreground: 210 40% 98%;
  }
}
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          foreground: 'hsl(var(--color-primary-foreground))',
        },
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        border: 'hsl(var(--color-border))',
      },
      borderRadius: {
        md: 'var(--radius-md)',
      },
    },
  },
};
```

### Componentes UI Base

```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-11 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
```

```typescript
// lib/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Reglas de Estilo

- ❌ **PROHIBIDO**: Colores hardcodeados (`bg-blue-500`)
- ✅ **OBLIGATORIO**: Variables CSS (`bg-primary`)
- ✅ Mobile-first responsive
- ✅ Usar `cn()` para composición de clases

---

## Internacionalización (react-i18next)

### Setup

```bash
npm install react-i18next i18next i18next-resources-to-backend
```

### Configuración

```typescript
// i18n/config.ts
export const defaultLocale = 'es' as const;
export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

// i18n/client.ts
'use client';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { defaultLocale, locales } from './config';

i18next
  .use(initReactI18next)
  .use(resourcesToBackend((lng: string, ns: string) => 
    import(`./locales/${lng}/${ns}.json`)
  ))
  .init({
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    supportedLngs: locales,
    defaultNS: 'common',
  });

export default i18next;

// i18n/server.ts
import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { defaultLocale, type Locale } from './config';

export async function initServerI18n(locale: Locale = defaultLocale, ns: string = 'common') {
  const i18n = createInstance();
  await i18n
    .use(initReactI18next)
    .use(resourcesToBackend((lng: string, ns: string) => 
      import(`./locales/${lng}/${ns}.json`)
    ))
    .init({
      lng: locale,
      fallbackLng: defaultLocale,
      defaultNS: 'common',
      ns,
    });
  return i18n;
}
```

### Provider

```typescript
// components/providers/I18nProvider.tsx
'use client';
import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from '@/i18n/client';
import type { Locale } from '@/i18n/config';

export function I18nProvider({ children, locale }: { children: ReactNode; locale?: Locale }) {
  useEffect(() => {
    if (locale && i18next.language !== locale) {
      i18next.changeLanguage(locale);
    }
  }, [locale]);

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}

// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

### Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales } from './i18n/config';

export function middleware(request: NextRequest) {
  let locale = defaultLocale;
  
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    locale = cookieLocale;
  } else {
    const browserLocale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0];
    if (browserLocale && locales.includes(browserLocale as any)) {
      locale = browserLocale;
    }
  }

  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',],
};
```

### Helper para Server

```typescript
// lib/i18n/getServerLocale.ts
import { cookies, headers } from 'next/headers';
import { defaultLocale, type Locale } from '@/i18n/config';

export async function getServerLocale(): Promise<Locale> {
  const headersList = await headers();
  const cookieStore = await cookies();
  
  return (
    headersList.get('x-locale') || 
    cookieStore.get('NEXT_LOCALE')?.value || 
    defaultLocale
  ) as Locale;
}
```

### Estructura de Traducciones

```json
// i18n/locales/es/common.json
{
  "save": "Guardar",
  "cancel": "Cancelar",
  "delete": "Eliminar",
  "edit": "Editar",
  "loading": "Cargando..."
}

// i18n/locales/es/auth.json
{
  "login": "Iniciar sesión",
  "email": "Correo electrónico",
  "password": "Contraseña",
  "errors": {
    "invalidCredentials": "Credenciales inválidas"
  }
}

// i18n/locales/es/validation.json
{
  "required": "Este campo es requerido",
  "email": {
    "invalid": "El correo electrónico no es válido"
  },
  "password": {
    "minLength": "La contraseña debe tener al menos {{min}} caracteres"
  }
}
```

### Uso

```typescript
// Cliente
'use client';
import { useTranslation } from 'react-i18next';

export function UserCard() {
  const { t } = useTranslation(['users', 'common']);
  return <button>{t('common:edit')}</button>;
}

// Servidor
import { getServerLocale } from '@/lib/i18n/getServerLocale';
import { initServerI18n } from '@/i18n/server';

export default async function UsersPage() {
  const locale = await getServerLocale();
  const { t } = await initServerI18n(locale, 'users');
  return <h1>{t('title')}</h1>;
}

// Server Actions
'use server';
export async function createUser(formData: FormData) {
  const locale = await getServerLocale();
  const { t } = await initServerI18n(locale, 'users');
  // ... use t()
}
```

### Cambio de Idioma

```typescript
'use client';
import { useTranslation } from 'react-i18next';
import { locales, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = async (locale: Locale) => {
    await i18n.changeLanguage(locale);
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => changeLanguage(locale)}
          className={i18n.language === locale ? 'active' : ''}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

---

## Validación (Zod)

### Esquemas

```typescript
// lib/validations/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('validation:email.invalid'),
  name: z.string().min(2, 'validation:name.minLength'),
  role: z.enum(['ADMIN', 'USER', 'VIEWER']),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### Validación en Cliente

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function CreateUserForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createUserSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

---

## Manejo de Errores

### Error Boundary

```typescript
// app/error.tsx
'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={reset}>Intentar de nuevo</button>
    </div>
  );
}
```

### Server Actions Response Type

```typescript
// lib/utils/actionResponse.ts
export type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

---

## Performance

```typescript
// Optimización de imágenes
import Image from 'next/image';
<Image src="/avatar.jpg" alt="Avatar" width={200} height={200} />

// Lazy loading
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('@/components/Chart'), { ssr: false });

// Streaming
import { Suspense } from 'react';
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>
```

---

## Seguridad

### Variables de Entorno

```bash
# .env (NO commitear)
DATABASE_URL=""
DIRECT_URL=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""  # Solo server-side
```

**Regla**: Solo variables con `NEXT_PUBLIC_` son accesibles en el cliente.

### RLS en Supabase

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);
```

---

## Checklist Esencial

### Setup Inicial
- [ ] TypeScript estricto
- [ ] Prisma schema con campos base (id, createdAt, updatedAt)
- [ ] Supabase conectado con RLS activado
- [ ] CSS variables definidas
- [ ] react-i18next configurado

### Desarrollo
- [ ] NUNCA usar `any`
- [ ] NUNCA colores hardcodeados
- [ ] SIEMPRE usar Server Actions para mutaciones
- [ ] SIEMPRE validar con Zod
- [ ] SIEMPRE traducir textos con i18n
- [ ] SIEMPRE usar `'use client'` solo cuando sea necesario

---

## Comandos

```bash
# Desarrollo
npm run dev

# Prisma
npx prisma generate
npx prisma db push
npx prisma migrate dev
npx prisma studio

# Build
npm run build
```

---

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [react-i18next](https://react.i18next.com)
- [Zod](https://zod.dev)

---

**Principio**: Código limpio, tipado, temable y traducible.