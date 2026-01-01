# 🎓 EduTrack - Sistema de Gestión Académica Universitaria

> Sistema integral de gestión académica desarrollado con **Vue.js 3** y **Node.js**, implementando patrones de diseño enterprise y arquitectura limpia.

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PrimeVue](https://img.shields.io/badge/PrimeVue-4.5-41B883)](https://primevue.org/)
[![Express](https://img.shields.io/badge/Express-4.22-000000?logo=express&logoColor=white)](https://expressjs.com/)

---

## 📋 Descripción del Proyecto

**EduTrack** es una solución moderna para la gestión de historiales académicos universitarios, diseñada específicamente para instituciones educativas. El sistema permite la administración completa de notas, créditos, períodos académicos y estadísticas del rendimiento estudiantil, con una interfaz intuitiva y profesional.

### 🎯 Caso de Uso Real

Este proyecto simula un sistema académico similar al utilizado en la **Universidad Nacional Mayor de San Marcos (UNMSM)**, gestionando:
- Historial académico completo por período
- Cálculo automático de promedios ponderados
- Gestión de créditos (aprobados, pendientes, por tipo)
- Importación masiva de notas desde texto estructurado
- Validaciones académicas (notas 0-20, tipos de curso, etc.)

---

## 🏗️ Arquitectura y Patrones de Diseño

### Frontend (Vue.js 3 + TypeScript)

```
frontend/
├── src/
│   ├── core/
│   │   ├── interfaces.ts          # Contratos e interfaces TypeScript
│   │   └── di/                    # Dependency Injection Container
│   │       ├── container.ts       # Inversify Container
│   │       └── types.ts           # Type identifiers (Symbols)
│   ├── modules/
│   │   └── grades/
│   │       ├── GradesView.vue     # Componente principal (Smart Component)
│   │       ├── services/
│   │       │   └── GradeApiService.ts  # Service Layer (HTTP Client)
│   │       └── index.ts
│   └── shared/
│       └── composables/
│           └── useDependency.ts   # Composition API Hook para DI
```

**Patrones Implementados:**
- ✅ **Dependency Injection** con Inversify
- ✅ **Service Layer Pattern** para comunicación HTTP
- ✅ **Composition API** de Vue 3 para lógica reutilizable
- ✅ **Smart/Dumb Components** separation
- ✅ **TypeScript Strict Mode** para type safety

### Backend (Node.js + Express + TypeScript)

```
backend/
├── src/
│   ├── core/
│   │   └── types.ts               # DI Type identifiers
│   ├── modules/
│   │   └── grades/
│   │       ├── controllers/
│   │       │   └── GradeController.ts    # HTTP Controllers
│   │       ├── services/
│   │       │   └── GradeService.ts       # Business Logic Layer
│   │       ├── repositories/
│   │       │   ├── GradeRepository.ts    # Data Access Layer
│   │       │   └── grades.json           # Mock Database
│   │       └── domain/
│   │           └── interfaces.ts         # Domain Contracts
│   ├── server.ts                  # Express App Configuration
│   └── main.ts                    # Entry Point
└── tests/
    ├── GradeController.test.ts    # Integration Tests
    └── GradeService.test.ts       # Unit Tests
```

**Patrones Implementados:**
- ✅ **Layered Architecture** (Controllers → Services → Repositories)
- ✅ **Dependency Injection** con Inversify
- ✅ **Repository Pattern** para abstracción de datos
- ✅ **Service Layer** para lógica de negocio
- ✅ **DTO Pattern** con Zod validation
- ✅ **Unit Testing** con Jest
- ✅ **Integration Testing** con Supertest

---

## 🚀 Características Principales

### 🎨 Frontend Features

- **📊 Dashboard Interactivo**: Visualización completa del historial académico
- **📈 Estadísticas en Tiempo Real**: Promedio ponderado, créditos aprobados, progreso
- **🔍 Búsqueda Dinámica**: Filtrado por código o nombre de curso
- **📅 Agrupación por Período**: Accordion expandible para cada período académico
- **✏️ CRUD Completo**: Crear, editar y eliminar notas con validación
- **📝 Importación Masiva**: Procesamiento de texto estructurado (formato académico real)
- **📱 Responsive Design**: Optimizado para desktop, tablet y móvil
- **🎨 UI Profesional**: PrimeVue components con custom styling

### ⚙️ Backend Features

- **🔐 API RESTful**: Endpoints bien definidos y documentados
- **✅ Validación de Datos**: Zod schemas para type-safe validation
- **📊 Lógica de Negocio Compleja**: 
  - Cálculo de promedio ponderado
  - Clasificación de créditos por tipo
  - Validación de notas académicas (0-20)
- **📥 Parser Inteligente**: Procesamiento automático de texto académico
- **🧪 Testing Coverage**: Unit tests + Integration tests
- **📝 CORS Configurado**: Listo para desarrollo local
- **🔄 Hot Reload**: Desarrollo ágil con ts-node

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Vue.js** | 3.5.24 | Framework progresivo para UI |
| **TypeScript** | 5.9 | Type safety y mejor DX |
| **Vite** | 7.2 | Build tool ultrarrápido |
| **PrimeVue** | 4.5 | Component library enterprise |
| **Inversify** | 7.10 | Dependency Injection |
| **Axios** | 1.13 | HTTP Client |
| **Pinia** | 3.0 | State Management (opcional) |
| **Tailwind CSS** | (via PrimeVue) | Utility-first CSS |

### Backend
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Node.js** | 20+ | Runtime JavaScript |
| **Express** | 4.22 | Web framework minimalista |
| **TypeScript** | 5.9 | Type safety en backend |
| **Inversify** | 6.2 | Dependency Injection |
| **Inversify Express Utils** | 6.5 | Decorators para Express |
| **Zod** | 4.3 | Schema validation |
| **Jest** | 30.2 | Testing framework |
| **Supertest** | - | HTTP testing |
| **ts-node** | 10.9 | TypeScript execution |

---

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 20 o superior
- npm 9 o superior

### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/edutrack.git
cd edutrack
```

### 2. Instalar dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Ejecutar en modo desarrollo

**Terminal 1 - Backend (Puerto 3000):**
```bash
cd backend
npx ts-node src/main.ts
```

**Terminal 2 - Frontend (Puerto 5173):**
```bash
cd frontend
npm run dev
```

### 4. Acceder a la aplicación
```
Frontend: http://localhost:5173
Backend API: http://localhost:3000/api/grades
```

---

## 🧪 Ejecutar Tests

### Backend Tests
```bash
cd backend
npm test
```

**Cobertura:**
- ✅ 11 tests passing
- ✅ Integration tests (GradeController)
- ✅ Unit tests (GradeService)
- ✅ Repository pattern tests

---

## 📡 API Endpoints

### Grades Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/grades/:studentId` | Obtener historial completo del estudiante |
| `POST` | `/api/grades/:studentId` | Agregar nueva nota |
| `POST` | `/api/grades/:studentId/batch` | Importación masiva desde texto |
| `PUT` | `/api/grades/:id` | Actualizar nota existente |
| `DELETE` | `/api/grades/:id` | Eliminar nota |
| `PUT` | `/api/grades/student/:studentId` | Actualizar info del estudiante |

### Ejemplo de Request

**POST `/api/grades/22200123`**
```json
{
  "courseCode": "INO104",
  "courseName": "CÁLCULO I",
  "score": 19,
  "credits": 4,
  "academicPeriod": "2022-1",
  "cycle": 1,
  "plan": "2018",
  "type": "O",
  "section": "2",
  "recordCode": "P - 2022120120180INO1042P"
}
```

**Response 201:**
```json
{
  "id": "abc123xyz",
  "courseCode": "INO104",
  "courseName": "CÁLCULO I",
  "score": 19,
  "credits": 4,
  "academicPeriod": "2022-1",
  "cycle": 1,
  "plan": "2018",
  "type": "O",
  "section": "2",
  "recordCode": "P - 2022120120180INO1042P"
}
```

---

## 🎯 Funcionalidad de Importación Masiva

Una de las características más avanzadas es el **parser inteligente** que procesa texto con formato académico real:

### Formato de Entrada
```
Periodo Académico 2023-0
Ciclo Plan Tipo Asignatura Calif. Créd. Sec. Acta
3 2018 O 20118033 - ORGANIZACIÓN Y ADMINISTRACIÓN 19 3.0 1 P - 2023020120180201180331P
3 2018 O 20118037 - MATEMÁTICAS DISCRETAS 20 3.0 1 P - 2023020120180201180371P
```

### Procesamiento Backend
El servicio `GradeService.addGradesFromText()` realiza:
1. Extracción del período académico con regex
2. Parsing línea por línea con validación
3. Creación automática de objetos `IGrade`
4. Validación de datos (notas 0-20, créditos > 0)
5. Respuesta con estadísticas de importación

### Response
```json
{
  "success": true,
  "imported": 2,
  "failed": 0,
  "errors": [],
  "grades": [...]
}
```

---

## 🎨 Decisiones de Diseño y Arquitectura

### ¿Por qué Inversify?
**Dependency Injection** permite:
- Desacoplamiento entre capas
- Fácil testing (mock injection)
- Escalabilidad del código
- Principio SOLID (Dependency Inversion)

### ¿Por qué Repository Pattern?
- Abstracción de la fuente de datos
- Facilita cambio de JSON → Database real
- Testeable con mocks
- Separación de concerns

### ¿Por qué Layered Architecture?
```
Controller → Service → Repository
(HTTP)    → (Logic)  → (Data)
```
Cada capa tiene una responsabilidad única y clara.

### ¿Por qué TypeScript Strict?
- Type safety en compilación
- Mejor IntelliSense/autocomplete
- Refactoring seguro
- Documentación implícita

---

## 💼 Relevancia para Entrevistas

### Para **Sieweb** (Desarrollo Educativo)

✅ **Experiencia directa en sector educativo**
- Sistema académico completo (similar UNMSM)
- Gestión de notas, créditos, períodos
- Parser de formatos académicos reales

✅ **Stack requerido: Node.js + Vue.js**
- Backend robusto con Express + TypeScript
- Frontend moderno con Vue 3 Composition API
- Integración completa cliente-servidor

✅ **Arquitectura escalable**
- Modular y mantenible
- Preparado para crecimiento
- Patrones enterprise

### Para **TCS** (Frontend Developer)

✅ **Componentes modulares y escalables**
- Architecture basada en módulos
- Smart/Dumb components
- Reutilizabilidad con Composition API

✅ **Patrones MVC/MVVM**
- MVVM con Vue.js (ViewModel reactivo)
- Service Layer pattern
- Separation of concerns

✅ **Código de calidad enterprise**
- TypeScript strict mode
- Dependency Injection
- Unit testing + Integration testing
- Code review ready

✅ **Experiencia en consultoría/team lead**
- Arquitectura pensada para equipos
- Estándares de código claros
- Documentación completa
- Escalabilidad en mente

---

## 📈 Posibles Mejoras Futuras

- [ ] **Autenticación JWT** para múltiples usuarios
- [ ] **Base de datos real** (PostgreSQL/MongoDB)
- [ ] **Gráficos avanzados** con Chart.js
- [ ] **Export a PDF** del historial académico
- [ ] **Notificaciones** con WebSockets
- [ ] **Dashboard administrativo** para profesores
- [ ] **API Documentation** con Swagger/OpenAPI
- [ ] **Docker** containerization
- [ ] **CI/CD Pipeline** con GitHub Actions
- [ ] **E2E Testing** con Cypress

---

## 👨‍💻 Autor

**Jose Luis Vergara Pachas**
- 💼 Experiencia en desarrollo web Full Stack
- 🎓 Background en sistemas educativos (UNMSM)
- 🚀 Especialización en Vue.js, React, Node.js
- 💡 Enfoque en arquitectura limpia y code quality

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Contacto

Para consultas sobre el proyecto o colaboraciones:
- 📧 Email: divorcedlance@gmail.com
- 💼 LinkedIn: [Jose Luis Vergara Pachas](https://www.linkedin.com/in/jose-luis-vergara-pachas-194914259)
- 🐙 GitHub: [DivorcedLance](https://github.com/DivorcedLance)

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella ⭐**

*Desarrollado con ❤️ usando Vue.js y Node.js*

</div>
