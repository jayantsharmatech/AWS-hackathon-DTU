<div align="center">

# EcoBuild

### Construction & Demolition (C&D) Waste Marketplace

**A serverless, real-time, hyperlocal marketplace that connects construction sites, contractors and recycling buyers, and dispatches the transport to move the material.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-brightgreen?style=for-the-badge&logo=vercel&logoColor=white)](https://aws-hackathon-dtu-eight.vercel.app)
[![Architecture](https://img.shields.io/badge/Architecture-Serverless-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](#architecture)

![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-FF9900?logo=awslambda&logoColor=white)
![API Gateway](https://img.shields.io/badge/AWS-API_Gateway-FF4F8B?logo=amazonapigateway&logoColor=white)
![DynamoDB](https://img.shields.io/badge/Amazon-DynamoDB-4053D6?logo=amazondynamodb&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)

[Live Access](#live-access) · [Features](#key-features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [API](#api-reference) · [Team](#team)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Live Access](#live-access)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [AWS Services](#aws-services)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Team](#team)

---

## Overview

EcoBuild is a full-stack cloud application that connects construction sites, contractors and recycling material buyers in a real-time, hyperlocal marketplace. The platform supports sustainable urban development by optimizing the lifecycle and recycling of construction and demolition waste.

| Challenge | EcoBuild Response |
|---|---|
| Recoverable material is discarded because buyers cannot be found quickly | Real-time, hyperlocal marketplace feed |
| Logging waste manually is slow for site teams | AI classification and voice-to-text listing |
| Material pickup is hard to arrange | Integrated dumper truck booking and dispatch |
| Infrastructure carries fixed idle cost | Serverless backend with zero idle server cost |

---

## Live Access

| Resource | Location |
|---|---|
| **Frontend Application** | [aws-hackathon-dtu-eight.vercel.app](https://aws-hackathon-dtu-eight.vercel.app) |
| **API Gateway Endpoint** | `https://6jzwkohkx5.execute-api.ap-south-1.amazonaws.com` |
| **AWS Region** | `ap-south-1` (Mumbai) |

> **Evaluator access:** the demo bypasses authentication so reviewers land directly on the active marketplace feed.

---

## Key Features

| Feature | Description |
|---|---|
| **Instant Evaluator Access** | Bypasses authentication hurdles so evaluators land immediately on the active marketplace feed. |
| **AI-Driven Waste Classification** | Automatically categorizes construction waste materials: concrete, steel, brick and timber. |
| **Voice-to-Text Parsing** | Enables site managers to dictate and log waste listings hands-free. |
| **Hyperlocal Logistics Dispatch** | Integrated dumper truck booking for immediate site cleanup and material pickup. |
| **Resilient PWA Architecture** | Optimized caching headers eliminate white-screen and 404 asset errors. |

---

## Architecture

EcoBuild uses a serverless, event-driven architecture on AWS, designed for enterprise scalability, zero idle server cost and low latency.

### System Overview

```mermaid
flowchart TB
    USER(["Site Manager / Contractor / Buyer"])

    subgraph CLIENT["Client Tier"]
        PWA["React PWA<br/>Vite + Tailwind CSS"]
    end

    subgraph EDGE["Edge Delivery"]
        VERCEL["Vercel<br/>Static hosting with<br/>custom cache headers"]
    end

    subgraph AWS["AWS Cloud - ap-south-1"]
        APIGW["Amazon API Gateway<br/>Secure HTTP entry point"]
        LAMBDA["AWS Lambda<br/>Python 3.11<br/>Create / Retrieve / Delete listings"]
        DDB[("Amazon DynamoDB<br/>Listings, metadata,<br/>transaction states")]
    end

    USER --> PWA
    PWA -->|"Static assets"| VERCEL
    PWA ==>|"HTTPS / REST"| APIGW
    APIGW ==>|"Route to handler"| LAMBDA
    LAMBDA <-->|"Read / Write"| DDB

    classDef client fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
    classDef edge fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
    classDef aws fill:#FFF3E0,stroke:#EF6C00,color:#E65100
    classDef data fill:#E8EAF6,stroke:#3949AB,color:#1A237E
    class PWA client
    class VERCEL edge
    class APIGW,LAMBDA aws
    class DDB data
```

### Request Flow: Creating a Listing

```mermaid
sequenceDiagram
    autonumber
    actor SM as Site Manager
    participant UI as React PWA
    participant GW as API Gateway
    participant FN as Lambda (Python)
    participant DB as DynamoDB

    SM->>UI: Photograph waste or dictate listing
    UI->>GW: POST /listings
    GW->>FN: Invoke handler
    FN->>FN: Validate and classify waste type
    FN->>DB: Write listing record
    DB-->>FN: Acknowledged
    FN-->>GW: 201 Created
    GW-->>UI: Listing payload
    UI-->>SM: Listing visible on marketplace feed
```

### Request Flow: Marketplace Feed

```mermaid
sequenceDiagram
    autonumber
    actor B as Buyer
    participant UI as React PWA
    participant GW as API Gateway
    participant FN as Lambda (Python)
    participant DB as DynamoDB

    B->>UI: Open marketplace
    UI->>GW: GET /listings
    GW->>FN: Invoke handler
    FN->>DB: Query active listings
    DB-->>FN: Listing items
    FN-->>GW: 200 OK
    GW-->>UI: JSON response
    UI-->>B: Render live feed
```

---

## AWS Services

| Service | Role in EcoBuild |
|---|---|
| **Amazon API Gateway** | Secure HTTP entry point that routes incoming frontend requests to backend handlers. |
| **AWS Lambda** | Serverless Python functions that run core business logic, including listing creation, retrieval and deletion. |
| **Amazon DynamoDB** | High-performance NoSQL database storing user listings, metadata and transaction states with single-digit millisecond latency. |
| **Serverless Framework** | Infrastructure as Code (IaC) for rapid, repeatable provisioning and deployment of AWS resources. |

---

## Technology Stack

| Tier | Technology |
|---|---|
| **Frontend** | React.js, Vite (Progressive Web App) |
| **Styling & UI** | Tailwind CSS, Lucide React |
| **Frontend Hosting** | Vercel, with custom cache-control headers |
| **API Layer** | Amazon API Gateway |
| **Compute** | AWS Lambda (Python 3.11) |
| **Database** | Amazon DynamoDB |
| **Infrastructure as Code** | Serverless Framework (`serverless.yml`) |

---

## Project Structure

```text
AWS-hackathon-DTU/
├── src/                    # React PWA frontend code
│   ├── components/         # UI modules (Feed, Navbar, Modals)
│   ├── App.jsx             # Application root and routing state
│   └── main.jsx            # Application entry point
├── backend/                # AWS serverless backend code
│   ├── lambdas/            # Python Lambda function handlers
│   ├── serverless.yml      # AWS infrastructure configuration
│   └── requirements.txt    # Python runtime dependencies
├── public/                 # PWA assets and manifest
├── vercel.json             # Vercel deployment and caching headers
└── README.md               # Project documentation
```

---

## Getting Started

### Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 18+ and npm | Frontend tooling |
| Python 3.11 | Lambda runtime |
| AWS CLI v2 | Configured with `aws configure` |
| Serverless Framework | `npm install -g serverless` |

### Frontend Setup

```bash
# 1. Clone the repository
git clone https://github.com/jayantsharmatech/AWS-hackathon-DTU.git

# 2. Navigate to the project directory
cd AWS-hackathon-DTU

# 3. Install frontend dependencies
npm install

# 4. Run the development server
npm run dev
```

The app is served at `http://localhost:5173` by default.

### Backend Deployment

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Deploy the serverless infrastructure to AWS
serverless deploy
```

The CLI prints the deployed API Gateway endpoint on completion. To remove all provisioned resources:

```bash
serverless remove
```

---

## API Reference

**Base URL:** `https://6jzwkohkx5.execute-api.ap-south-1.amazonaws.com`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/listings` | Retrieve marketplace listings |
| `POST` | `/listings` | Create a new listing |
| `DELETE` | `/listings/{id}` | Delete a listing |

> Routes reflect the listing operations handled by the backend. The authoritative definitions live in `backend/serverless.yml` and `backend/lambdas/`.

---

## Data Model

Amazon DynamoDB stores listings, their metadata and transaction states.

```mermaid
erDiagram
    LISTING {
        string id PK
        string wasteType
        string description
        string location
        string status
        string createdAt
    }
```

| Attribute | Purpose |
|---|---|
| `id` | Unique listing identifier (partition key) |
| `wasteType` | Classified material: concrete, steel, brick or timber |
| `status` | Transaction state of the listing |

> Illustrative logical model. Align attribute names with your DynamoDB table definition.

---

## Deployment

```mermaid
flowchart LR
    DEV["Developer"] --> GH["GitHub Repository"]
    GH -->|"Frontend"| V["Vercel<br/>Build and edge deploy"]
    GH -->|"serverless deploy"| SLS["Serverless Framework"]
    SLS --> CFN["AWS CloudFormation"]
    CFN --> RES["API Gateway + Lambda<br/>+ DynamoDB"]
    V --> USERS(["End Users"])
    RES --> USERS

    classDef src fill:#ECEFF1,stroke:#455A64,color:#263238
    classDef deploy fill:#FFF3E0,stroke:#EF6C00,color:#E65100
    classDef out fill:#E8F5E9,stroke:#2E7D32,color:#1B5E20
    class DEV,GH src
    class V,SLS,CFN,RES deploy
    class USERS out
```

| Component | Target | Method |
|---|---|---|
| Frontend | Vercel | Git-integrated deploys; `vercel.json` defines caching headers |
| Backend | AWS `ap-south-1` | `serverless deploy` |

---

## Security Considerations

The public demo runs without authentication to give evaluators immediate access. Recommended controls before production use:

- Add authentication and role-based authorization (for example, Amazon Cognito)
- Apply API Gateway throttling and usage plans
- Restrict CORS to the production frontend origin
- Scope Lambda IAM roles to least privilege
- Enable DynamoDB point-in-time recovery
- Add CloudWatch alarms for error rate and latency

---

## Troubleshooting

| Symptom | Likely Cause | Resolution |
|---|---|---|
| Blank page after deploy | Stale cached assets | Hard refresh and verify `vercel.json` cache headers |
| `404` on static assets | Outdated service worker | Unregister the service worker and reload |
| CORS error in browser | Origin not allowed | Update CORS settings in `serverless.yml` and redeploy |
| `serverless deploy` fails | Invalid AWS credentials | Run `aws configure` and confirm permissions |
| API returns `500` | Lambda runtime error | Inspect the function's CloudWatch logs |

---

## Team

Developed for the **AWS / DTU Hackathon** submission by **Team Kernel_Devs**.

Maintainer: [@jayantsharmatech](https://github.com/jayantsharmatech)

<div align="center">

[Back to top](#ecobuild)

</div>
