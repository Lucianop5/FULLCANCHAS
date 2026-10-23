# Fullcanchas — sistema de diseño

## Dirección visual

**Club premium dual.** Fullcanchas se presenta como un club deportivo real, no como un SaaS genérico: superficies cálidas color hueso, verde profundo de cancha, acento lima de alta visibilidad y tipografía condensada de estilo editorial. La interfaz alterna entre una lectura luminosa y terrosa (tema claro) y una lectura nocturna, técnica y de alto contraste (tema oscuro).

La identidad se apoya en tres ideas:

1. **Cancha y club.** El verde profundo y las texturas de líneas de cancha conectan la marca con el deporte sin recurrir a ilustraciones genéricas.
2. **Editorial deportivo.** Oswald en mayúsculas y titulares grandes aportan energía de estadio; Inter mantiene la legibilidad en formularios y tablas.
3. **Acción clara.** El lima se reserva para precios, selección, foco y llamadas a la acción. Nunca compite con el verde primario.

## Tipografía

| Rol | Fuente | Uso |
| --- | --- | --- |
| Display / headings | Oswald | Titulares, nombres de cancha, navegación de marca y cifras destacadas. |
| Texto e interfaz | Inter | Párrafos, formularios, tablas, navegación secundaria. |
| Datos técnicos | Geist Mono | Referencias de pago, IDs y datos que deben leerse con precisión. |

Los titulares usan `tracking-tight`, mayúsculas y pesos medios. El texto de cuerpo mantiene un interlineado amplio (`leading-6`) para no perder legibilidad sobre fondos cálidos.

## Color

Los tokens viven en `src/app/globals.css` en formato OKLCH. Son la fuente de verdad; las aproximaciones hex son solo orientativas.

### Tema claro

| Token | Rol | Aproximación |
| --- | --- | --- |
| `--background` | Hueso cálido de fondo | `#f5f1e4` |
| `--foreground` | Verde tinta | `#1d3024` |
| `--card` | Superficie elevada | `#fcf9f0` |
| `--primary` | Verde club | `#123d2a` |
| `--primary-foreground` | Texto sobre verde | `#f7f4e9` |
| `--accent` | Lima de acción | `#c9f24a` |
| `--accent-foreground` | Tinta sobre lima | `#1b2b20` |
| `--secondary` / `--muted` | Superficies de apoyo | `#e9e6d8` |
| `--border` | Línea cálida | `#d8d4c4` |
| `--success` | Confirmación | `#2f8a5c` |
| `--warning` | Pendiente / bloqueo | `#c79535` |
| `--destructive` | Cancelación | `#c2453c` |

### Tema oscuro

| Token | Rol | Aproximación |
| --- | --- | --- |
| `--background` | Bosque nocturno | `#0f1a14` |
| `--foreground` | Hueso | `#f1ecdd` |
| `--card` | Superficie elevada | `#16231c` |
| `--primary` | Lima eléctrico | `#d3ff4c` |
| `--primary-foreground` | Tinta oscura | `#122016` |
| `--accent` | Lima de acción | `#d3ff4c` |
| `--muted-foreground` | Texto secundario | `#a8b7aa` |
| `--border` | Blanco translúcido | `rgba(255,255,255,0.12)` |
| `--success` | Confirmación | `#5fd28b` |
| `--warning` | Pendiente / bloqueo | `#e8b95c` |

En oscuro, el verde primario se transforma en lima para conservar el gesto de marca. Las bandas CTA que usan `bg-primary` reciben una excepción deliberada (`dark:bg-[#12241d]`) para que los botones lima sigan siendo legibles.

## Espaciado, radios y elevación

- Contenedor principal: `max-w-6xl` con padding `16px` móvil, `24px` tablet y `32px` desktop.
- Ritmo vertical: `space-y-6` / `space-y-7` entre secciones; `gap-4` en grillas de métricas.
- Radios: `rounded-xl` en controles, `rounded-2xl` en tarjetas, `rounded-full` en CTAs y filtros.
- Sombras: suaves y localizadas. La jerarquía se construye con bordes y superficies, no con sombras pesadas.
- Texturas: `.pitch-grid` para la cancha del hero y `.fine-grid` para fondos editoriales. Son decorativas y nunca contienen información.

