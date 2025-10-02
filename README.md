# Bitácora Core

Sistema de gestión construido con Next.js 15, Prisma, Supabase y TypeScript.

## Stack Tecnológico

- **Framework**: Next.js 15 (App Router + Turbopack)
- **Base de Datos**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Autenticación**: Supabase Auth
- **Lenguaje**: TypeScript (estricto)
- **Estilos**: Tailwind CSS v4 + CSS Variables
- **i18n**: react-i18next (es/en)
- **Validación**: Zod
- **Forms**: React Hook Form

## Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener configurado el archivo `.env`:

```bash
# App
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Database
DATABASE_URL="tu-connection-string"
DIRECT_URL="tu-direct-connection-string"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="tu-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
```

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Sincronizar schema con la DB
npx prisma db push

# O crear una migración
npx prisma migrate dev --name init
```

### 4. Habilitar Authentication en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Authentication** > **Providers**
3. Habilita **Email** provider
4. Configura las URLs de redirección en **URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## Desarrollo

```bash
# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Abrir Prisma Studio
npx prisma studio
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
/src
  /app
    /(auth)
      /login              # Página de login
    /(dashboard)
      /dashboard          # Dashboard protegido
    /actions              # Server Actions
    /page.tsx             # Home (redirige a /login o /dashboard)
  /components
    /ui                   # Componentes base (Button, Input, Card, Label)
    /features
      /auth               # Componentes de autenticación
      /dashboard          # Componentes del dashboard
    /providers            # Providers (I18n)
  /lib
    /auth                 # Utilidades de autenticación
    /i18n                 # Helpers de i18n
    /prisma               # Cliente Prisma
    /supabase             # Clientes Supabase
    /utils                # Utilidades generales
    /validations          # Esquemas Zod
  /i18n
    /locales
      /es                 # Traducciones español
      /en                 # Traducciones inglés
    /config.ts            # Configuración i18n
    /client.ts            # Cliente i18n
    /server.ts            # Servidor i18n
  /middleware.ts          # Middleware de autenticación y locale
```

## Características Implementadas

### ✅ Autenticación
- Login con email/password
- Logout
- Protección de rutas con middleware
- Server Actions para mutaciones
- Redirección automática según estado de autenticación

### ✅ Internacionalización
- Soporte multiidioma (español/inglés)
- Detección automática de idioma del navegador
- Traducciones en cliente y servidor
- Cambio de idioma persistente en cookies

### ✅ UI/Theming
- Sistema de diseño con CSS Variables
- Componentes UI reutilizables
- Soporte para modo oscuro (configurado en variables)
- Responsive design

### ✅ Validación
- Esquemas Zod para validación de datos
- Integración con React Hook Form
- Mensajes de error traducidos

## Próximos Pasos

1. **Configurar Prisma Schema**
   - Define tus modelos en `prisma/schema.prisma`
   - Ejecuta `npx prisma migrate dev`

2. **Agregar Funcionalidades**
   - Crear nuevas páginas en `/app/(dashboard)`
   - Agregar Server Actions en `/app/actions`
   - Crear componentes en `/components/features`

3. **Personalizar Theming**
   - Modifica las variables CSS en `/src/app/globals.css`
   - Ajusta los colores en `tailwind.config.ts`

4. **Agregar Traducciones**
   - Crea nuevos archivos en `/src/i18n/locales/{lang}/`
   - Usa el hook `useTranslation()` en cliente
   - Usa `initServerI18n()` en servidor

## Reglas de Desarrollo

Ver [CLAUDE.md](./CLAUDE.md) para las reglas completas de desarrollo.

### Principios Clave

- ✅ TypeScript estricto (nunca usar `any`)
- ✅ Server Components por defecto
- ✅ Server Actions para mutaciones
- ✅ CSS Variables (nunca colores hardcodeados)
- ✅ Todas las strings deben estar traducidas
- ✅ Validación con Zod en todos los formularios

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [react-i18next](https://react.i18next.com)
