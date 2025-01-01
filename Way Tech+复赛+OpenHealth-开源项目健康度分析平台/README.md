# <img src="https://github.com/WayTechOrg.png" width="30" alt="https://github.com/WayTechOrg.png" /> OpenHealth

Open Source Project Health Analysis Platform

## Introduction

OpenHealth is a comprehensive platform designed to analyze and evaluate the health of open source projects. By collecting and analyzing various project metrics, it helps developers understand their project's current state, identify areas for improvement, and make data-driven decisions to enhance project quality. With AI suggestions, it provides a comprehensive analysis of the project's health and potential improvements.

## Key Features

| Feature               | Description                                                                                                                           | Preview                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Project Overview      | Comprehensive dashboard showing key metrics, activity trends, and health indicators for your open source project                      | ![Project Overview](../preview/dashboard.png) |
| Health Score Analysis | Detailed breakdown of project health scores across different dimensions including community engagement, code quality, and maintenance | ![Health Score](../preview/analyzer2.png)     |
| Project Comparison    | Compare multiple projects side by side to benchmark and identify areas for improvement                                                | ![Project Comparison](../preview/compare.png) |
| Project List          | List all projects and their health scores with filtering and sorting capabilities                                                     | ![Project List](../preview/list1.png)         |
| Project Detail        | In-depth analysis of individual projects with detailed metrics and historical data                                                    | ![Project Detail](../preview/list2.png)       |

## Preview Video

https://github.com/user-attachments/assets/d05f9814-5794-44f9-9e3b-12f7596a51bc


## Technology Stack

### Frontend

- Vue.js 3 with Composition API
- Element Plus UI Framework
- Vite Build Tool
- TypeScript
- Chart.js & ECharts for data visualization

### Backend

- Nest.js framework
- MongoDB for data storage
- Redis for caching
- OpenDigger integration
- TypeScript

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (v16 or higher)
- pnpm (v8 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)
- Docker & Docker Compose (for containerized deployment)

## Development Setup

### Backend Setup

```bash
cd open-health-backend
pnpm install
pnpm run dev
```

### Frontend Setup

```bash
cd open-health-frontend
pnpm install
pnpm run dev
```

## Deployment

### Backend Deployment

#### Option 1: Using Docker Compose (Recommended)

```bash
cd open-health-backend
docker-compose up -d
```

#### Option 2: Manual Deployment

```bash
cd open-health-backend
pnpm run build
pnpm run start
```

### Frontend Deployment

```bash
cd open-health-frontend
pnpm run build
```

After building, deploy the generated `dist` directory to your web server.

### Environment Configuration

The backend requires the following environment variables:

- `ALLOWED_ORIGINS`: Allowed CORS origins
- `JWT_SECRET`: Secret key for JWT authentication
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string

## Project Structure

```
open-health/
├── open-health-frontend/     # Frontend Vue.js application
│   ├── src/
│   ├── public/
│   └── package.json
├── open-health-backend/      # Backend Nest.js application
│   ├── src/
│   ├── docker-compose.yml
│   └── package.json
└── README.md
```

## Project Design

### Backend

#### Overall System Architecture

```mermaid
graph TB
    Client[Client] --> API[API Layer]
    API --> Cache[Cache Layer/Redis]
    API --> Service[Business Logic Layer]
    Service --> DB[(MongoDB Database)]
    Service --> External[External Services/OpenDigger]
    
    subgraph Backend Infrastructure
        API
        Cache
        Service
        DB
    end
```

#### Core Module

```mermaid
graph LR
    APP[App Module] --> User[User Module]
    APP --> Analyzer[Analyzer Module]
    APP --> OpenDigger[OpenDigger Module]
    APP --> Config[Config Module]
    
    subgraph Processors
        Cache[Cache Processor]
        DB[Database Processor]
        Helper[Helper Processor]
    end
    
    APP --> Processors
```

#### Middleware & Interceptors

```mermaid
sequenceDiagram
    Client->>+API: Request
    API->>+ExceptionFilter: Exception Filter
    API->>+CacheInterceptor: Cache Interception
    API->>+JSONTransformer: JSON Transform
    API->>+ResponseInterceptor: Response Processing
    ResponseInterceptor-->>-Client: Formatted Response
```

