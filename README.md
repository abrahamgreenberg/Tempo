What I'd Do for the MVP

I wouldn't even start with Express immediately.

Phase 1

React state only:

const [blocks, setBlocks] = useState(...)
const [items, setItems] = useState(...)

Get:

create block
create item
edit item
drag item

working first.

Phase 2

Introduce a repository layer.

Instead of:

setItems(...)

everywhere, create:

itemRepository.create(...)
itemRepository.update(...)
itemRepository.move(...)

Initially:

LocalStorageRepository

stores to localStorage.

Phase 3

Replace implementation:

ApiRepository

which talks to Express.

The UI doesn't change.

Phase 4

Express stores data in memory.

let items: Item[] = [];

Build routes:

GET /items
POST /items
PATCH /items/:id
DELETE /items/:id
Phase 5

Swap memory for Prisma/Postgres.

Again, the frontend doesn't change.

This layered approach is one of the biggest architectural lessons you can learn from a project like Tempo. If you separate:

UI
↓
Repository
↓
API
↓
Database

you'll be able to evolve the app from a simple React prototype all the way to an AWS-hosted application without repeatedly rewriting the frontend.
