# Onboarding App (Frontend)

Esta é a interface de usuário (SPA) do fluxo de cadastro incremental. O projeto foi construído focando em uma experiência fluida (Wizard), componentização reutilizável e design responsivo (Mobile-first). Toda a regra de negócio e tomada de decisão de fluxo está isolada no Backend, tornando este Frontend uma camada puramente visual e de consumo de serviços.

## Tecnologias Utilizadas

* **Framework:** [Next.js](https://nextjs.org/) (App Router / React)
* **Linguagem:** TypeScript (Tipagem estrita, sem uso de `any`)
* **Gerenciamento de Formulários:** React Hook Form
* **Estilização:** CSS Modules (SCSS)
* **Padronização:** ESLint configurado em modo estrito
* **Infraestrutura:** Docker (Dockerfile pronto para produção)

## Arquitetura e Decisões de UX/UI

* **Separação de Responsabilidades:** O frontend não decide os passos de MFA ou validações complexas; ele consome o serviço `api.ts` e reage às respostas do backend.
* **Componentização UI:** Elementos de interface fundamentais (`Input` e `Button`) foram isolados na pasta `src/components/ui`, garantindo reuso em todas as telas do sistema.
* **Mobile-First:** A estilização foi construída usando CSS Grid moderno, garantindo que o layout empilhe perfeitamente em telas pequenas e expanda em telas maiores.
* **Navegação Amigável (Go Back):** O usuário pode retornar para telas anteriores (ex: voltar do Endereço para o Contato) sem perder os dados já preenchidos, utilizando um estado de memória temporária fluida.
* **Revisão de Dados:** Antes do envio final, uma tela de resumo consolida todas as informações, permitindo edição prévia para evitar erros de submissão.

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (Versão 20 ou superior)
* A API do Backend rodando simultaneamente (veja as instruções no repositório do backend: https://github.com/rdkthiago/Onboarding-Project-Backend).

## Como Executar Localmente

Como este projeto se comunica fortemente com o backend, recomendamos rodar localmente no modo de desenvolvimento para facilitar testes pontuais.

**1. Clone o repositório**
git clone https://github.com/rdkthiago/Onboarding-Project-Frontend.git
cd onboarding-frontend

**2. Instale as dependências**
npm install

**3. Configure as Variáveis de Ambiente**
Crie um arquivo `.env.local` na raiz do projeto para apontar para a sua API (por padrão, o Next.js já assume a porta 3000, mas é uma boa prática deixar explícito):
NEXT_PUBLIC_API_URL=http://localhost:3000

**4. Rode o servidor de desenvolvimento**
npm run dev

A aplicação estará disponível no seu navegador em: **[http://localhost:3001](http://localhost:3001)** *(ou 3000, caso a porta esteja livre)*.

## Como Executar via Docker (Produção)

O projeto possui um `Dockerfile` otimizado (baseado em Alpine) preparado para compilar o Next.js para produção.

# Fazer o build da imagem
docker build -t onboarding-frontend .

# Rodar o container expondo a porta 3000
docker run -p 3000:3000 onboarding-frontend

## Qualidade de Código (Linter)

O projeto segue as regras estritas de linting do Next.js e TypeScript. Para rodar a verificação de padronização automática e indentação exigida no teste, execute:

npm run lint
