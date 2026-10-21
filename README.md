# NOMA · Agência de Turismo — site

Next.js 16 + Tailwind 4. Passeios, preços, fotos e a reserva vêm do **DunasTour**
(mesmo contrato do link `dunastour.com.br/<slug>`), igual ao site da Mister K — só a identidade visual muda.

## Rodar

```bash
cp .env.example .env.local   # ajuste o slug quando a NOMA estiver no DunasTour
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # produção
```

## Sem passeios cadastrados ainda

O site já funciona sem nada no DunasTour: o hero usa o bloco verde-petróleo com o sol-mandala, os passeios mostram
"Nossos passeios estão chegando" (destinos + WhatsApp) e a seção do Instagram vira um mini-feed com os posts da marca.
Assim que a NOMA cadastrar passeios/fotos e `DUNASTOUR_AGENCY_SLUG` apontar pra ela, cards, galeria, fotos do hero,
avaliações e o checkout aparecem sozinhos (cache de 5 min).

## Como conecta ao DunasTour

- **Só o servidor do Next fala com a API** (`DUNASTOUR_API_URL`) → libere no backend o IP do servidor onde o site roda.
- Leituras (agência, passeios, pacotes, galeria, avaliações, lagoas): `src/lib/dunastour/server.ts`, cache de 5 min.
- Ações do navegador passam pelo proxy `src/app/api/dunas/[...path]/route.ts`, que só aceita rotas públicas do checkout e
  sempre usa o id desta agência.
- Reserva pelo site (`site.onlineBooking`, desligada por padrão): roteiro → dados → termo de risco → confirmar →
  `POST /api/agencies/{id}/checkout-submissions` → voucher pendente no painel da agência → WhatsApp.

## Marca

- Paleta e fontes: `src/app/globals.css` (petróleo, turquesa, creme, sol, terracota, oliva, mata) — Marcellus (letreiro),
  Josefin Sans (textos) e Cormorant itálico (palavra em destaque).
- Logo em SVG inline: `src/components/ui/Logo.tsx` (`NomaLogo`, `NomaSymbol`, `NomaWordmark`).
- Artes prontas: `public/brand/` (SVG) e `public/brand/png/` — logo empilhada, horizontal, símbolo e avatar 1080×1080
  nas 6 cores do feed (lagoa, buriti, areia, mata, por-do-sol, noite) + versões transparentes.
- Regerar as artes: `python3 scripts/brand/brand.py .` (precisa de `fonttools`), depois exportar PNG com ImageMagick.

## Conteúdo editável

`src/config/site.ts`: WhatsApp de fallback (**confirmar o número oficial**), Instagram, vídeo do hero, experiências,
mini-feed, destinos e FAQ.
