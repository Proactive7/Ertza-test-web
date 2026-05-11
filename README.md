# ErtzaTest

Plataforma web de tests y simulacros para oposiciones de la Ertzaintza.

ErtzaTest permite realizar cuestionarios por temas, simulacros completos, seguimiento de estadísticas, ranking de opositores, sistema de insignias y gestión Premium mediante Stripe.

---

# Tecnologías utilizadas

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Supabase
- Stripe
- Vercel

---

# Funcionalidades principales

## Sistema de autenticación

- Registro e inicio de sesión
- Gestión de sesiones
- Recuperación de contraseña
- Perfil editable

## Tests y simulacros

- Tests por temas
- Simulacros oficiales
- Corrección automática
- Preguntas aleatorias
- Temporizador en tiempo real

## Estadísticas

- Nota media
- Mejor nota
- Tests aprobados
- Tema más practicado
- Actividad reciente
- Ranking global
- Sistema de insignias

## Premium

- Suscripción mensual con Stripe
- Prueba gratuita de 7 días
- Portal de cliente Stripe
- Control automático de estado Premium

---

# Variables de entorno

Crear un archivo `.env.local` usando como referencia `.env.example`.

Ejemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=

NEXT_PUBLIC_SITE_URL=
```