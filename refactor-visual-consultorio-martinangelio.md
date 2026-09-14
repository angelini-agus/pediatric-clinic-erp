# Refactor visual — Consultorio Martinangelio

Este archivo es independiente del anterior (`prompts-secciones-iPediERP.md`). Los
prompts 0.1 / 0.2 / 0.3 de paleta oscura/pastel de ese archivo quedan
**descartados** — esta es la nueva dirección visual. La estructura de secciones,
la información y buena parte del copy de fondo siguen siendo válidos (son los
mismos hechos: Jefa de Servicio, Hospital Eva Perón, las 5 etapas, etc.), lo
que cambia acá es el tratamiento visual completo.

**Nombre de marca**: el logo/header pasa a decir **"Consultorio Martinangelio"**.
En otras partes de la página (subtítulos, footer, copy suelto) se puede usar
"Dra. Martinangelio" o "Consultorio pediátrico particular" indistintamente,
según quede mejor en el contexto. El botón "Portal del Paciente" sigue
llevando al mismo ERP, sin cambios ahí.

**Imágenes**: en TODOS los prompts, cuando se pide una foto, dejar el espacio
reservado (placeholder gris o con el color de acento correspondiente, del
tamaño/proporción correcto) — las fotos las agrega Agus después. No usar fotos
de stock ni generadas por IA para rellenar.

Pegale esto a Claude Code una sola vez al principio, antes del Prompt 1:

```
Vamos a hacer un refactor visual completo de la landing de Consultorio
Martinangelio (antes iPediERP). Es un refactor, no una reconstrucción: las
secciones, el copy de fondo y la lógica ya existen en el proyecto — lo que
cambia es la capa visual (colores, tipografía, formas, tratamiento de
imágenes). Te voy a pasar primero un prompt de "fundamentos" con el sistema
de diseño completo (paleta, tipografía, jerarquía de headings, reglas de
forma) que se aplica a todo el sitio, y después un prompt por sección. Cada
imagen que se mencione se deja como placeholder — las fotos reales las agrego
yo después, no uses stock ni imágenes generadas.
```

---

## SISTEMA DE DISEÑO (referencia — se explica completo en el Prompt 1)

**Paleta**

| Rol                         | Hex       | Uso                                                          |
| --------------------------- | --------- | ------------------------------------------------------------ |
| Fondo base                  | `#F4EEDF` | fondo general del sitio (reemplaza al celeste/mint anterior) |
| Texto principal             | `#241D15` | headings y texto de cuerpo sobre fondo claro                 |
| Texto secundario            | `#6B5F52` | bajadas, descripciones, texto de apoyo                       |
| Coral (acento primario)     | `#E96B3A` | nav, CTA principal, elementos de mayor jerarquía             |
| Mostaza (acento secundario) | `#F4C43F` | CTA secundario, banners, blobs decorativos                   |
| Salvia                      | `#AEC17A` | cards (rota junto con rosa/lavanda/teal)                     |
| Rosa                        | `#F3A9C0` | cards                                                        |
| Lavanda                     | `#C9B8EA` | cards                                                        |
| Teal                        | `#86C6CB` | cards                                                        |
| Blanco                      | `#FFFFFF` | texto sobre fondos de color, cards internas                  |

**Tipografía**

- Headings: fuente redondeada bold — **Baloo 2** o **Fredoka** (Google Fonts,
  elegir la que mejor se importe en el proyecto), peso 700-800
- Cuerpo: **Nunito Sans** o **Poppins**, peso 400-500, color texto secundario
- Botones/badges: mismo peso bold que headings, dentro de formas pill

**Jerarquía de headings**

| Nivel       | Tamaño desktop | Tamaño mobile | Peso    | Uso                    |
| ----------- | -------------- | ------------- | ------- | ---------------------- |
| H1          | 56-64px        | 36-40px       | 800     | solo hero              |
| H2          | 36-40px        | 28px          | 800     | título de cada sección |
| H3          | 20-24px        | 18px          | 700     | títulos de card        |
| Body        | 15-16px        | 14-15px       | 400-500 | párrafos               |
| Label/badge | 12-13px        | 12px          | 600     | pills, tags de etapa   |

