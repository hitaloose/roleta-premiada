/**
 * Enter envia o formulário do campo. O submit implícito do navegador não
 * dispara quando outro código cancela o keydown (ex.: extensões); aqui o
 * Enter é tratado no próprio campo, como no FormField da roleta, e o
 * preventDefault evita um segundo submit.
 */
export function submitOnEnter(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
}