## Componentes

### Header público

- Sticky, fondo translúcido con blur y borde inferior.
- Logo circular “FC” en verde, wordmark en Oswald y punto lima.
- Navegación desktop centrada; en móvil se colapsa en un `Sheet`.
- Tema claro/oscuro siempre accesible; sesión y rol admin visibles en el menú de usuario.

### Hero

- Composición asimétrica: mensaje editorial a la izquierda, tarjeta de cancha a la derecha.
- La tarjeta de cancha usa `.pitch-grid`, una reserva de ejemplo y una etiqueta de “Reserva segura”.
- CTA principal lima/verde y CTA secundario outline; en móvil se apilan.

### Tarjetas y métricas

- Tarjetas de cancha con icono deportivo, nombre en Oswald, descripción y precio.
- Métricas administrativas con icono en bloque de color, cifra display y etiqueta corta.
- Estados con badges de borde y fondo translúcido; el color nunca es el único indicador (siempre hay texto).

### Formularios

- `Label` visible, inputs de altura consistente, foco con anillo `ring`.
- Errores en rojo debajo del campo y `aria-invalid`.
- Botones de envío con estado de carga y texto que describe la acción.
- Checkout demo: tarjeta de prueba precargada, aviso explícito de que no hay cobro real.

### Reserva

- Flujo de tres pasos: cancha → horario → resumen.
- Slots de una hora entre 09:00 y 22:00, con estados disponible, seleccionado y no disponible (tachado).
- Los botones de selección exponen `aria-pressed`.
- Resumen con precio snapshot, fecha larga en español, duración y política de cancelación de 2 horas.

### Administración

- Shell fijo con navegación lateral en desktop y menú móvil.
- Dashboard con ingresos del mes, reservas de hoy, pendientes y canchas activas.
- Tabla de reservas con filtros por texto, estado, cancha y rango de fechas; exportación CSV.
- Canchas: crear, editar, activar/mantener y eliminar solo si no tienen reservas.
- Precios por tipo editables en línea.
- Bloqueos administrativos con motivo y liberación posterior.

## Movimiento

- Transiciones de `150–300 ms` en color, borde, sombra y transformación.
- Microinteracción de presión en botones (`active:translate-y-px`).
- Aparición de toasts y diálogos mediante Radix + `tw-animate-css`.
- Sin animaciones de entrada largas ni movimiento continuo. Se respeta `prefers-reduced-motion` reduciendo animaciones y transiciones.

## Accesibilidad

- Contraste alto entre texto y superficies; el lima se usa con tinta oscura.
- Foco visible en todos los controles.
- Navegación por teclado en menús, diálogos, selects y formularios (Radix UI).
- Etiquetas `aria-label` en acciones icónicas y `aria-pressed` en selecciones.
- Los estados se comunican con texto además de color.
- Tablas con scroll horizontal en pantallas pequeñas; no se oculta información crítica.
- El tema se puede cambiar manualmente y respeta la preferencia del sistema.

## Responsive

- **Móvil (< 640px):** header compacto, hero apilado, tarjetas a una columna, CTAs de ancho completo, tablas con scroll.
- **Tablet (640–1024px):** grillas de dos columnas, navegación desktop desde `md`, sidebar administrativo desde `lg`.
- **Desktop (> 1024px):** hero asimétrico, grillas de tres columnas, sidebar fijo de administración.

## Archivos clave

- `src/app/globals.css`: tokens, tipografía y texturas.
- `src/app/page.tsx`: landing pública.
- `src/components/booking/booking-wizard.tsx`: flujo de reserva.
- `src/components/admin/*`: operación administrativa.
- `src/app/(admin)/layout.tsx`: shell de administración.
- `screenshots/`: evidencia visual de los temas claro y oscuro.
