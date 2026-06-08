# Safer Maps - Protótipo

Safer Maps é um protótipo de aplicação que almeja permitir que comunidade LGBTQIA+ e aliados descobrir, cadastrar e avaliar espaços seguros e inclusivos, como por exemplo cafés, bares, clínicas de saúde, instituições de ensino e muito mais. O objetivo é construir um mapa colaborativo de locais que respeitam e acolhem diversidade.

## Funcionalidades

- **Mapa interativo** — visualize locais próximos com integração à API do Google Places
- **Cadastro de locais** — adicione novos estabelecimentos com descrição, categoria, endereço e amenidades
- **Avaliações e notas** — deixe comentários e uma nota de 1 a 5 para cada local
- **Favoritos** — salve locais para acessar rapidamente depois
- **Filtros avançados** — filtre por categoria, amenidades, nota mínima e distância
- **Amenidades inclusivas** — banheiro gênero neutro, aceita nome social, acessível para PCD, ambiente acolhedor, funcionários preparados, entre outros
- **Autenticação completa** — cadastro, login, verificação de e-mail e autenticação de dois fatores (2FA)
- **Perfil com pronomes** — os usuários podem informar seus pronomes no cadastro

## Tecnologias

- **Backend:** PHP 8.5 · Laravel 13
- **Frontend:** React · TypeScript · Inertia.js v3 · Tailwind CSS
- **Banco de dados:** SQLite (padrão, sem configuração extra necessária)
- **Qualidade de código:** PHPStan · Pint · Pest

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [PHP 8.5+](https://php.net/releases/)
- [Composer](https://getcomposer.org)
- [Bun](https://bun.sh) (gerenciador de pacotes JavaScript)
- [Git](https://git-scm.com)
- Uma **chave de API do Google Maps** com as APIs *Places API* e *Maps JavaScript API* habilitadas ([Google Cloud Console](https://console.cloud.google.com))

## Como rodar localmente

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd safer-app
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e edite conforme necessário:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e preencha sua chave da API do Google Maps:

```env
GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

> As demais variáveis já possuem valores padrão adequados para desenvolvimento local. O banco de dados usa SQLite por padrão — nenhuma configuração extra de banco é necessária.

### 3. Execute o setup automatizado

O comando abaixo instala todas as dependências PHP e JavaScript, gera a chave da aplicação, executa as migrations e builda os assets do frontend:

```bash
composer setup
```

### 4. Suba o servidor de desenvolvimento

```bash
composer dev
```

Esse único comando inicia em paralelo:
- Servidor Laravel (`http://localhost:8000`)
- Worker de filas
- Monitor de logs (Pail)
- Servidor de desenvolvimento Vite (hot reload)

Acesse a aplicação em **http://localhost:8000**.

## Rodando os testes

```bash
composer test
```

Isso executa a suíte completa: cobertura de tipos, testes unitários, análise estática (PHPStan nível 9) e linting.

Para rodar apenas os testes unitários:

```bash
php artisan test --compact
```

## Estrutura do projeto

```
app/
  Actions/        # Lógica de negócio encapsulada em classes de ação (padrão Actions)
  Http/
    Controllers/  # Controllers HTTP e de API
    Requests/     # Form Requests para validação
  Models/         # User, Place, Review
  Services/       # Integração com a API do Google Places
resources/
  js/
    pages/        # Páginas React (dashboard, locais, mapa, configurações, auth)
    components/   # Componentes reutilizáveis (PlaceDetailPanel, ReviewFormModal, etc.)
    hooks/        # usePlaces, usePlaceDetails
database/
  migrations/     # Estrutura do banco de dados
  factories/      # Factories para testes
tests/
  Feature/        # Testes de integração
  Unit/           # Testes unitários
```

## Licença

Este projeto foi desenvolvido para o Trabalho de Conclusão de Curso (TCC) "TECNOLOGIA E INCLUSÃO - DESENVOLVIMENTO DE PROTÓTIPO DE
APLICATIVO DE CROWDSOURCING PARA IDENTIFICAÇÃO DE
LOCAIS SEGUROS DA COMUNIDADE LGBTQIA+" e está licenciado sob a [licença MIT](https://opensource.org/licenses/MIT).
