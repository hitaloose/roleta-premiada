import './loseCard.css';

/** Tela de "quase" da Notas Raras: quem não ganhou leva um docinho. */
export function LoseCard() {
  return (
    <div className="nr-lose-card">
      <svg className="nr-lose-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
      </svg>
      <h1 className="nr-lose-title">AHHH, QUASE! 🍀</h1>
      <p className="nr-lose-text">O prêmio principal escapou dessa vez...</p>
      <h2 className="nr-lose-title">MAS VOCÊ NÃO SAI DE MÃOS VAZIAS! 🎉</h2>
      <p className="nr-lose-text">Você ganhou um docinho para adoçar seu dia!</p>
      <p className="nr-lose-cta">Retire seu mimo com nossa equipe. 🍬</p>
    </div>
  );
}
