# Roleta Premiada

## Exportação e importação de dados

Atalhos ocultos (não aparecem na tela) para a equipe do evento:

| Atalho             | Ação                                              |
| ------------------ | ------------------------------------------------- |
| `Ctrl + Shift + E` | Exporta todos os participantes em CSV             |
| `Ctrl + Shift + U` | Importa um CSV exportado de volta para a roleta   |

### Exportar

- Funciona em qualquer tela da roleta.
- Baixa o arquivo `roleta-premiada-participantes-AAAA-MM-DD.csv`, com ganhadores **e** perdedores.
- Colunas: `nome`, `telefone`, `cpf`, `premio`, `resultado` (`ganhou`/`perdeu`), `data_hora`.
- Os dados ficam no `localStorage` do navegador (chave `roleta-premiada:entries`), preso ao endereço `http://localhost:4173`. Exporte **ao fim de cada dia** e antes de limpar o navegador ou trocar de máquina.

### Importar

- Abre o seletor de arquivo; escolha um CSV gerado pelo `Ctrl + Shift + E`.
- Os participantes do arquivo são **somados** aos atuais — nada é apagado. Registros repetidos (mesmo CPF e mesma data/hora) são ignorados, então importar o mesmo arquivo duas vezes é seguro.
- Os CPFs importados passam a ser bloqueados normalmente.
- Um aviso no topo da tela mostra quantos participantes novos entraram e quantas linhas inválidas foram ignoradas.
- Use para restaurar um backup depois de perder os dados, ou para juntar os participantes de outra máquina e bloquear CPFs repetidos entre elas.

### Proteções do armazenamento

- Ao abrir, a roleta pede ao Chrome armazenamento persistente (`navigator.storage.persist()`), para que os dados não sejam apagados quando o disco estiver cheio. O Chrome decide sozinho se aceita; o resultado aparece no console como `[storage] armazenamento persistente: concedido/negado`.
- Se a gravação no navegador falhar, aparece uma faixa vermelha no topo: **"Os dados não estão sendo salvos no navegador. Exporte agora com Ctrl+Shift+E."** Ela some sozinha quando uma gravação volta a funcionar.

### Outros atalhos ocultos da equipe

| Atalho | Ação                                                             |
| ------ | ---------------------------------------------------------------- |
| `F1`   | Volta para tela cheia (depois de um `Esc` acidental)             |
| `F2`   | Cancela o formulário e volta à tela inicial (ex.: CPF já usado)  |