**Formas**

- Botones: pill (border-radius total)
- Cards: border-radius grande, 24-32px
- Fotos: tratamiento duotono (foto tintada al color de acento de su card/sección)
  en vez de foto a color completo — esto da consistencia de paleta aunque las
  fotos reales varíen
- Nav: barra flotante tipo pill con fondo degradado coral
- Banners anchos (reconocimiento institucional, CTA de turnos): forma pill
  completa (stadium shape), no rectángulo

---

## PROMPT 1 — Fundamentos del sistema de diseño (correr primero, antes que cualquier otro)

```
Este es un refactor visual, no una reconstrucción — no toques la estructura de
componentes, rutas, ni la lógica existente. Vamos a redefinir los tokens de
diseño global (colores, tipografía, radios de borde) que después se van a
usar en cada sección.

1. PALETA — definir como variables CSS / tokens de Tailwind (lo que use el
   proyecto), reemplazando la paleta anterior (celeste/mint/navy):
   - --color-bg: #F4EEDF (fondo base del sitio)
   - --color-text: #241D15 (texto principal)
   - --color-text-secondary: #6B5F52 (bajadas, texto de apoyo)
   - --color-coral: #E96B3A (acento primario — nav, CTA principal)
   - --color-mustard: #F4C43F (acento secundario — CTA secundario, banners)
   - --color-sage: #AEC17A (card)
   - --color-pink: #F3A9C0 (card)
   - --color-lavender: #C9B8EA (card)
   - --color-teal: #86C6CB (card)
   - --color-white: #FFFFFF

2. TIPOGRAFÍA — importar de Google Fonts:
   - Heading: Baloo 2 (pesos 700 y 800)
   - Body: Nunito Sans (pesos 400 y 500)
   Definir como variables --font-heading y --font-body, aplicar heading a
   todos los h1-h3 del sitio y body al resto del texto.

3. JERARQUÍA DE HEADINGS — definir clases/tokens reutilizables:
   - h1: 56-64px desktop / 36-40px mobile, peso 800, font-heading, line-height
     ~1.05-1.1
   - h2: 36-40px desktop / 28px mobile, peso 800, font-heading
   - h3: 20-24px desktop / 18px mobile, peso 700, font-heading
   - body: 15-16px, peso 400-500, font-body, color var(--color-text-secondary)
   - label/badge: 12-13px, peso 600, font-heading, uppercase opcional

4. RADIOS DE BORDE — definir tokens:
   - --radius-pill: 999px (botones, badges, nav, banners anchos)
   - --radius-card: 28px (cards en general)

5. Reemplazar el fondo base de TODAS las secciones claras (las que hoy usan
   celeste/mint) por --color-bg. No toques todavía el contenido ni el layout
   de ninguna sección — este prompt es solo la base de tokens, el resto de los
   prompts van a usar estas variables sección por sección.

No avances con las secciones individuales todavía, esperá el siguiente prompt.
```

---

## PROMPT 2 — Header / Nav

```
Refactor visual del header, usando los tokens ya definidos.

- El nav pasa a ser una barra FLOTANTE tipo pill (no una barra full-width
  pegada al borde superior): con margen arriba y a los costados, border-radius
  total (--radius-pill), fondo con degradado sutil en --color-coral (de un
  tono de coral a uno levemente más oscuro/saturado, no un degradado
  multicolor).
- Logo: "Consultorio Martinangelio" en blanco, font-heading bold, con el
  ícono/isotipo que ya exista (mantenerlo, solo ajustar color a blanco si
  hace falta contraste sobre el coral).
- Links de navegación (Dra. Martinangelio / Acompañamiento / Turnos /
  Contacto): texto blanco, peso medium, sin subrayado, hover con opacidad
  reducida o un pequeño underline animado.
- CTA "Portal del Paciente": botón pill blanco sólido con texto en
  --color-coral (invertido respecto al resto del nav, para que destaque como
  la acción principal).
- Mobile: el nav colapsa a un menú hamburguesa manteniendo la forma pill del
  contenedor.

No cambies los items del menú ni el link del botón — es un cambio de piel
visual únicamente.
```

