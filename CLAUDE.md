# Reglas de Desarrollo - Next.js + Prisma + Supabase

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Base de Datos**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + CSS Variables
- **Internacionalización**: next-intl
- **Validación**: Zod
- **Autenticación**: Supabase Auth

---

## Estructura de Proyecto

```
/src
  /app
    /[locale]
      /(auth)
      /(dashboard)
      /layout.tsx
      /page.tsx
  /components
    /ui           # Componentes base reutilizables
    /features     # Componentes específicos de features
    /layouts      # Layouts compartidos
  /lib
    /prisma       # Cliente y utilidades de Prisma
    /supabase     # Cliente y helpers de Supabase
    /utils        # Utilidades generales
    /validations  # Esquemas de validación Zod
  /hooks          # Custom hooks
  /types          # Definiciones de tipos TypeScript
  /styles         # Estilos globales y variables CSS
  /messages       # Archivos de traducciones (i18n)
    /es.json
    /en.json
/prisma
  /schema.prisma
  /migrations
```

---

## Principios de Código

### 1. TypeScript Estricto

**SIEMPRE usar TypeScript con configuración estricta:**

```typescript
// tsconfig.json debe incluir
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Evitar `any`, usar tipos específicos o `unknown`:**

```typescript
// ❌ MAL
const data: any = await fetchData();

// ✅ BIEN
const data: User | null = await fetchData();

// ✅ BIEN (cuando el tipo es realmente desconocido)
const data: unknown = await fetchData();
if (isUser(data)) {
  // Type guard
  console.log(data.name);
}
```

### 2. Nomenclatura

**Archivos:**
- Componentes: `PascalCase.tsx` (UserProfile.tsx)
- Utilidades: `camelCase.ts` (formatDate.ts)
- Tipos: `camelCase.types.ts` (user.types.ts)
- Hooks: `use*.ts` (useAuth.ts)

**Variables y funciones:**
- Variables: `camelCase`
- Constantes: `UPPER_SNAKE_CASE` (solo para valores verdaderamente constantes)
- Funciones: `camelCase` con verbos (getUserById, formatCurrency)
- Tipos/Interfaces: `PascalCase`

**Componentes:**
```typescript
// ✅ BIEN - Nombres descriptivos
export function UserProfileCard() {}
export function InvoiceTable() {}

// ❌ MAL - Nombres genéricos
export function Card() {}
export function Table() {}
```

### 3. Arquitectura de Componentes

**Componentes Server vs Client:**

```typescript
// ✅ Componente Server (por defecto)
// app/dashboard/page.tsx
import { prisma } from '@/lib/prisma/client';

export default async function DashboardPage() {
  const users = await prisma.user.findMany();
  return <UserList users={users} />;
}

// ✅ Componente Cliente (solo cuando sea necesario)
// components/features/UserList.tsx
'use client';

import { useState } from 'react';

export function UserList({ users }: { users: User[] }) {
  const [filter, setFilter] = useState('');
  // ...
}
```

**Cuándo usar 'use client':**
- Necesitas hooks de React (useState, useEffect, etc.)
- Event listeners (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Context providers

**Estructura de componentes:**

```typescript
// components/features/UserCard.tsx
import { Card } from '@/components/ui/Card';
import type { User } from '@/types/user.types';

interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  className?: string;
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  return (
    <Card className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{user.name}</h3>
        {onEdit && (
          <button onClick={() => onEdit(user.id)}>Editar</button>
        )}
      </div>
    </Card>
  );
}
```

---

## Base de Datos (Prisma + Supabase)

### 1. Configuración de Prisma

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// SIEMPRE incluir estos campos en cada modelo
model User {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Campos específicos
  email     String   @unique
  name      String?
  
  @@map("users")
}
```

**Convenciones de nombres:**
- Modelos: `PascalCase` singular (User, Invoice)
- Campos: `camelCase` en Prisma, `snake_case` en DB con `@map`
- Tablas: `snake_case` plural con `@@map`

### 2. Cliente de Prisma

```typescript
// lib/prisma/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 3. Queries y Mutaciones

**SIEMPRE usar Server Actions para mutaciones:**

```typescript
// app/actions/users.ts
'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

