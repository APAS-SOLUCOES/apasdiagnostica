---
description: "Brand assets shipped by the APAS DISC Profile design system (logos, icons, illustrations, photography, fonts, videos) with exact import paths. Read before adding any logo, icon, illustration, image, video, or font to the app: use these real assets instead of placeholders, stock photos, or generated images."
---

# APAS DISC Profile — Assets

These files are copied into `src/design-system/{slug}/assets/` in this project — never generate, placeholder, or substitute an asset that exists here.

Raw files import directly, e.g. `import logo from "@/design-system/{slug}/assets/logos/logo.svg"`.
The full machine-readable catalog lives in this library's `design-system.json` (`assets` array).

## Official brand

- `@/assets/apas-logo-official.webp` — logo oficial APAS Soluções para fundos escuros.
- `@/assets/apas-logo-light.webp` — variante legível para fundos claros, derivada da mesma marca oficial.
Use estes assets para cabeçalhos, rodapés e capas do relatório; não recrie o símbolo em texto ou SVG aproximado.

## Images

- `@/design-system/{slug}/assets/disc-editorial-cover.jpg` (jpg)
- `@/design-system/{slug}/assets/disc-editorial-dialogue.jpg` (jpg)
- `@/design-system/{slug}/assets/disc-editorial-growth.jpg` (jpg)
- `@/design-system/{slug}/assets/disc-editorial-self.jpg` (jpg)