---

## PROMPT 3 — Hero

```
Refactor visual completo del Hero. El copy se mantiene (ajustar solo si hace
falta por espacio, sin cambiar el sentido):

H1: "La misma pediatra, en cada etapa de tu hijo"
Bajada: "Seguimiento pediátrico continuo desde la etapa de preconcepción hasta
la adolescencia, siempre con la Dra. Martinangelio. Sacá turno o ingresá al
portal para ver la historia clínica de tu hijo."
CTA primario: "Sacar Turno" (pill sólido en --color-coral, texto blanco)
CTA secundario: "Conocer a la Dra." (pill con borde en --color-coral, texto
--color-coral, fondo transparente o blanco)
Debajo: mismo bloque de datos ("[X]+ Años de Ejercicio Profesional" / "Jefa
de Servicio — Hospital Eva Perón"), rediseñado como 2 badges pill pequeños en
--color-mustard con texto --color-text, en vez de texto plano.

TRATAMIENTO DE IMAGEN — esto es lo más importante del prompt:
En vez de una sola foto rectangular de la Dra., armar un collage de 2 a 3
fotos con máscaras de forma orgánica ("blob", no círculo ni rectángulo —
formas asimétricas tipo mancha redondeada). Cada blob tintado o con fondo de
uno de los acentos (coral, mostaza, salvia), superpuestos entre sí con
pequeños desfasajes de profundidad (unos por delante de otros, ligera
rotación entre -6° y 6° en algunos). Dejar las 2-3 fotos como placeholders
con el color de fondo del blob correspondiente y el texto "Foto: [descripción
de qué va acá]" centrado, tamaño y proporción ya definidos para que Agus
después solo reemplace la imagen.

Fondo general de la sección: --color-bg (crema).

No cambies el copy salvo ajuste de espacio, no cambies el link de los CTAs.
```

---

## PROMPT 4 — Sección "Sobre la Dra. Martinangelio" (trío de credenciales)

```
Refactor visual de la sección "Sobre la Dra. Martinangelio". Reemplazar el
layout anterior (split foto + lista de credenciales) por 3 cards en fila
(columna en mobile), mismo patrón que un trío de tarjetas de confianza:
2 cards con foto (placeholder) tintada en duotono al color de la card, 1 card
del medio en color sólido con ícono en vez de foto.

Título de sección (H2): "Una sola pediatra que ya conoce a tu hijo"
Bajada corta debajo del H2: "Cada consulta la da la Dra. Martinangelio — no un
equipo rotativo."

CARD 1 (foto placeholder, duotono en --color-sage, fondo de card en un verde
sage claro):
H3: "Jefa de Servicio"
Texto: "Jefa del Servicio de Pediatría del Hospital Eva Perón, Granadero
Baigorria."

CARD 2 (SIN foto — color sólido --color-coral de fondo, ícono simple blanco
tipo estetoscopio o cruz médica, texto blanco):
H3: "Pública y Privada"
Texto: "Ejerce en hospitales públicos y privados de la zona, además de su
consultorio particular en Pueblo Esther."

CARD 3 (foto placeholder, duotono en --color-pink, fondo de card en rosa claro):
H3: "[X]+ Años de Trayectoria"
Texto: "Más de [X] años dedicados exclusivamente a la pediatría." (dejar el
[X] como placeholder, Agus completa el número)

Cards con --radius-card, misma altura entre las 3, padding generoso. Fondo de
la sección: --color-bg.

No agregues una cuarta card ni cambies los datos por otros no confirmados.
```

---

## PROMPT 5 — Banda de reconocimiento institucional