#### Cache Architecture

```mermaid
graph TB
    subgraph Cache Architecture
        Client[Client Request] --> CacheInterceptor[Cache Interceptor]
        CacheInterceptor --> CacheCheck{Cache Exists?}
        
        CacheCheck -->|Yes| CachedResponse[Return Cached Response]
        CacheCheck -->|No| CacheModule[Cache Module]
        
        CacheModule --> RedisManager[Redis Cache Manager]
        CacheModule --> CacheService[Cache Service]
    end

    subgraph Cache Implementation
        CacheService --> Store[Store Cache]
        CacheService --> Get[Get Cache]
        CacheService --> Delete[Delete Cache]
        CacheService --> Clear[Clear Cache]
        
        Store --> Redis[(Redis)]
        Get --> Redis
        Delete --> Redis
        Clear --> Redis
    end

    subgraph Cache Configuration
        Config[Cache Config] --> |Configure| RedisManager
        Config --> Settings[Settings]
        Settings --> |TTL| CacheTTL[Cache TTL: 5s]
        Settings --> |Max Items| CacheMax[Max Items: 5]
        Settings --> |Host| RedisHost[Redis Host]
        Settings --> |Port| RedisPort[Redis Port: 6379]
    end

    subgraph Interceptors Flow
        Request[HTTP Request] 
        -->|1| HttpCache[HTTP Cache Interceptor]
        -->|2| JSONTransform[JSON Transformer]
        -->|3| Response[Response Interceptor]
        -->|4| Client
    end

    subgraph Error Handling
        Error[Error Occurs] --> ExceptionFilter[All Exceptions Filter]
        ExceptionFilter --> ErrorResponse[Error Response]
        ErrorResponse --> Client
    end
```

```mermaid
sequenceDiagram
    participant C as Client
    participant I as Cache Interceptor
    participant S as Cache Service
    participant R as Redis
    participant B as Backend Service

    C->>I: HTTP Request
    I->>S: Check Cache
    S->>R: Get Cached Data
    
    alt Cache Hit
        R-->>S: Return Cached Data
        S-->>I: Return Cache
        I-->>C: Return Response
    else Cache Miss
        R-->>S: Cache Not Found
        S-->>I: No Cache
        I->>B: Process Request
        B-->>I: Response Data
        I->>S: Store Cache
        S->>R: Save to Redis
        I-->>C: Return Response
    end
```

#### Deployment Architecture

```mermaid
graph TB
    subgraph Docker Environment
        App[Backend App<br>Node.js]
        Mongo[(MongoDB)]
        Redis[(Redis)]
    end
    
    LoadBalancer[Load Balancer] --> App
    App --> Mongo
    App --> Redis
    
    subgraph Cluster Management
        PM2[PM2 Cluster]
        Monitor[Monitoring]
    end
    
    App --> PM2
```

#### Data Flow

```mermaid
graph LR
    Input[Input] --> Validate[Data Validation]
    Validate --> Transform[Data Transform]
    Transform --> Cache[Cache Query]
    Cache --> Business[Business Logic]
    Business --> Response[Response Packaging]
    
    subgraph Data Pipeline
        Validate
        Transform
        Cache
        Business
        Response
    end
```

#### Full Architecture