export async function createUser(formData: FormData) {
  // 1. Validar
  const rawData = {
    email: formData.get('email'),
    name: formData.get('name'),
  };
  
  const result = createUserSchema.safeParse(rawData);
  
  if (!result.success) {
    return { 
      success: false, 
      error: result.error.flatten().fieldErrors 
    };
  }

  try {
    // 2. Ejecutar
    const user = await prisma.user.create({
      data: result.data,
    });

    // 3. Revalidar cache
    revalidatePath('/users');

    return { success: true, data: user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { 
      success: false, 
      error: 'Error al crear el usuario' 
    };
  }
}
```

**Queries complejas:**

```typescript
// lib/prisma/queries/users.ts
import { prisma } from '@/lib/prisma/client';

export async function getUserWithRelations(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      profile: true,
    },
  });
}

// Usar en Server Component
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUserWithRelations(params.id);
  
  if (!user) {
    notFound();
  }
  
  return <UserProfile user={user} />;
}
```

### 4. Supabase Integration

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
```

---

## Estilos y Theming

### 1. Sistema de Diseño con CSS Variables

**OBLIGATORIO: Usar CSS Variables para todo el theming:**

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Colores */
    --color-primary: 222 47% 11%;
    --color-primary-foreground: 210 40% 98%;
    --color-secondary: 210 40% 96%;
    --color-secondary-foreground: 222 47% 11%;
    
    --color-background: 0 0% 100%;
    --color-foreground: 222 47% 11%;
    
    --color-muted: 210 40% 96%;
    --color-muted-foreground: 215 16% 47%;
    
    --color-accent: 210 40% 96%;
    --color-accent-foreground: 222 47% 11%;
    
    --color-destructive: 0 84% 60%;
    --color-destructive-foreground: 210 40% 98%;
    
    --color-border: 214 32% 91%;
    --color-input: 214 32% 91%;
    --color-ring: 222 47% 11%;
    
    /* Bordes */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    
    /* Sombras */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    
    /* Espaciado */
    --spacing-page: 2rem;
    --spacing-section: 3rem;
    
    /* Tipografía */
    --font-heading: var(--font-geist-sans);
    --font-body: var(--font-geist-sans);
    --font-mono: var(--font-geist-mono);
  }

  .dark {
    --color-primary: 210 40% 98%;
    --color-primary-foreground: 222 47% 11%;
    --color-secondary: 217 33% 17%;
    --color-secondary-foreground: 210 40% 98%;
    
    --color-background: 222 47% 11%;
    --color-foreground: 210 40% 98%;
    
    --color-muted: 217 33% 17%;
    --color-muted-foreground: 215 20% 65%;
    
    --color-accent: 217 33% 17%;
    --color-accent-foreground: 210 40% 98%;
    
    --color-border: 217 33% 17%;
    --color-input: 217 33% 17%;
  }
}
```

**Configurar Tailwind para usar las variables:**

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
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary))',
          foreground: 'hsl(var(--color-secondary-foreground))',
        },
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        muted: {
          DEFAULT: 'hsl(var(--color-muted))',
          foreground: 'hsl(var(--color-muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent))',
          foreground: 'hsl(var(--color-accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--color-destructive))',
          foreground: 'hsl(var(--color-destructive-foreground))',
        },
        border: 'hsl(var(--color-border))',
        input: 'hsl(var(--color-input))',
        ring: 'hsl(var(--color-ring))',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
    },
  },
  plugins: [],
};
```

### 2. Componentes UI Base

**TODOS los componentes UI deben ser temables:**

```typescript
// components/ui/Button.tsx
import { type ButtonHTMLAttributes, forwardRef } from 'react';
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
          // Base styles
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          
          // Variants
          {
            'bg-primary text-primary-foreground hover:bg-primary/90':
              variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80':
              variant === 'secondary',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90':
              variant === 'destructive',
            'hover:bg-accent hover:text-accent-foreground':
              variant === 'ghost',
          },
          
          // Sizes
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

Button.displayName = 'Button';
```

**Utilidad cn (classnames):**

```typescript
// lib/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3. Reglas de Estilo

**PROHIBIDO: Colores hardcodeados**

```typescript
// ❌ MAL
<div className="bg-blue-500 text-white">