```
Nueva sección corta (banner ancho tipo pill), entre "Sobre la Dra." y
"Acompañamiento en cada etapa". Reemplaza al "trust bar de logos de partners"
del diseño de referencia, pero acá en vez de logos de empresas van nombres de
instituciones/hospitales.

Fondo: --color-mustard, ocupando el ancho del contenedor pero con
--radius-pill (forma de cápsula completa, no rectángulo).

Título centrado (H3, texto --color-text): "Presente en instituciones de
referencia"

Debajo, en fila (wrap en mobile), badges de texto simple (sin logo, solo
tipografía bold, separados por un punto o un pequeño ícono de hospital):
"Hospital Eva Perón" · "[Institución 2]" · "[Institución 3]" — dejar 2
placeholders [Institución 2] y [Institución 3] entre corchetes, Agus va a
confeccionar la lista completa de dónde más atiende.

Sección corta, poco padding vertical — es una banda de refuerzo, no un bloque
de contenido largo.
```

---

## PROMPT 6 — Sección "Acompañamiento en cada etapa" (carrusel de cards)

```
Este prompt REEMPLAZA cualquier diseño anterior de esta sección basado en
timeline con nodos conectados por línea — ese enfoque queda descartado. El
nuevo tratamiento es un carrusel/grilla de 5 cards, mismo patrón que una
grilla de "programas por edad": cada etapa es una card con foto arriba
(placeholder, duotono), un badge pill con el nombre corto de la etapa
superpuesto sobre la foto, título, descripción corta y un link "Conocer más →".

Título de sección (H2): "Te acompaña antes de que nazca, y en cada paso después"
Bajada: "El seguimiento pediátrico no empieza en el primer control. La Dra.
Martinangelio acompaña a la familia desde la etapa de preconcepción, y sigue
presente en cada etapa del crecimiento."

Las 5 cards, cada una con su color de acento rotando entre sage / pink /
lavender / teal / mustard (una por card, sin repetir colores consecutivos):

1. Badge: "Preconcepción" — H3: "Antes de que llegue" — Texto: "Acompañamiento
   y asesoramiento a la familia antes de la llegada del bebé."
2. Badge: "Recién Nacido" — H3: "Los primeros días" — Texto: "Seguimiento
   desde los primeros días de vida."
3. Badge: "Crecimiento" — H3: "Cada etapa del desarrollo" — Texto: "Controles
   periódicos de peso, talla, hitos del desarrollo y vacunación."
4. Badge: "Enfermedad" — H3: "Cuando más se necesita" — Texto: "Atención y
   acompañamiento durante los procesos de enfermedad, con la misma pediatra
   que ya conoce al paciente."
5. Badge: "Adolescencia" — H3: "Hasta último momento" — Texto: "Presencia
   constante durante los desafíos de cada etapa, no solo en el consultorio."

Layout: carrusel horizontal con scroll/flechas en desktop (4-5 cards visibles
según ancho), en mobile scroll horizontal con snap. Cards con --radius-card,
foto placeholder con proporción 4:3 en la parte superior de cada card, badge
pill superpuesto en la esquina superior izquierda de la foto (mismo patrón
visual que un tag de "edad" sobre la imagen).

El link "Conocer más" de cada card puede llevar por ahora a la sección de
Contacto/WhatsApp (placeholder de link, ajustar destino después si hace
falta).

Fondo de sección: --color-bg.
```

---

## PROMPT 7 — Sección "¿Es para tu familia?"

