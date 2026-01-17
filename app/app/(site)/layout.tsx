import type { ReactNode } from 'react'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <style>{`
          :root{
            /* Premium Scottish palette + higher contrast */
            --bg:#f3f1ea;
            --surface:#ffffff;
            --surface2:rgba(255,255,255,.70);

            --ink:#0b1220;
            --muted:rgba(11,18,32,.72);

            /* Highland tones */
            --navy:#071a34;
            --moss:#275548;
            --heather:#5b4b8a;
            --gold:#c9a227;
            --heatherSoft:rgba(91,75,138,.14);

            /* Stronger separation */
            --border:rgba(11,18,32,.16);
            --border2:rgba(11,18,32,.22);
            --shadow:0 14px 34px rgba(7,26,52,.10);
            --shadow2:0 22px 60px rgba(7,26,52,.14);

            --ring:rgba(201,162,39,.30);
          }

          html,body{
            min-height:100%;
            color:var(--ink);
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji","Segoe UI Emoji";
            background:
              radial-gradient(1100px 620px at 14% -6%, rgba(91,75,138,.22), transparent 62%),
              radial-gradient(1100px 620px at 88% 0%, rgba(39,85,72,.20), transparent 60%),
              linear-gradient(180deg, rgba(11,31,58,.06), rgba(243,241,234,1));
          }

          a{ color: var(--navy); }
          a:hover{ color: var(--heather); }

          img{ max-width:100%; height:auto; display:block; }

          /* Panel = frosted glass section container */
          .panel{
            background: rgba(255,255,255,.62);
            border: 1px solid rgba(11,31,58,.14);
            border-radius: 20px;
            box-shadow: 0 14px 40px rgba(11,31,58,.10);
            backdrop-filter: blur(10px);
            padding: 18px;
          }

          /* Cards = main contrast tool */
          .card{
            background: linear-gradient(180deg, rgba(255,255,255,.99), rgba(255,255,255,.94));
            border: 1px solid rgba(11,31,58,.24);
            border-radius: 16px;
            box-shadow: 0 22px 70px rgba(11,31,58,.18);
            backdrop-filter: blur(6px);
            overflow: hidden;
            transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease, outline 200ms ease;
          }
          .card:hover{
            transform: translateY(-6px);
            border-color: rgba(91,75,138,.42);
            box-shadow: 0 34px 110px rgba(11,31,58,.24);
            outline: 3px solid var(--ring);
            outline-offset: 2px;
          }

          /* Typography helpers */
          .h1{ font-size: 44px; font-weight: 950; letter-spacing: -0.02em; }
          .muted{ color: var(--muted); }

          .badge{
            border: 1px solid rgba(11,31,58,.18);
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 900;
            color: rgba(11,31,58,.92);
            background: rgba(11,31,58,.06);
          }
          .badgeGold{
            border-color: rgba(201,162,39,.40);
            background: rgba(201,162,39,.12);
          }
          .badgeMoss{
            border-color: rgba(39,85,72,.38);
            background: rgba(39,85,72,.10);
          }

          .tourCard{ overflow:hidden; }

          .tourMedia{
            position: relative;
            border-radius: 14px;
            overflow: hidden;
          }
          .tourMedia::after{
            content:"";
            position:absolute;
            inset:0;
            background: linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(11,31,58,.32));
            pointer-events:none;
          }

          .tourCard img{
            transform: scale(1.01);
            transition: transform 260ms ease;
          }
          .tourCard:hover img{
            transform: scale(1.08);
          }

          /* Typography premium */
          .titlePremium{
            font-weight: 950;
            letter-spacing: -0.3px;
          }
          .prose{
            max-width: 70ch;
            color: var(--ink);
            line-height: 1.7;
          }
          .prose p{
            margin: 0 0 12px;
            opacity: .92;
          }
          .prose h2{
            margin: 18px 0 10px;
            font-size: 18px;
            font-weight: 800;
            letter-spacing: -0.2px;
          }
          .prose ul{
            margin: 0;
            padding-left: 18px;
          }

          /* Buttons (more premium + contrast) */
          .btn{
            display:inline-flex;
            justify-content:center;
            align-items:center;
            gap:8px;
            width:100%;
            padding: 12px 14px;
            border-radius: 12px;
            border: 1px solid rgba(11,31,58,.22);
            background: linear-gradient(180deg, #fff, rgba(255,255,255,.92));
            font-weight: 900;
            font-size: 14px;
            cursor: pointer;
            text-decoration: none;
            color: var(--ink);
            box-shadow: 0 4px 12px rgba(11,31,58,.08);
            transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, opacity 160ms ease;
          }
          .btn:focus-visible{ outline: none; box-shadow: var(--ring); }
          .btn[aria-disabled="true"]{
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
          }

          .btnPrimary{
            background: linear-gradient(180deg, var(--navy), rgba(7,26,52,.88));
            color:#fff !important;
            border-color: rgba(7,26,52,.50);
            box-shadow: 0 6px 20px rgba(7,26,52,.18);
          }
          .btnPrimary:hover{
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(7,26,52,.28), 0 0 0 3px rgba(201,162,39,.22);
          }

          .btnSecondary{
            background: linear-gradient(180deg, rgba(39,85,72,.12), rgba(255,255,255,.95));
            border-color: rgba(39,85,72,.30);
            color: rgba(39,85,72,1);
          }
          .btnSecondary:hover{
            transform: translateY(-2px);
            border-color: rgba(39,85,72,.50);
            box-shadow: 0 10px 28px rgba(39,85,72,.16);
          }

          .btnGhost{
            background: rgba(255,255,255,.82);
            border-color: rgba(11,31,58,.18);
          }
          .btnGhost:hover{
            transform: translateY(-1px);
            border-color: rgba(91,75,138,.38);
            box-shadow: 0 10px 24px rgba(91,75,138,.12);
          }

          /* Layout helpers */
          .pageShell{
            padding: 24px 24px 44px;
          }
          .pageInner{
            max-width:1200px;
            margin: 0 auto;
          }
        `}</style>

        <header
          style={{
            borderBottom: '1px solid rgba(11,18,32,.14)',
            background: 'linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.74))',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: '0 auto',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <a
              href="/"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 950,
                letterSpacing: 0.2,
              }}
            >
              Toby’s Highland Tours
            </a>

            <nav style={{ display: 'flex', gap: 14, fontWeight: 900 }}>
              <a href="/tours" className="btn btnGhost" style={{ width: 'auto', padding: '8px 12px' }}>
                Tours
              </a>
            </nav>
          </div>
        </header>

        <main className="pageShell">
          <div className="pageInner">{children}</div>
        </main>
      </body>
    </html>
  )
}
