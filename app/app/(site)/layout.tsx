import type { ReactNode } from 'react'
import TopBarClient from './components/TopBarClient'

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

          /* Price pills for dual-tier pricing */
          .priceGrid{
            display: flex;
            gap: 8px;
            margin-top: 14px;
            flex-wrap: wrap;
          }
          .pricePill{
            flex: 1;
            min-width: 90px;
            padding: 8px 10px;
            border-radius: 10px;
            text-align: center;
            font-size: 11px;
            font-weight: 800;
            border: 1px solid rgba(11,31,58,.18);
            background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.85));
            box-shadow: 0 2px 6px rgba(11,31,58,.06);
          }
          .pricePill .label{
            display: block;
            font-size: 10px;
            font-weight: 700;
            opacity: 0.7;
            margin-bottom: 2px;
          }
          .pricePill .price{
            display: block;
            font-size: 14px;
            font-weight: 950;
            color: var(--navy);
          }
          .pricePillGold{
            border-color: rgba(201,162,39,.40);
            background: linear-gradient(180deg, rgba(201,162,39,.12), rgba(255,255,255,.92));
          }
          .pricePillMoss{
            border-color: rgba(39,85,72,.38);
            background: linear-gradient(180deg, rgba(39,85,72,.10), rgba(255,255,255,.92));
          }

          /* Party size selector */
          .partySizeGrid{
            display: flex;
            gap: 6px;
            margin: 10px 0;
          }
          .partySizeBtn{
            flex: 1;
            padding: 10px 8px;
            border-radius: 10px;
            border: 1px solid rgba(11,31,58,.18);
            background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.85));
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            text-align: center;
            transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }
          .partySizeBtn:hover{
            border-color: rgba(91,75,138,.38);
          }
          .partySizeBtn.active{
            border-color: var(--navy);
            background: linear-gradient(180deg, rgba(7,26,52,.08), rgba(255,255,255,.95));
            box-shadow: 0 0 0 2px rgba(7,26,52,.12);
          }
          .partySizeBtn .count{
            display: block;
            font-size: 16px;
            font-weight: 950;
            color: var(--navy);
          }

          /* Booking form inputs */
          .bookingInput{
            width: 100%;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid rgba(11,31,58,.18);
            background: rgba(255,255,255,.95);
            font-size: 13px;
            font-family: inherit;
            color: var(--ink);
            transition: border-color 160ms ease, box-shadow 160ms ease;
          }
          .bookingInput:focus{
            outline: none;
            border-color: var(--navy);
            box-shadow: 0 0 0 3px rgba(7,26,52,.08);
          }
          .bookingInput::placeholder{
            color: rgba(11,31,58,.45);
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

          /* Top bar */
          .topBar{
            background: var(--navy);
            color: rgba(255,255,255,.92);
            font-size: 12px;
          }
          .topBarInner{
            max-width: 1200px;
            margin: 0 auto;
            padding: 8px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
          }
          .topLeft{
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
          }
          .topRight{
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .topLink{
            color: rgba(255,255,255,.85);
            text-decoration: none;
            transition: color 160ms ease;
          }
          .topLink:hover{
            color: var(--gold);
          }
          .iconBtn{
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: rgba(255,255,255,.12);
            color: rgba(255,255,255,.9);
            text-decoration: none;
            transition: background 160ms ease, color 160ms ease;
          }
          .iconBtn:hover{
            background: rgba(255,255,255,.22);
            color: var(--gold);
          }
          .langDropdown{
            position: relative;
          }
          .langBtn{
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 5px 10px;
            border-radius: 6px;
            border: none;
            background: rgba(255,255,255,.12);
            color: rgba(255,255,255,.92);
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: background 160ms ease;
          }
          .langBtn:hover{
            background: rgba(255,255,255,.22);
          }
          .langFlag{
            font-size: 14px;
          }
          .langCode{
            font-weight: 800;
          }
          .langMenu{
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 4px;
            padding: 6px 0;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            box-shadow: var(--shadow);
            list-style: none;
            z-index: 100;
            min-width: 140px;
          }
          .langOption{
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 8px 14px;
            border: none;
            background: transparent;
            color: var(--ink);
            font-size: 13px;
            cursor: pointer;
            text-align: left;
            transition: background 120ms ease;
          }
          .langOption:hover{
            background: rgba(11,31,58,.06);
          }
          .langOption.active{
            background: rgba(201,162,39,.14);
            font-weight: 700;
          }

          /* Hero slider */
          .heroSlider{
            position: relative;
            height: 480px;
            border-radius: 20px;
            overflow: hidden;
            margin-bottom: 40px;
          }
          .heroSlide{
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 600ms ease;
          }
          .heroContent{
            text-align: center;
            color: #fff;
            padding: 24px;
            max-width: 600px;
          }
          .heroTitle{
            font-size: 42px;
            font-weight: 950;
            letter-spacing: -0.02em;
            margin: 0 0 12px;
            text-shadow: 0 4px 20px rgba(0,0,0,0.3);
          }
          .heroSubtitle{
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 24px;
            opacity: 0.92;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
          }
          .heroBtn{
            width: auto;
            padding: 14px 28px;
            font-size: 15px;
          }
          .heroArrow{
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: none;
            background: rgba(255,255,255,0.9);
            color: var(--navy);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            transition: background 160ms ease, transform 160ms ease;
          }
          .heroArrow:hover{
            background: #fff;
            transform: translateY(-50%) scale(1.08);
          }
          .heroArrowLeft{ left: 16px; }
          .heroArrowRight{ right: 16px; }
          .heroDots{
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
          }
          .heroDot{
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.7);
            background: transparent;
            cursor: pointer;
            transition: background 160ms ease, border-color 160ms ease;
          }
          .heroDot:hover{
            border-color: #fff;
          }
          .heroDot.active{
            background: #fff;
            border-color: #fff;
          }

          /* Section headers */
          .sectionHeader{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
          }
          .sectionTitle{
            font-size: 28px;
            font-weight: 950;
            letter-spacing: -0.02em;
            margin: 0;
          }
          .viewAllLink{
            font-size: 14px;
            font-weight: 800;
            color: var(--navy);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: color 160ms ease;
          }
          .viewAllLink:hover{
            color: var(--heather);
          }

          /* Product grid */
          .productGrid{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
          }
        `}</style>

        {/* Top bar with contact info + socials + language */}
        <div className="topBar">
          <div className="topBarInner">
            <div className="topLeft">
              <a href="mailto:info@tobyshighlandtours.com" className="topLink">
                info@tobyshighlandtours.com
              </a>
              <a href="tel:+447383488007" className="topLink">+44 738 348 8007</a>
              <a href="tel:+441463444222" className="topLink">+44 1463 444 222</a>
            </div>
            <div className="topRight">
              <a
                href="https://www.facebook.com/profile.php?id=61556286421645"
                target="_blank"
                rel="noopener noreferrer"
                className="iconBtn"
                aria-label="Facebook"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/tobyshighlandtours"
                target="_blank"
                rel="noopener noreferrer"
                className="iconBtn"
                aria-label="Instagram"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://wa.me/447383488007"
                target="_blank"
                rel="noopener noreferrer"
                className="iconBtn"
                aria-label="WhatsApp"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <TopBarClient />
            </div>
          </div>
        </div>

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
              <a href="/transfers" className="btn btnGhost" style={{ width: 'auto', padding: '8px 12px' }}>
                Transfers
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