```
Refactor visual de la sección de preguntas/objeciones. Mismo contenido de
antes, nuevo tratamiento: cards en grilla de 2 columnas (1 en mobile), cada
card con su propio color de acento de fondo (rotando entre los 4 colores de
card), --radius-card, sin foto — solo texto e ícono simple.

Título de sección (H2): "¿Es para tu familia?"

5 cards (contenido igual al ya definido, redistribuir colores sin repetir
consecutivos):

"¿Va a ser siempre la misma pediatra?" → "Sí. No hay guardia rotativa ni
consultorio de equipo: todas las consultas las da la Dra. Martinangelio."

"¿Tiene experiencia real, no solo consultorio particular?" → "Es Jefa del
Servicio de Pediatría del Hospital Eva Perón y atiende también en otros
hospitales públicos y privados de la zona."

"¿Y si mi hijo se enferma fuera de un control de rutina?" → "El
acompañamiento incluye los procesos de enfermedad, no solo los controles
programados."

"¿Recién nace y ya tengo que buscar pediatra?" → "El acompañamiento puede
empezar incluso antes: desde la etapa de preconcepción y durante el
embarazo."

"¿Cómo saco un turno?" → "Directo por WhatsApp o desde el portal de turnos,
sin trámites."

Dentro de cada card: la pregunta en tamaño chico/peso medium, la respuesta en
H3 o peso bold debajo, para que se lea rápido en escaneo. Ícono pequeño
opcional arriba de la pregunta (un check, un signo de pregunta redondeado,
etc., en el color de texto o en blanco si la card es de color saturado).

Fondo de sección general: --color-bg (las cards son las que llevan color).
```

---

## PROMPT 8 — Prueba social

```
Refactor visual de la sección de prueba social/testimonios.

Título de sección (H2): "Familias que ya confían"

Bloque de cifras arriba (2-3 números grandes en font-heading bold,
--color-coral o --color-text): mantener los mismos placeholders que ya
definimos ([X]+ años ejerciendo, etc.) — no inventar números nuevos.

Testimonios: 2-3 cards en fila (columna en mobile), --radius-card, fondo
blanco o un tono muy claro de alguno de los acentos, con foto placeholder
circular chica (o iniciales en un círculo de color si no hay foto) + nombre
del padre/madre + cita corta (2-3 líneas, placeholder de texto real que Agus
va a completar: "[Cita textual del testimonio]").

Comillas decorativas grandes y sutiles en el color de acento de cada card,
como elemento gráfico, no como texto funcional.

Fondo de sección: --color-bg.
```

---

## PROMPT 9 — Turnos (banner CTA) + Contacto/Footer

```
Refactor visual de las dos últimas secciones.

SECCIÓN TURNOS:
Banner ancho, forma pill (--radius-pill) igual que la banda institucional del
Prompt 5, pero en --color-coral con texto blanco, para que corte fuerte antes
del footer.

H2: "Sacá un turno en menos de 2 minutos"
Texto: "Accedé al portal para ver la agenda disponible, sacar turno y
consultar la historia clínica de tu hijo."
CTA: "Ver turnos disponibles" — botón pill blanco sólido, texto --color-coral
(mismo link al ERP externo que ya está definido, no cambiar el destino)
CTA secundario chico debajo: "¿Primera vez? Escribinos por WhatsApp antes de
sacar turno" — link a WhatsApp

SECCIÓN CONTACTO:
Fondo --color-bg.
H2: "¿Tenés una consulta antes de sacar turno?"
Texto: "Escribinos directo por WhatsApp, la Dra. Martinangelio o su
consultorio te responde a la brevedad."
CTA: "Escribir por WhatsApp" — botón pill --color-coral con ícono de WhatsApp
en blanco, link https://wa.me/[NUMERO] (placeholder)
Debajo, en texto simple: dirección [placeholder], horarios [placeholder].

BOTÓN FLOTANTE DE WHATSAPP: agregar un botón circular flotante fijo en la
esquina inferior derecha de toda la página (visible en todas las secciones,
no solo en Contacto), fondo --color-coral, ícono de WhatsApp blanco, con
leve sombra. Mismo link de WhatsApp que el CTA de la sección Contacto.

FOOTER:
Fondo --color-text (el marrón oscuro, no el coral, para diferenciarlo del
banner de Turnos que ya usó coral) — texto en tonos claros/blanco.
- "Consultorio Martinangelio" + línea corta: "Dra. Martinangelio — Pediatría
  en Pueblo Esther"
- Links de nav repetidos
- Botón "Portal del Paciente" repetido, estilo pill blanco
- Línea de copyright simple

No cambies los links de destino de ningún CTA, esto es solo refactor visual.
```
