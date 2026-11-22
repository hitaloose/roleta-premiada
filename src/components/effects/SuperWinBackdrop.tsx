/**
 * Fundo do super prêmio: raios dourados girando atrás do texto e um flash
 * de tela cheia no início. Fica preso ao RotatedViewport (position: fixed
 * dentro de um ancestral com transform).
 */
export function SuperWinBackdrop() {
  return (
    <>
      <div className="super-rays" aria-hidden />
      <div className="super-flash" aria-hidden />
    </>
  );
}
