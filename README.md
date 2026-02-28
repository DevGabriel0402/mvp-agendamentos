# 🗓️ Agendei - SaaS de Agendamento Profissional

O **Agendei** é uma plataforma SaaS (Software as a Service) focada na gestão de agendamentos e serviços para salões de beleza, clínicas e profissionais liberais. Com uma interface **Mobile-First** elegante e um painel administrativo poderoso, o sistema oferece controle total sobre a agenda e o portfólio de serviços.

## ✨ Funcionalidades Principais

### Para o Cliente (Mobile-First)
- **Splash Screen:** Carregamento suave com branding personalizado.
- **Home de Serviços:** Visualização flexível (Lista ou Grid) dos serviços disponíveis.
- **Favoritos:** Salve seus serviços preferidos para acesso rápido.
- **Agendamento Inteligente:** Seleção de data e horários disponíveis em tempo real.
- **Meus Agendamentos:** Histórico completo com status (Agendado, Concluído, Cancelado).

### Para o Administrador (Painel Desktop/Web)
- **Dashboard:** Métricas essenciais e gráficos de desempenho.
- **Gestão de Serviços:** Cadastro com upload de fotos (Cloudinary) e definição de preços/duração.
- **Filtros Avançados:** Busca de atendimentos por status ou data com interface otimizada.
- **Personalização (White Label):** Altere a cor primária, nome do sistema e logo diretamente pelo painel.
- **Gestão de Clientes:** Listagem completa com histórico de contatos.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React + Vite
- **Estilização:** Styled Components (Nude & Rose Gold Theme)
- **Backend:** Firebase (Firestore, Authentication, Hosting)
- **Imagens:** Cloudinary (Unsigned Upload)
- **UX/UI:** React Icons, React DatePicker, React Hot Toast
- **Deploy:** Vercel / Firebase Hosting

## 🚀 Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/DevGabriel0402/mvp-agendamentos.git
   cd mvp-agendamento
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto com as chaves do seu Firebase e Cloudinary:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_CLOUDINARY_UPLOAD_PRESET=...
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 📸 Identidade Visual

O sistema utiliza uma paleta de cores moderna e profissional:
- **Principal:** Nude (#DDA7A5)
- **Surface:** White (#FAFAF8)
- **Text:** Dark Grey (#2D2A26)

---
Desenvolvido por **DevGabriel0402** - 2026.