// ✅ BIEN
<div className="bg-primary text-primary-foreground">
```

**OBLIGATORIO: Usar variables de espaciado consistentes**

```typescript
// ✅ Usar spacing de Tailwind
<div className="p-4 space-y-6">
<div className="mt-8 mb-4">

// ✅ O variables personalizadas para layouts
<div className="p-[var(--spacing-page)]">
```

**Layout responsive:**

```typescript
// ✅ Mobile-first approach
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4 
  md:gap-6
">
```

---

## Internacionalización (i18n)

### 1. Configuración next-intl

```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));

// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### 2. Estructura de Traducciones

```json
// messages/es.json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "loading": "Cargando...",
    "error": "Ocurrió un error",
    "success": "Operación exitosa"
  },
  "auth": {
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "errors": {
      "invalidCredentials": "Credenciales inválidas",
      "emailRequired": "El correo es requerido",
      "passwordRequired": "La contraseña es requerida"
    }
  },
  "users": {
    "title": "Usuarios",
    "createUser": "Crear usuario",
    "editUser": "Editar usuario",
    "deleteUser": "Eliminar usuario",
    "confirmDelete": "¿Estás seguro de eliminar este usuario?",
    "fields": {
      "name": "Nombre",
      "email": "Correo",
      "role": "Rol",
      "status": "Estado"
    }
  }
}
```

**Organización por namespaces:**
- `common`: Textos compartidos en toda la app
- `auth`: Autenticación
- `errors`: Mensajes de error
- `validation`: Mensajes de validación
- Por feature: `users`, `invoices`, `dashboard`, etc.

### 3. Uso en Componentes

```typescript
// app/[locale]/users/page.tsx
import { useTranslations } from 'next-intl';

export default function UsersPage() {
  const t = useTranslations('users');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('createUser')}</button>
    </div>
  );
}

// Con interpolación
// messages/es.json
{
  "users": {
    "greeting": "Hola {name}, tienes {count} usuarios"
  }
}

// Componente
const t = useTranslations('users');
<p>{t('greeting', { name: 'Juan', count: 5 })}</p>
```

### 4. Traducciones en Server Actions

```typescript
// app/actions/users.ts
'use server';

import { getTranslations } from 'next-intl/server';

export async function createUser(formData: FormData) {
  const t = await getTranslations('users.errors');
  
  if (!email) {
    return { 
      success: false, 
      error: t('emailRequired')
    };
  }
  
  // ...
}
```

---

## Validación con Zod

### 1. Esquemas de Validación

```typescript
// lib/validations/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.email.required')
    .email('validation.email.invalid'),
  name: z
    .string()
    .min(2, 'validation.name.minLength')
    .max(100, 'validation.name.maxLength'),
  role: z.enum(['ADMIN', 'USER', 'VIEWER']),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'validation.phone.invalid')
    .optional(),
});

export const updateUserSchema = createUserSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

### 2. Validación en el Cliente

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema } from '@/lib/validations/user.schema';

export function CreateUserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserInput) => {
    const result = await createUser(data);
    // ...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      {/* ... */}
    </form>
  );
}
```

---

## Manejo de Errores

### 1. Error Boundaries

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Algo salió mal</h2>
      <Button onClick={reset} className="mt-4">
        Intentar de nuevo
      </Button>
    </div>
  );
}
```

### 2. Not Found

```typescript
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">404 - Página no encontrada</h2>
      <Link href="/">
        <Button className="mt-4">Volver al inicio</Button>
      </Link>
    </div>
  );
}
```

### 3. Manejo de errores en Server Actions

```typescript
// lib/utils/actionResponse.ts
export type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// Uso
export async function createUser(data: CreateUserInput): Promise<ActionResponse<User>> {
  try {
    const user = await prisma.user.create({ data });
    revalidatePath('/users');
    return { success: true, data: user };
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { 
          success: false, 
          error: 'El email ya está registrado' 
        };
      }
    }
    
    return { 
      success: false, 
      error: 'Error al crear el usuario' 
    };
  }
}
```

---

## Testing (Opcional pero Recomendado)

### 1. Unit Tests con Vitest

```typescript
// lib/utils/formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('15/01/2024');
  });
});
```

### 2. Integration Tests con Prisma

```typescript
// lib/prisma/queries/users.test.ts
import { beforeEach, describe, it, expect } from 'vitest';
import { prisma } from '@/lib/prisma/client';
import { getUserById } from './users';

