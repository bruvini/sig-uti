# SIG-UTI • Sistema de Inteligência e Gestão de Leitos de Terapia Intensiva

### Central de Regulação Hospitalar baseada na Resolução CFM nº 2.156/2016

![React](https://img.shields.io/badge/React-18-blue?logo=react&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-Verified-orange?logo=firebase&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?logo=tailwindcss&style=flat-square)
![License](https://img.shields.io/badge/License-GPLv3-red?style=flat-square)
![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=flat-square)

---

## 🏥 Sobre o Projeto

O **SIG-UTI** é um sistema de alta complexidade desenvolvido para modernizar e otimizar a Central de Regulação de Leitos do **Hospital Municipal São José (HMSJ)**.

Seu principal objetivo é garantir o **giro eficiente de leitos** e a **equidade no acesso** aos recursos de terapia intensiva. Diferente de sistemas administrativos comuns, o SIG-UTI implementa algoritmos de decisão clínica baseados em critérios técnicos rigorosos (Score SOFA, APACHE II e Protocolos de Priorização), assegurando que os pacientes mais críticos tenham prioridade no atendimento.

### Identidade Visual e Usabilidade
A interface segue padrões internacionais de **Usabilidade Médica ("Clean Interface")**. Projetada para ambientes de alta pressão, utiliza uma paleta de cores sóbria para reduzir a fadiga visual dos profissionais de saúde, mantendo uma alta densidade de informações críticas (Cockpit View) sem poluição visual.

---

## 🚀 Funcionalidades Chave (Core Features)

*   **Regulação Inteligente (AI-Assisted):** Algoritmo automatizado que calcula a prioridade clínica dos pacientes (P1 a P5) estritamente conforme a **Resolução CFM nº 2.156/2016**, equilibrando necessidade de suporte à vida e prognóstico de recuperação.
*   **Gestão de Filas Especializadas:** Visualização segmentada ("Split View") entre pacientes **Cirúrgicos/Eletivos** e **Internados/Emergência**, permitindo estratégias de alocação distintas para cada fluxo.
*   **Gestão de Leitos (CRUD Avançado):** Mapa de ocupação em tempo real ("Active Reporting").
    *   Gestão de status granular: *Limpo, Ocupado, Em Mecânica, Alta Confirmada, Bloqueado*.
    *   Histórico completo de movimentação e tempos de permanência.
*   **Auditoria e Rastreabilidade:** Log imutável de todas as ações sensíveis (criação, regulação, recusa, cancelamento). O sistema registra *quem* fez, *quando* fez e o *motivo* (justificativa obrigatória para ações destrutivas), garantindo segurança jurídica e clínica.
*   **Integração Governamental:** Arquitetura de dados preparada para sincronização com bases externas, como o **SISREG** (Sistema Nacional de Regulação).

---

## 🛠️ Stack Tecnológica e Arquitetura

O projeto utiliza uma arquitetura **Serverless** moderna, focada em performance e escalabilidade.

*   **Frontend:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) (Build Tool).
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Tipagem estrita para segurança de código).
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/) (Componentes acessíveis baseados em Radix Primitives).
*   **Backend & Infraestrutura:** [Google Firebase](https://firebase.google.com/).
    *   **Authentication:** Gestão de identidade e acesso.
    *   **Firestore:** Banco de dados NoSQL em tempo real.
    *   **Hosting:** Hospedagem global em CDN.
*   **Gerenciamento de Estado:** [React Query (TanStack)](https://tanstack.com/query/latest) para cache inteligente e sincronização em tempo real.
*   **Validação de Dados:** [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) para formulários robustos e "Type-Safe".

---

## 💻 Guia de Instalação e Desenvolvimento

### Pré-requisitos
*   [Node.js](https://nodejs.org/) (Versão 18 ou superior).
*   [NPM](https://www.npmjs.com/) (Gerenciador de pacotes).

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/sig-uti.git
    cd sig-uti
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração do Ambiente (Firebase):**
    *   Crie um arquivo `.env.local` na raiz do projeto.
    *   Adicione as credenciais do seu projeto Firebase (obtenha no Console do Firebase):
    ```env
    VITE_FIREBASE_API_KEY=sua_api_key
    VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=seu_projeto
    # ... demais variáveis conforme configuração do src/lib/firebase.ts
    ```
    > **Nota:** O arquivo de configuração atual (`src/lib/firebase.ts`) pode conter chaves públicas de desenvolvimento. Para produção, utilize variáveis de ambiente estritas.

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O sistema estará acessível em `http://localhost:8080`.

---

## 📄 Licença e Direitos Autorais

Este projeto está licenciado sob a **GNU General Public License v3.0 (GPLv3)**.

> **Desenvolvido para o Hospital Municipal São José (HMSJ).**
>
> **Copyright © 2026 Bruno Vinícius da Silva. Todos os direitos reservados conforme a licença.**

A licença GPLv3 garante que este software é livre para uso, estudo, modificação e distribuição, desde que:
1.  Qualquer versão modificada ou derivada também seja distribuída sob a mesma licença (Copyleft).
2.  Os créditos de autoria originais sejam mantidos e visíveis.
3.  Não haja garantias explícitas de funcionamento (uso por conta e risco).

Para mais detalhes, consulte o arquivo [LICENSE](LICENSE) no repositório.
