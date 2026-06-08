# Tempo Rewrite Roadmap

## Vision

Tempo is a personal timetable and day-planning application.

The goal of the rewrite is to rebuild the application using a modern TypeScript-first stack while following a scalable architecture that can evolve from:

```text
Local React State
    ↓
Local Storage
    ↓
Express API
    ↓
PostgreSQL
    ↓
AWS Deployment
```

The project serves two purposes:

1. Build a genuinely useful productivity application.
2. Learn modern frontend, backend, database, and cloud technologies through one cohesive project.

---

# Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Base UI
- React Hook Form
- Zod
- Zustand

## Drag & Drop

- dnd-kit

## Utilities

- CUID2 for identifiers
- clsx
- tailwind-merge

## Planned Backend

- Express.js
- TypeScript

## Planned Database

- PostgreSQL
- Prisma

## Planned Cloud Infrastructure

- AWS Cognito (authentication)
- AWS RDS (PostgreSQL)
- AWS S3 + CloudFront (frontend hosting)
- AWS EC2 or ECS (backend hosting)

---

# Architecture

The application should maintain a clean separation between UI, data access, and persistence.

```text
UI
↓
Repository
↓
API
↓
Database
```

The frontend should never care where data comes from.

Examples:

```ts
itemRepository.create(...)
itemRepository.update(...)
itemRepository.move(...)
```

Today these methods may write to local state.

Later they may write to localStorage.

Eventually they may call an Express API.

The UI remains unchanged.

---

# Data Model

Current model:

```text
Day
 └── Time Block
       └── Item
```

Example:

```text
Monday

Morning
├── Run (45m)
├── Breakfast (30m)

Work
├── Deep Work (120m)
├── Email (30m)
```

Proposed entities:

```ts
Day
{
  id: string
  name: string
}
```

```ts
List (TimeBlock)
{
  id: string
  dayId: string

  name: string

  startTime: number
  endTime: number

  position: number
}
```

```ts
Item
{
  id: string
  blockId: string

  name: string

  durationMinutes: number

  position: number
}
```

---

# Current Status

## Phase 1: React MVP

### Completed

- React + TypeScript setup
- Modern project structure
- Tailwind setup
- Component architecture
- Drag-and-drop foundation
- Sortable item ordering
- CUID2 integration
- Core UI direction

### In Progress

Timeline-specific scheduling logic.

The current drag-and-drop system works mechanically, but scheduling constraints still need to be implemented.

Examples:

- Prevent block overflow
- Prevent impossible schedules
- Detect time conflicts
- Visual feedback during drag
- Correct rendering of long-duration items

---

# Immediate Tasks

## 1. List Management

- Currently lists need to be managed correctly and sorted by order, which should be managed in the program. there should also be limitations to make sure that there are no timeslot overlaps

## 2. Better forms

- I would like to have better forms to manage timeslots and items, with sliders and more visual info

## 3. Project Architecture

- I would like to remove the current icon library in place for a different one

---

## 4. Final Render View

- We still need to implement the final render of the project once the user has built their plan for the day

---

# Future Roadmap

## Phase 2: Repository Layer

Introduce:

```ts
itemRepository.create()
itemRepository.update()
itemRepository.delete()
itemRepository.move()
```

Initial implementation:

```text
LocalStorageRepository
```

Persistence survives page refreshes.

---

## Phase 3: API Layer

Introduce Express backend.

Routes:

```http
GET    /items
POST   /items
PATCH  /items/:id
DELETE /items/:id
```

Backend initially stores data in memory.

---

## Phase 4: Database

Replace memory storage with:

- PostgreSQL
- Prisma

No frontend changes should be required.

---

## Phase 5: Authentication

Add:

- User accounts
- Login
- Schedule ownership

Likely using AWS Cognito.

---

## Phase 6: AWS Deployment

Frontend:

- S3
- CloudFront

Backend:

- EC2 or ECS

Database:

- RDS PostgreSQL

---

## Phase 7:

Multi day managment:
The program is going to be built about manging the timetable for a given day, eventually users should be able to manager multiple days from within the timetable generator

---

# Guiding Principle

Tempo should prioritize:

1. Simplicity
2. Correctness
3. Incremental improvement

Avoid building infrastructure before it is needed.

Every phase should leave the application in a working, deployable state.
