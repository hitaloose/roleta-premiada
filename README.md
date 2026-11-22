# Roleta Premiada

Online: **https://hitaloose.github.io/roleta-premiada/** (deploy automático a cada push na `main`).

## Tela de configurações da equipe (`/config`)

Na tela inicial da roleta, aperte **`Ctrl + Shift + K`** (atalho oculto, só funciona com a roleta parada). A tela pede o **PIN da equipe**. No primeiro acesso em cada navegador, ela pede para criar um PIN de 4 a 8 números.

A tela sempre abre na aba **Geral**. Assim dá para entrar no meio do evento sem mostrar as probabilidades para quem está por perto.

| Aba                 | O que tem                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Geral**           | Tema (Notas Raras / Mota Fashion), validação de CPF ligada/desligada, troca do PIN                                                                  |
| **Participantes**   | Contadores, lista de quem já rodou, **Exportar CSV**, **Importar CSV**, **Zerar dados**                                                            |
| **Itens da roleta** | Texto, tipo e peso de cada fatia, com a % de chance calculada. Salvo por tema; "Restaurar padrão do tema" volta para `src/brands/<marca>/prizes.ts` |

- **Validação de CPF desligada**: o CPF continua sendo pedido, mas qualquer número é aceito e pode repetir.
- **Zerar dados** pede para digitar `ZERAR` e oferece "Exportar e zerar". Não dá para desfazer.
- Tudo (configuração e participantes) fica no `localStorage` **do navegador e do endereço** em uso. `localhost:4173` e o GitHub Pages têm dados separados. Para levar dados de um para o outro, exporte o CSV de um e importe no outro.

## Exportação e importação de dados

Além dos botões da aba Participantes, existem atalhos ocultos que funcionam em qualquer tela da roleta:

| Atalho             | Ação                                            |
| ------------------ | ----------------------------------------------- |
| `Ctrl + Shift + E` | Exporta todos os participantes em CSV           |
| `Ctrl + Shift + U` | Importa um CSV exportado de volta para a roleta |

### Exportar

- Baixa o arquivo `roleta-premiada-participantes-AAAA-MM-DD.csv`, com ganhadores **e** perdedores.
- Colunas: `nome`, `telefone`, `cpf`, `premio`, `resultado` (`ganhou`/`perdeu`), `data_hora`.
- Exporte **ao fim de cada dia** e antes de limpar o navegador ou trocar de máquina.

### Importar

- Os participantes do arquivo são **somados** aos atuais e nada é apagado. Registros repetidos (mesmo CPF e mesma data/hora) são ignorados, então importar o mesmo arquivo duas vezes é seguro.
- Os CPFs importados passam a ser bloqueados normalmente (com a validação de CPF ligada).
- Use para restaurar um backup ou para juntar os participantes de outra máquina.

### Proteções do armazenamento

- Ao abrir, a roleta pede ao Chrome armazenamento persistente (`navigator.storage.persist()`). O resultado aparece no console como `[storage] armazenamento persistente: concedido/negado`.
- Se a gravação no navegador falhar, aparece uma faixa vermelha no topo pedindo para exportar. Ela some quando uma gravação volta a funcionar.

### Outros atalhos ocultos da equipe

| Atalho | Ação                                                            |
| ------ | --------------------------------------------------------------- |
| `F1`   | Volta para tela cheia (depois de um `Esc` acidental)            |
| `F2`   | Cancela o formulário e volta à tela inicial (ex.: CPF já usado) |

## Rodar localmente / evento sem internet

- `npm run dev`: desenvolvimento.
- `npm run event`: build + servidor local em `http://localhost:4173`. No Windows, o `iniciar-evento.bat` faz isso e abre o Chrome em modo kiosk.
- `npm test`: testes.

O site no GitHub Pages precisa de internet para abrir. Em evento sem internet, use o modo local acima.

## Deploy (GitHub Pages)

O workflow `.github/workflows/deploy.yml` roda os testes, gera o build com o base path `/roleta-premiada/` e publica no Pages a cada push na `main` (ou manualmente em Actions → "Deploy no GitHub Pages" → Run workflow).

Configuração única no repositório: **Settings → Pages → Source: GitHub Actions**.