```mermaid
graph TB
    Client[Client Request] --> Gateway[API Gateway]
    
    subgraph Core Analysis Engine
        Gateway --> Auth[Authentication]
        Auth --> DataCollector[Data Collector]
        
        DataCollector -->|Raw Data| RawData[Data Preprocessing]
        RawData --> |Cleaned Data| Analysis[Analysis Processing]
        
        subgraph Analysis Modules
            Analysis --> CodeQuality[Code Quality Analysis]
            Analysis --> Community[Community Activity Analysis]
            Analysis --> Security[Security Analysis]
            Analysis --> Performance[Performance Analysis]
            
            CodeQuality --> |Metric Calculation| Metrics[Metrics]
            Community --> |Activity Assessment| Metrics
            Security --> |Vulnerability Scan| Metrics
            Performance --> |Performance Evaluation| Metrics
        end
        
        Metrics --> ScoreEngine[Score Engine]
        ScoreEngine --> AIEngine[AI Suggestion Engine]
        
        subgraph Data Storage Layer
            Cache[(Redis Cache)]
            DB[(MongoDB)]
            TimeSeries[(Time Series DB)]
        end
        
        DataCollector --> Cache
        RawData --> DB
        Analysis --> TimeSeries
        
        subgraph External Integration
            OpenDigger[OpenDigger API]
            GitHub[GitHub API]
            GitLab[GitLab API]
        end
        
        DataCollector --> OpenDigger
        DataCollector --> GitHub
        DataCollector --> GitLab
    end
    
    subgraph Output Results
        AIEngine --> Report[Analysis Report]
        AIEngine --> Alert[Alert Notification]
        AIEngine --> Suggestion[Optimization Suggestions]
        
        Report --> ResponseHandler[Response Handler]
        Alert --> ResponseHandler
        Suggestion --> ResponseHandler
    end
    
    ResponseHandler --> |Formatted Response| Client
    
    subgraph Monitoring System
        Monitor[System Monitor]
        Logger[Logging System]
        Metrics[Metrics Collection]
    end
    
    Gateway --> Monitor
    Gateway --> Logger
    Analysis --> Metrics
```

### Frontend

#### High-Level Architecture

```mermaid
graph TB
    subgraph Frontend_Architecture
        UI[UI Layer - Vue 3]
        Router[Vue Router]
        State[Local Storage State]
        API[API Layer - Axios]
        Components[Components Layer]
        Utils[Utilities]
    end

    UI --> Router
    UI --> Components
    Components --> State
    Components --> API
    Components --> Utils
    Router --> API
```

#### Core Components Structure

```mermaid
graph TB
    subgraph Components
        AppFooter[AppFooter]
        MainLayout[MainLayout]
        
        subgraph Pages
            Analysis[ProjectAnalysis]
            Compare[ProjectCompare]
            List[ProjectList]
            Dashboard[Dashboard]
            Login[Login]
            Register[Register]
            Settings[Settings]
            About[About]
            Terms[Terms]
            Privacy[Privacy]
        end
        
        subgraph UI_Components
            Charts[Charts]
            Forms[Forms]
            Tables[Tables]
            Cards[Cards]
        end
    end

    MainLayout --> Pages
    MainLayout --> AppFooter
    Pages --> UI_Components
```

#### Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Components
    participant Router
    participant LocalStorage
    participant API
    participant Backend

    User->>Components: Interact with UI
    Components->>Router: Route Change
    Components->>LocalStorage: Store/Retrieve Data
    Components->>API: Make API Request
    API->>Backend: HTTP Request
    Backend->>API: Response
    API->>Components: Update UI
    Components->>LocalStorage: Update Local State
```

#### Feature Implementation

```mermaid
graph LR
    subgraph Core_Features
        Auth[Authentication]
        Analysis[Project Analysis]
        Compare[Project Comparison]
        Dashboard[Dashboard Analytics]
        Settings[System Settings]
    end

    subgraph Implementation_Details
        Vue[Vue 3 + TypeScript]
        ElementPlus[Element Plus UI]
        Charts[ECharts + ChartJS]
        Router[Vue Router]
        Axios[Axios HTTP Client]
    end

    Auth --> Vue
    Analysis --> Vue
    Compare --> Vue
    Dashboard --> Vue
    Settings --> Vue

    Vue --> ElementPlus
    Vue --> Charts
    Vue --> Router
    Vue --> Axios
```

#### Theme System

```mermaid
graph TB
    subgraph Theme_System
        ColorMode[Color Mode]
        Variables[CSS Variables]
        ElementTheme[Element Plus Theme]
    end

    subgraph Implementations
        Light[Light Theme]
        Dark[Dark Theme]
        Custom[Custom Variables]
    end

    ColorMode --> Light
    ColorMode --> Dark
    Variables --> Custom
    ElementTheme --> Light
    ElementTheme --> Dark
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

OpenHealth © <img src="https://github.com/WayTechOrg.png" width="20" alt="https://github.com/WayTechOrg.png" /> Way Tech, Released under MIT.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.
