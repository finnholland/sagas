<div align="center">
  <img width="100" alt="sagas" src="https://github.com/finnholland/sagas/assets/65142636/9f659aff-caf1-42a2-8d86-e9e8e26f3244">
</div>

<h1 align="center">Sagas</h1>

<p align="center">
  A personal development blog built with <strong>Next.js</strong>, backed by a fully serverless <strong>AWS</strong> infrastructure provisioned with <strong>Terraform</strong>.
  <br />
  <a href="https://sagas.finnholland.dev" target="_blank">sagas.finnholland.dev</a>
</p>

---

## Overview

Sagas is a full-stack personal blog platform where posts (and groups of related posts called "sagas") can be written in Markdown, organised with tags, and shared publicly. Readers can like posts and leave comments. The entire backend is serverless — no servers to manage — with all infrastructure defined as code and deployed to AWS.

Key features:
- Write and edit posts with a live Markdown editor
- Organise posts into sagas (series/collections) with custom tags
- Commenting with automatic profanity filtering
- Like/unlike posts and individual comments
- Draft auto-save while editing
- Post visibility toggling (publish/hide)
- JWT-authenticated admin actions via AWS Cognito
- Infinite scroll for the post feed

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [Next.js 13](https://nextjs.org/) | React framework with App Router |
| [React 18](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety across the entire app |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [AWS Amplify](https://aws.amazon.com/amplify/) | Cognito authentication client |
| [Axios](https://axios-http.com/) | HTTP client for API calls |
| [React Markdown](https://github.com/remarkjs/react-markdown) | Markdown rendering |
| [UIW MD Editor](https://uiwjs.github.io/react-md-editor/) | Markdown editing with live preview |
| [Moment.js](https://momentjs.com/) | Date/time formatting |

### Backend — AWS Serverless

| Service | Role |
|---|---|
| **API Gateway v2** | HTTP API with CORS and JWT authorisation |
| **Lambda (Python 3.11)** | Serverless compute — one function per endpoint |
| **DynamoDB** | Single-table NoSQL database for posts, users, and comments |
| **Cognito** | User authentication and JWT token issuance |
| **S3** | Object storage for images and profile pictures |
| **Route 53** | DNS management for the API domain |
| **ACM** | TLS/SSL certificates |

### Infrastructure

| Tool | Purpose |
|---|---|
| [Terraform](https://www.terraform.io/) | Infrastructure as Code — all AWS resources defined and deployed via Terraform |

---

## Architecture

```
Browser
  │
  ├─── Next.js (React)
  │      └─ AWS Amplify SDK ──► Cognito (auth / JWT)
  │      └─ Axios ─────────────► API Gateway v2
  │                                    │
  │                           JWT Authorizer (Cognito)
  │                                    │
  │                          ┌─────────┴──────────┐
  │                     Public routes         Protected routes
  │                          │                     │ (JWT required)
  │                    Lambda functions       Lambda functions
  │                          │
  │                      DynamoDB  ◄──── single table (sagas_prod)
  │
  └─── S3 ─── profile images, blog assets
```

### Lambda Functions

| Function | Method | Route | Auth |
|---|---|---|---|
| `getUser` | GET | `/getUser` | Public |
| `getBlogs` | GET | `/getBlogs` | Public |
| `getBlogsFiltered` | GET | `/getBlogsFiltered` | Public |
| `getComments` | GET | `/getComments` | Public |
| `createBlog` | POST | `/createBlog` | JWT |
| `updateBlog` | POST | `/updateBlog` | JWT |
| `saveDraft` | POST | `/saveDraft` | JWT |
| `createComment` | POST | `/createComment` | Public |
| `likeItem` | POST | `/likeItem` | Public |
| `cors` | OPTIONS | `/{proxy+}` | Public |

---

## Project Structure

```
sagas/
├── app/                  # Next.js App Router
│   ├── page.tsx          # Main page and application state
│   ├── layout.tsx        # Root layout
│   ├── constants.ts      # API endpoints, Cognito config, S3 URLs
│   ├── types.ts          # TypeScript interfaces
│   ├── helpers/          # API call helpers and utilities
│   └── assets/           # SVG icons
├── components/           # Reusable React components
│   ├── Blog.tsx          # Blog post display, editing, and actions
│   ├── CommentModal.tsx  # Comment creation modal
│   ├── MdEditor.tsx      # Markdown editor wrapper
│   ├── Modal.tsx         # Generic modal
│   ├── SagaTag.tsx       # Tag display component
│   └── Bubble.tsx        # Bubble UI element
├── terraform/            # All AWS infrastructure (IaC)
│   ├── main.tf           # Resources: API Gateway, Lambda, DynamoDB, Cognito, IAM
│   ├── variables.tf      # Configurable variables
│   └── lambda/           # Python source for each Lambda function
└── public/               # Static assets
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Terraform](https://www.terraform.io/) (v1.x)
- An [AWS account](https://aws.amazon.com/) with credentials configured

### Frontend

```bash
npm install
npm run dev
```

### Infrastructure

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Terraform state is stored remotely in S3. You will need to update the backend configuration in `main.tf` to point to your own S3 bucket before running `terraform init`.

---

## Deployment

There is no automated CI/CD pipeline — deployments are manual:

- **Infrastructure**: `terraform apply` from the `terraform/` directory
- **Frontend**: `npm run build` then deploy the `.next/` output to your chosen host (S3 + CloudFront, Vercel, etc.)
- **Lambda**: Zip each function in `terraform/lambda/` and run `terraform apply` to update

---

## License

You are welcome to use this project for your own purposes. If you do, please update the Terraform backend, Cognito user, domain names, and any other account-specific values before deploying.