describe('getUserById', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should return user by id', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test' },
    });

    const result = await getUserById(user.id);
    expect(result).toEqual(user);
  });
});
```

---

## Performance

### 1. Optimización de Imágenes

```typescript
import Image from 'next/image';

// ✅ SIEMPRE usar next/image
<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={200}
  height={200}
  priority={false} // true solo para above-the-fold
/>
```

### 2. Lazy Loading de Componentes

```typescript
import dynamic from 'next/dynamic';

// ✅ Cargar componentes pesados dinámicamente
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <p>Cargando gráfico...</p>,
  ssr: false, // Si no es necesario en SSR
});
```

### 3. Streaming y Suspense

```typescript
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <AsyncData />
      </Suspense>
    </div>
  );
}

async function AsyncData() {
  const data = await fetchData();
  return <DataDisplay data={data} />;
}
```

---

## Seguridad

### 1. Variables de Entorno

```bash
# .env (NUNCA commitear)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..." # Solo server-side

# .env.example (SÍ commitear)
DATABASE_URL=""
DIRECT_URL=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

**CRÍTICO: Solo variables con `NEXT_PUBLIC_` son accesibles en el cliente**

### 2. Autenticación

```typescript
// lib/auth/session.ts
import { createClient } from '@/lib/supabase/server';

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  return session;
}

// Uso en página protegida
export default async function ProtectedPage() {
  const session = await requireAuth();
  
  return <div>Hola {session.user.email}</div>;
}
```

### 3. Row Level Security (RLS) en Supabase

```sql
-- SIEMPRE activar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

---

## Checklist de Proyecto Empresarial

### Configuración Inicial
- [ ] TypeScript estricto configurado
- [ ] ESLint y Prettier configurados
- [ ] Husky para pre-commit hooks
- [ ] Variables de entorno documentadas (.env.example)
- [ ] Prisma schema con modelos base
- [ ] Migraciones de Prisma iniciales

### Estructura
- [ ] Carpetas organizadas según estructura definida
- [ ] Componentes UI base creados (Button, Input, Card, etc.)
- [ ] Sistema de theming con CSS variables
- [ ] Dark mode implementado
- [ ] Layout responsive mobile-first

### Internacionalización
- [ ] next-intl configurado
- [ ] Archivos de traducciones (es.json, en.json)
- [ ] Namespaces organizados
- [ ] Mensajes de error traducidos
- [ ] Validaciones traducidas

### Base de Datos
- [ ] Prisma cliente configurado
- [ ] Supabase conectado
- [ ] RLS activado en todas las tablas
- [ ] Índices de BD optimizados
- [ ] Seeds de datos de prueba

### Autenticación
- [ ] Supabase Auth configurado
- [ ] Helpers de sesión creados
- [ ] Rutas protegidas implementadas
- [ ] Manejo de roles y permisos

### Performance
- [ ] Images optimizadas con next/image
- [ ] Lazy loading implementado
- [ ] Suspense y streaming configurados
- [ ] Metadata SEO configurada

### Testing
- [ ] Vitest configurado
- [ ] Tests unitarios para utils
- [ ] Tests de integración para queries
- [ ] E2E tests (Playwright)

### DevOps
- [ ] Scripts de deploy documentados
- [ ] CI/CD pipeline configurado
- [ ] Monitoreo de errores (Sentry)
- [ ] Analytics configurado

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Prisma
npx prisma generate          # Generar cliente
npx prisma db push          # Push schema (dev)
npx prisma migrate dev      # Crear migración
npx prisma migrate deploy   # Aplicar migraciones (prod)
npx prisma studio           # GUI de BD

# Build
npm run build
npm run start

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:watch
npm run test:coverage
```

---

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Zod](https://zod.dev/)

---

## Notas Finales

Este documento debe ser la **fuente de verdad** para el proyecto. Cualquier desviación de estas reglas debe ser:
1. Discutida con el equipo
2. Documentada con una razón clara
3. Actualizada en este documento si se acepta el cambio

**Principio general**: Código limpio, mantenible, escalable y accesible.