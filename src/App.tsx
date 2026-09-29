import React, { useEffect, useRef, useState } from 'react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Foto persistente: salva em localStorage e permanece definitiva
  const [userFoto, setUserFoto] = useState<string | null>(() => {
    return localStorage.getItem('arcelio_permanent_foto');
  });

  const NUMERO = '258873344055';
  const NUMERO2 = '258840564995';
  const link1 = `https://wa.me/${NUMERO}?text=${encodeURIComponent(
    'Olá Arcélio, quero inscrever-me no curso de microcrédito.'
  )}`;
  const link2 = `https://wa.me/${NUMERO2}?text=${encodeURIComponent(
    'Olá Arcélio, quero inscrever-me no curso de microcrédito.'
  )}`;

  // Upload definitivo da imagem: uma única vez e fixa permanentemente
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setUserFoto(result);
          try {
            localStorage.setItem('arcelio_permanent_foto', result);
          } catch (err) {
            console.warn('Erro ao salvar no storage:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('js');

    const handleScroll = () => {
      const h = document.documentElement;
      const bar = document.getElementById('bar');
      if (bar) {
        bar.style.width = `${(h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100}%`;
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Scroll reveal observer
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((x) => {
          if (x.isIntersecting) {
            x.target.classList.add('in');
            io.unobserve(x.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll('.rv').forEach((el) => {
      io.observe(el);
    });

    // Fab button observer
    const fab = document.getElementById('fab');
    const inscricaoEl = document.getElementById('inscricao');
    let fabObserver: IntersectionObserver | null = null;
    if (fab && inscricaoEl) {
      fabObserver = new IntersectionObserver(
        (entries) => {
          fab.classList.toggle('off', entries[0].isIntersecting);
        },
        { threshold: 0.3 }
      );
      fabObserver.observe(inscricaoEl);
    }

    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
      return () => {
        window.removeEventListener('scroll', handleScroll);
        io.disconnect();
        if (fabObserver) fabObserver.disconnect();
      };
    }

    // Hero tilt and spot light
    const hero = heroRef.current;
    const spot = spotRef.current;
    const tilt = tiltRef.current;

    const handlePointerMove = (e: PointerEvent) => {
      if (!hero || !spot || !tilt) return;
      const r = hero.getBoundingClientRect();
      spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
      spot.style.setProperty('--my', `${e.clientY - r.top}px`);
      const q = tilt.getBoundingClientRect();
      const x = (e.clientX - q.left) / q.width - 0.5;
      const y = (e.clientY - q.top) / q.height - 0.5;
      tilt.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    };

    const handlePointerLeave = () => {
      if (tilt) tilt.style.transform = '';
    };

    if (hero) {
      hero.addEventListener('pointermove', handlePointerMove);
      hero.addEventListener('pointerleave', handlePointerLeave);
    }

    // Canvas spark particle animation
    const c = canvasRef.current;
    let animId: number;
    if (c && hero) {
      const g = c.getContext('2d');
      if (g) {
        let W = (c.width = hero.offsetWidth);
        let H = (c.height = hero.offsetHeight);

        const handleResize = () => {
          if (!hero || !c) return;
          W = c.width = hero.offsetWidth;
          H = c.height = hero.offsetHeight;
        };
        window.addEventListener('resize', handleResize);

        const P: Array<{ x: number; y: number; r: number; v: number; a: number }> = [];
        for (let i = 0; i < 50; i++) {
          P.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 2.2 + 0.6,
            v: Math.random() * 0.6 + 0.25,
            a: Math.random(),
          });
        }

        const loop = () => {
          g.clearRect(0, 0, W, H);
          P.forEach((p) => {
            p.y -= p.v;
            p.a += 0.02;
            if (p.y < -5) {
              p.y = H + 5;
              p.x = Math.random() * W;
            }
            g.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(p.a));
            g.fillStyle = '#f6d476';
            g.beginPath();
            g.arc(p.x, p.y, p.r, 0, 6.283);
            g.fill();
          });
          animId = requestAnimationFrame(loop);
        };
        loop();

        return () => {
          window.removeEventListener('scroll', handleScroll);
          window.removeEventListener('resize', handleResize);
          io.disconnect();
          if (fabObserver) fabObserver.disconnect();
          cancelAnimationFrame(animId);
          if (hero) {
            hero.removeEventListener('pointermove', handlePointerMove);
            hero.removeEventListener('pointerleave', handlePointerLeave);
          }
        };
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      io.disconnect();
      if (fabObserver) fabObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className="bar" id="bar"></div>
      <nav>
        <div className="wrap">
          <span className="logo">Arcélio Tivane</span>
          <a className="cta" href="#inscricao">
            Inscrever-me
          </a>
        </div>
      </nav>

      {/* Input de arquivo invisível para envio único e definitivo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <header className="hero" ref={heroRef}>
        <canvas id="sparks" ref={canvasRef}></canvas>
        <div className="spot" id="spot" ref={spotRef}></div>
        <div className="wrap">
          <div>
            <span className="badge">
              <i className="dot"></i>Oficialmente abertas as inscrições
            </span>
            <h1>
              Curso Intensivo de <span className="gold">Microcrédito</span>
            </h1>
            <div className="chips">
              <span>Turma especial</span>
              <span>Aulas 100% online</span>
              <span>30 dias</span>
            </div>
            <p className="sub">
              Se deseja aprender um dos negócios que mais crescem no mercado financeiro e entender como funciona uma
              operação de microcrédito na prática, esta é a sua oportunidade.
            </p>
            <a className="cta" href="#inscricao">
              Quero inscrever-me
            </a>
          </div>

          <figure className="frame" style={{ marginBottom: '22px' }}>
            <div className="tilt" id="tilt" ref={tiltRef}>
              {userFoto ? (
                /* Imagem salva permanentemente pelo usuário */
                <img
                  id="foto"
                  src={userFoto}
                  alt="Arcélio Tivane"
                  width="900"
                  height="900"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    borderRadius: '24px',
                    border: '3px solid #fff',
                  }}
                />
              ) : (
                /* Espaço livre e convidativo para você adicionar a sua imagem */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    aspectRatio: '1/1',
                    borderRadius: '24px',
                    border: '3px dashed var(--gold)',
                    background: 'rgba(21, 21, 23, 0.9)',
                    cursor: 'pointer',
                    padding: '24px',
                    textAlign: 'center',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
                  }}
                >
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: 'rgba(224, 172, 43, 0.16)',
                      border: '1px solid var(--gold)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '32px',
                      marginBottom: '16px',
                      color: 'var(--gold2)',
                    }}
                  >
                    +
                  </div>
                  <strong style={{ fontSize: '18px', color: '#fff', marginBottom: '6px' }}>
                    Adicione a sua foto aqui
                  </strong>
                  <p style={{ fontSize: '14px', color: 'var(--mut)', margin: '0 0 16px', maxWidth: '240px' }}>
                    Clique aqui para selecionar a foto do seu telemóvel ou computador.
                  </p>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, var(--gold2), var(--gold))',
                      color: 'var(--ink)',
                      fontWeight: 700,
                      fontSize: '14px',
                      padding: '10px 22px',
                      borderRadius: '99px',
                      boxShadow: '0 6px 16px rgba(224, 172, 43, 0.3)',
                    }}
                  >
                    Carregar foto
                  </span>
                </div>
              )}
            </div>

            <figcaption className="tag">
              Arcélio Tivane<small>Mestre</small>
            </figcaption>
          </figure>
        </div>
      </header>

      <div className="strip" aria-hidden="true">
        <div>
          Inscrições abertas &nbsp;★&nbsp; Turma especial &nbsp;★&nbsp; Inscrições abertas &nbsp;★&nbsp; Turma especial
          &nbsp;★&nbsp; Inscrições abertas &nbsp;★&nbsp; Turma especial &nbsp;★&nbsp; Inscrições abertas &nbsp;★&nbsp;
          Turma especial &nbsp;★&nbsp; Inscrições abertas &nbsp;★&nbsp; Turma especial &nbsp;★&nbsp; Inscrições abertas
          &nbsp;★&nbsp; Turma especial &nbsp;★&nbsp; Inscrições abertas &nbsp;★&nbsp; Turma especial &nbsp;★&nbsp;
          Inscrições abertas &nbsp;★&nbsp; Turma especial &nbsp;★&nbsp;
        </div>
      </div>

      <main>
        <section className="sec light">
          <div className="wrap">
            <h2 className="rv">O que é o microcrédito?</h2>
            <p className="lead rv">
              Empréstimos de pequeno valor para pessoas e pequenos negócios que normalmente não têm acesso ao crédito dos
              bancos tradicionais.
            </p>
            <div className="cards">
              <div className="card rv" style={{ '--d': '0s' } as React.CSSProperties}>
                <b className="ic">💰</b>
                <h3>Pequeno valor</h3>
                <p>Montantes ajustados a quem está a começar ou a crescer.</p>
              </div>
              <div className="card rv" style={{ '--d': '.15s' } as React.CSSProperties}>
                <b className="ic">🤝</b>
                <h3>Mais acesso</h3>
                <p>Chega a quem os bancos tradicionais normalmente não atendem.</p>
              </div>
              <div className="card rv" style={{ '--d': '.3s' } as React.CSSProperties}>
                <b className="ic">🌱</b>
                <h3>Para negócios</h3>
                <p>Ajuda a iniciar ou fazer crescer uma actividade.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec" id="programa">
          <div className="wrap">
            <h2 className="rv">Programa do curso</h2>
            <p className="lead rv" style={{ color: 'var(--mut)' }}>
              Cinco módulos, do básico até ao crescimento do negócio.
            </p>
            <div className="steps">
              <div className="step rv" style={{ '--d': '0s' } as React.CSSProperties}>
                <h3>Fundamentos do Microcrédito</h3>
              </div>
              <div className="step rv" style={{ '--d': '.1s' } as React.CSSProperties}>
                <h3>Legalização</h3>
              </div>
              <div className="step rv" style={{ '--d': '.2s' } as React.CSSProperties}>
                <h3>Estrutura e Sistemas do Microcrédito</h3>
              </div>
              <div className="step rv" style={{ '--d': '.3s' } as React.CSSProperties}>
                <h3>Crédito Passo a Passo</h3>
              </div>
              <div className="step rv" style={{ '--d': '.4s' } as React.CSSProperties}>
                <h3>Escala, Expansão e Crescimento Sustentável</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="sec light" id="bonus">
          <div className="wrap">
            <h2 className="rv">Bónus especiais</h2>
            <p className="lead rv">Incluídos quando se inscreve no curso.</p>
            <div className="cards">
              <div className="card rv" style={{ '--d': '0s' } as React.CSSProperties}>
                <b className="ic">📘</b>
                <h3>Ebook Microcrédito</h3>
              </div>
              <div className="card rv" style={{ '--d': '.15s' } as React.CSSProperties}>
                <b className="ic">📑</b>
                <h3>Legalização acompanhada</h3>
              </div>
              <div className="card rv" style={{ '--d': '.3s' } as React.CSSProperties}>
                <b className="ic">🏅</b>
                <h3>Certificado de Participação</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="sec proof" id="proof" hidden>
          <div className="wrap">
            <h2 className="rv">Quem já fez o curso</h2>
          </div>
          <div className="track-wrap">
            <div className="track" id="track"></div>
          </div>
        </section>

        <section className="sec mestre">
          <div className="wrap rv">
            {userFoto ? (
              <img
                id="foto2"
                src={userFoto}
                alt="Arcélio Tivane"
                width="180"
                height="180"
                style={{
                  width: '180px',
                  height: '180px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '4px solid var(--gold)',
                }}
              />
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  border: '4px dashed var(--gold)',
                  background: 'rgba(21, 21, 23, 0.9)',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '28px', color: 'var(--gold2)' }}>📷</div>
                  <span style={{ fontSize: '13px', color: 'var(--gold2)', fontWeight: 700 }}>
                    Sua foto
                  </span>
                </div>
              </div>
            )}
            <div>
              <h2>Arcélio Tivane</h2>
              <p>Mestre do curso de microcrédito.</p>
            </div>
          </div>
        </section>

        <section className="sec final" id="inscricao">
          <div className="wrap">
            <h2 className="rv">Quem entra cedo, entra com vantagem</h2>
            <p className="rv">Corra e garanta a sua vaga com desconto do primeiro dia.</p>
            <a className="cta" href={link1} target="_blank" rel="noopener noreferrer">
              WhatsApp 873 344 055
            </a>{' '}
            <a className="cta alt" id="wa2" href={link2} target="_blank" rel="noopener noreferrer">
              WhatsApp 840 564 995
            </a>
          </div>
        </section>
      </main>

      <footer>Arcélio Tivane — Curso de Microcrédito</footer>
      <a className="cta fab" id="fab" href="#inscricao">
        Inscrever-me
      </a>
    </>
  );
}
