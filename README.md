# Mysłowicki Alarm Smogowy — strona

Strona internetowa Mysłowickiego Alarmu Smogowego (MAS) — oddolnego ruchu
mieszkańców Mysłowic na rzecz czystego powietrza.

Zbudowana w [Astro](https://astro.build) jako strona statyczna. Hosting: Vercel.

## Uruchomienie lokalne

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # build produkcyjny do dist/
npm run preview  # podgląd builda
```

## Struktura

- `src/pages/` — strony (Start, O nas, Historia, Dla mieszkańca, Aktualności, Kontakt)
- `src/content/aktualnosci/` — wpisy aktualności (Markdown)
- `src/data/timeline.ts` — oś czasu działań 2017–2026
- `src/components/` — Header, Footer, AirQuality (widget GIOŚ)
- `src/styles/global.css` — system wizualny (paleta miasta Mysłowice)
- `public/` — logo, favicon, OG image

## Dodanie aktualności

Utwórz plik `src/content/aktualnosci/RRRR-MM-DD-tytul.md`:

```markdown
---
tytul: "Tytuł wpisu"
data: 2026-05-01
opis: "Krótki opis na liście."
---

Treść wpisu w Markdown.
```

Docelowo dojdzie panel CMS (edycja z przeglądarki) — w przygotowaniu.

## Do dokończenia
- Widget powietrza: w razie blokady CORS dodać serverless proxy do GIOŚ.
- Backend formularza kontaktowego (Formspree/Web3Forms) — obecnie `mailto`.
- Panel CMS do aktualności.
- Lokalne dane Airly (czujniki w Mysłowicach).

---

Inicjatywa obywatelska, niezwiązana z Urzędem Miasta Mysłowice.
