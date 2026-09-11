# logistics
# Logistics Optimization System

A system for optimizing the transportation of agricultural produce from farms to warehouses.

The system processes farms based on **produce urgency and shelf life**, determines suitable storage, assigns feasible trucks based on capacity and compatibility, filters roads according to truck constraints, constructs a truck-specific road graph, finds shortest paths using **Dijkstra's algorithm**, and generates optimized multi-farm pickup routes.

---

## 📌 Problem Statement

Agricultural produce is often perishable, which makes transportation planning time-sensitive.

A logistics system needs to answer questions such as:

* Which farm should be served first?
* How urgent is the produce?
* Which warehouse can accommodate the produce?
* Which truck has enough remaining capacity?
* Can the truck physically use the available roads?
* What is the shortest route between farms?
* In what order should a truck visit multiple farms?
* Can all assigned farms be served before reaching the warehouse?
* How should the resulting transportation plan be tracked?

This project addresses these problems through a modular backend architecture and algorithmic processing pipeline.

---

# 🎯 Key Features

### 🌾 Farm Management

The system stores information about agricultural farms, including:

* Product name
* Product type
* Quantity
* Harvest time
* Shelf life
* Location

Farm data is used by the processing engine to calculate urgency and determine transportation requirements.

---

### ⏱️ Produce Urgency Calculation

The system calculates how urgently a farm's produce needs to be transported.

Urgency is calculated using:

* Harvest time
* Shelf life
* Remaining shelf life
* Remaining shelf-life percentage

The urgency score is calculated approximately as:

```text
Urgency Score = 100 - Remaining Shelf Life Percentage
```

The score is clamped between `0` and `100`.

Urgency levels are classified as:

```text
Remaining Shelf Life <= 20%  → CRITICAL
Remaining Shelf Life <= 40%  → HIGH
Remaining Shelf Life <= 70%  → MEDIUM
Remaining Shelf Life > 70%   → LOW
```

Expired produce receives:

```text
Urgency Score = 100
Urgency Level = CRITICAL
```

This allows highly perishable produce to receive higher priority during transportation planning.

---

# 🚚 Truck Assignment

Available trucks are initialized into temporary in-memory states.

For every truck, the system keeps track of:

```text
Capacity
Initial Load
Assigned Load
Remaining Capacity
Assigned Farms
```

A farm can only be assigned to a truck when:

```text
Farm Quantity <= Remaining Truck Capacity
```

The system also supports compatibility checks such as refrigerated transportation.

For example:

```text
Farm requires refrigeration
        ↓
Does truck support refrigeration?
        ↓
      YES → Feasible
      NO  → Reject
```

When multiple trucks are feasible, the system selects the truck that leaves the **smallest remaining capacity after assignment**.

This is essentially a best-fit style heuristic:

```text
remaining capacity after assignment
                ↓
        choose minimum
```

The objective is to reduce unused truck capacity while still satisfying the farm's transportation requirements.

---

# 🏭 Warehouse Selection

Before assigning transportation, the system checks whether a suitable warehouse can accommodate the farm's produce.

The process engine first determines storage feasibility.

```text
Farm
 ↓
Find suitable warehouses
 ↓
Can warehouse fully accommodate produce?
 ↓
YES → Continue transportation planning
NO  → Mark storage unavailable
```

If no suitable warehouse is available, the farm is not assigned a truck for the current processing cycle.

---

# 🛣️ Road Feasibility

Not every truck can necessarily use every road.

The system filters roads according to multiple constraints.

### Road availability

A road can be rejected if:

* It is inactive
* It is closed
* It is blocked
* Vehicles are not allowed

### Weight compatibility

The system compares:

```text
Truck Maximum Weight
        vs
Road Maximum Weight
```

If:

```text
Truck Weight > Road Maximum Weight
```

the road is considered infeasible.

### Width compatibility

Similarly:

```text
Truck Width <= Road Maximum Width
```

must hold when both values are available.

### Height compatibility

The same check is performed for vehicle height.

Therefore:

```text
Truck
  │
  ├── Weight compatible?
  ├── Width compatible?
  ├── Height compatible?
  └── Road active?
          │
          ▼
      Feasible Road
```

Only feasible roads are included in the truck's road graph.

---

# 🕸️ Graph Representation

After filtering roads, the system converts the feasible road network into a graph.

The graph uses an adjacency-list representation:

```text
Node A
 ├── Node B (distance = 10)
 └── Node C (distance = 15)

Node B
 └── Node D (distance = 8)

Node C
 └── Node D (distance = 5)
```

Each edge contains:

```text
Destination
Distance
Road ID
```

For bidirectional roads, edges are added in both directions.

```text
A ───────→ B
A ←─────── B
```

For one-way roads, only the forward edge is added.

The project implements this graph through a dedicated graph utility and builds a **truck-specific graph** containing only roads that the particular truck can use.

---

# 📍 Shortest Path Finding — Dijkstra's Algorithm

Once the truck-specific graph has been constructed, the system uses **Dijkstra's algorithm** to find the shortest path between two nodes.

For example:

```text
        10
   A ─────── B
   │         │
 15│         │8
   │         │
   C ─────── D
        5
```

To find the shortest path from `A` to `D`, Dijkstra evaluates the available paths and chooses the minimum-distance route.

The implementation maintains:

```text
distance[node]
previous[node]
previousRoad[node]
```

It uses a **min-priority queue** to process the node with the smallest known distance first.

The algorithm also:

* Rejects invalid/negative edge distances
* Handles unreachable destinations
* Stops early when the destination is reached
* Reconstructs the final path
* Returns the road IDs and graph nodes forming the route

The returned result contains information such as:

```json
{
  "reachable": true,
  "distance": 23,
  "nodes": ["A", "B", "D"],
  "roads": ["road1", "road4"],
  "algorithm": "DIJKSTRA"
}
```

---

# 🧠 Route Optimization

Finding the shortest path between two locations is not enough when a truck has to collect produce from multiple farms.

The project therefore implements a multi-farm pickup optimization strategy.

The route optimizer considers:

1. Truck capacity
2. Farm urgency
3. Road reachability
4. Shortest-path distance

The general process is:

```text
Truck
  │
  ▼
Assigned Farms
  │
  ▼
Check Capacity
  │
  ▼
Check Reachability
  │
  ▼
Find Highest Urgency
  │
  ▼
Use Shortest Distance as Tie Breaker
  │
  ▼
Pick Farm
  │
  ▼
Repeat
```

---

## 🔥 Urgency + Distance Optimization

The route optimizer does **not simply choose the geographically closest farm**.

Instead, it first determines the highest urgency among currently feasible farms.

If two farms have similar urgency scores, distance is used as the tie-breaker.

Conceptually:

```text
Highest urgency
       ↓
Are multiple farms close in urgency?
       ↓
YES
       ↓
Choose shortest Dijkstra distance
```

The project uses an `URGENCY_TIE_THRESHOLD` to define when two urgency scores are considered close enough to compete based on distance.

This prevents the system from choosing a slightly closer farm when another farm is significantly more urgent.

---

# 📦 Capacity-Aware Route Planning

The optimizer continuously tracks the truck's current load.

For every candidate farm:

```text
current load + farm quantity <= truck capacity
```

must be true.

If the farm cannot fit, it is skipped.

This prevents the generated route from exceeding the truck's physical capacity.

Example:

```text
Truck Capacity = 1000 kg

Current Load = 700 kg

Farm A = 200 kg  → FEASIBLE
Farm B = 400 kg  → NOT FEASIBLE
Farm C = 100 kg  → FEASIBLE
```

The optimizer only considers feasible candidates.

---

# 🗺️ Multi-Farm Route Example

Suppose a truck starts at a depot and has three assigned farms:

```text
             Farm A
               │
               │
Depot ───── Farm B ───── Warehouse
               │
             Farm C
```

Each farm has:

```text
Quantity
Urgency Score
Location
```

The optimizer repeatedly:

1. Checks which farms fit the remaining capacity.
2. Checks whether each farm is reachable.
3. Calculates shortest-path distance using Dijkstra.
4. Finds the highest urgency.
5. Uses distance to break urgency ties.
6. Selects the next farm.
7. Updates truck load.
8. Removes the selected farm from the candidate list.
9. Repeats until no more farms can be served.

Finally, the truck must travel from its current location to the warehouse.

Therefore the resulting route looks like:

```text
Depot
  ↓
Farm 1
  ↓
Farm 2
  ↓
Farm 3
  ↓
Warehouse
```

The system stores every route leg along with:

```text
Starting node
Destination node
Distance
Road IDs
Nodes
```

---

# ⚙️ Complete Processing Pipeline

The central `ProcessEngineService` combines all of these components into a single processing pipeline.

The complete workflow is:

```text
                    ┌──────────────┐
                    │     Farms    │
                    └──────┬───────┘
                           │
                           ▼
                  Calculate Urgency
                           │
                           ▼
                  Priority Queue
                           │
                           ▼
              ┌──────────────────────┐
              │ Warehouse Feasibility│
              └──────────┬───────────┘
                         │
                         ▼
                 Truck Assignment
                         │
                         ▼
                Road Feasibility
                         │
                         ▼
                Build Truck Graph
                         │
                         ▼
                 Dijkstra Paths
                         │
                         ▼
                Route Optimization
                         │
                         ▼
              Validate Complete Route
                         │
                         ▼
              Create Transport Plan
                         │
                         ▼
                     MongoDB
```

The process engine loads farms, warehouses, trucks, and roads, prioritizes farms using urgency, performs storage and truck assignment, builds truck-specific road graphs, optimizes routes, and persists valid transport plans.

---

# 🥇 Farm Prioritization

Farms are placed into a custom **Priority Queue**.

Priority is determined using:

### Priority 1 — Urgency Score

Higher urgency gets higher priority.

```text
90 > 70 > 40 > 10
```

### Priority 2 — Quantity

If urgency is equal:

```text
larger quantity → higher priority
```

### Priority 3 — Harvest Time

If urgency and quantity are equal:

```text
earlier harvest time → higher priority
```

So the comparison becomes:

```text
Urgency Score DESC
        ↓
Quantity DESC
        ↓
Harvest Time ASC
```

This allows the system to process the most time-sensitive produce first.

---

# 💾 Transport Plan Creation

Once the route optimizer generates a complete and valid route, the system creates a persistent transport plan.

A transport plan contains:

```text
Truck
Warehouse
Farms
Pickup Order
Quantity
Urgency
Route
Total Distance
Total Load
Status
```

For example:

```json
{
  "truckId": "...",
  "warehouseId": "...",
  "farms": [
    {
      "farmId": "...",
      "pickupOrder": 1,
      "quantity": 250,
      "urgency": 82
    }
  ],
  "route": {
    "startNode": "Depot",
    "pickupSequence": ["FarmA", "FarmB"],
    "warehouseNode": "Warehouse",
    "totalDistance": 42.5
  },
  "totalLoad": 700,
  "status": "PLANNED"
}
```

Before persisting the plan, the service validates:

* Truck ID

* Warehouse ID

* Truck existence

* Warehouse existence

* Farm IDs

* Duplicate farms

* Duplicate pickup orders

* Positive total load

* Truck capacity

* Route completeness

---

# 🔄 Transport Plan Status

Transport plans follow a controlled state machine.

```text
PLANNED
   │
   ├──────────────→ CANCELLED
   │
   ▼
IN_PROGRESS
   │
   ├──────────────→ CANCELLED
   │
   ▼
COMPLETED
```

Invalid transitions are rejected.

For example:

```text
COMPLETED → IN_PROGRESS
```

is not allowed.

Similarly:

```text
CANCELLED → PLANNED
```

is not allowed.

This ensures that transport-plan lifecycle states remain consistent.

---

# 🏗️ Backend Architecture

The project follows a layered backend architecture.

```text
Client
  │
  ▼
Routes
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ▼
Repositories
  │
  ▼
Mongoose Models
  │
  ▼
MongoDB
```

### Routes

Responsible for defining API endpoints.

```text
/routes
```

### Controllers

Handle HTTP requests and responses.

```text
/controllers
```

### Services

Contain the application's business logic and optimization algorithms.

```text
/services
```

Examples include:

```text
processEngine.service.js
urgency.service.js
truckAssignment.service.js
roadFeasibility.service.js
routeOptimization.service.js
pathfinding.service.js
transportPlan.service.js
```

### Repositories

Handle database-access operations.

```text
/repositories
```

### Models

Define MongoDB/Mongoose schemas.

```text
/models
```

### Middleware

Provides validation and centralized error handling.

```text
/middlewares
```

### Utilities

Contains reusable components such as:

```text
Priority Queue
Graph
API Response
API Error
Async Handler
```

---

# 📁 Project Structure

```text
Agriculture-Logistics/
│
├── Backend/
│   │
│   ├── config/
│   │   ├── constants.js
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── farm.controller.js
│   │   ├── processEngine.controller.js
│   │   ├── road.controller.js
│   │   ├── transportPlan.controller.js
│   │   ├── truck.controller.js
│   │   ├── urgency.controller.js
│   │   └── warehouse.controller.js
│   │
│   ├── middlewares/
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── models/
│   │   ├── farm.model.js
│   │   ├── road.model.js
│   │   ├── transportPlan.model.js
│   │   ├── truck.model.js
│   │   └── warehouse.model.js
│   │
│   ├── repositories/
│   │   ├── farm.repository.js
│   │   ├── road.repository.js
│   │   ├── transportPlan.repository.js
│   │   ├── truck.repository.js
│   │   └── warehouse.repository.js
│   │
│   ├── routes/
│   │   ├── farm.routes.js
│   │   ├── health.routes.js
│   │   ├── processEngine.routes.js
│   │   ├── road.routes.js
│   │   ├── transportPlan.routes.js
│   │   ├── truck.routes.js
│   │   ├── urgency.routes.js
│   │   └── warehouse.routes.js
│   │
│   ├── services/
│   │   ├── processEngine.service.js
│   │   ├── urgency.service.js
│   │   ├── truckAssignment.service.js
│   │   ├── roadFeasibility.service.js
│   │   ├── routeOptimization.service.js
│   │   ├── pathfinding.service.js
│   │   └── transportPlan.service.js
│   │
│   ├── utils/
│   │   ├── graph.js
│   │   ├── priorityQueue.js
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── asyncHandler.js
│   │
│   ├── validators/
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

# 🛠️ Technology Stack

## Backend

* **Node.js** — JavaScript runtime
* **Express.js** — REST API framework
* **MongoDB** — NoSQL database
* **Mongoose** — MongoDB ODM

## Development & Utilities

* **dotenv** — Environment variable management
* **CORS** — Cross-origin resource sharing
* **Nodemon** — Development server auto-restart

The project's `package.json` defines Express 4, Mongoose 8, dotenv, CORS and Nodemon as its primary dependencies.

---

# 🧮 Algorithms & Data Structures

This project is not purely CRUD-based. It uses several algorithmic concepts.

| Concept                | Usage                                       |
| ---------------------- | ------------------------------------------- |
| Priority Queue         | Farm prioritization and Dijkstra processing |
| Greedy Algorithm       | Multi-farm pickup selection                 |
| Dijkstra's Algorithm   | Shortest-path calculation                   |
| Graph / Adjacency List | Road network representation                 |
| Hash Map / Map         | Fast farm, warehouse and urgency lookup     |
| Set                    | Duplicate farm/order detection              |
| State Machine          | Transport-plan status transitions           |
| Best-Fit Heuristic     | Truck selection                             |

---

# 🔌 API Endpoints

The backend exposes the following API groups:

```text
/api/health
/api/farms
/api/trucks
/api/warehouses
/api/roads
/api/urgency
/api/process
/api/transport-plans
```

These route groups are registered by the main Express application.

### Transport Plans

```http
POST /api/transport-plans
GET /api/transport-plans
GET /api/transport-plans/:id
PATCH /api/transport-plans/:id/status
```

The list endpoint also supports filtering by:

```text
status
truckId
warehouseId
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/Aditya2584/Agriculture-Logistics.git
```

```bash
cd Agriculture-Logistics
```

---

## 2. Enter the backend directory

```bash
cd Backend
```

---

## 3. Install dependencies

```bash
npm install
```

---

## 4. Configure environment variables

Create a `.env` file:

```bash
cp .env.example .env
```

Configure MongoDB:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

The database connection uses the `MONGODB_URI` environment variable.

---

## 5. Start development server

```bash
npm run dev
```

Or run normally:

```bash
npm start
```

The backend defaults to port `5000` if no `PORT` environment variable is provided.

---

# 🔬 Example Processing Flow

Consider the following scenario:

```text
Farm A
Quantity: 300 kg
Urgency: 90

Farm B
Quantity: 200 kg
Urgency: 70

Farm C
Quantity: 150 kg
Urgency: 88
```

Available truck:

```text
Capacity: 600 kg
Current Load: 0 kg
```

The process engine first prioritizes the farms:

```text
Farm A → Urgency 90
Farm C → Urgency 88
Farm B → Urgency 70
```

The system then evaluates storage and truck feasibility.

The truck can carry:

```text
300 + 150 + 200 = 650 kg
```

which exceeds its capacity.

Therefore, all three cannot be served by the same truck.

The route optimizer considers the remaining capacity and chooses a feasible subset.

For the selected farms, it then calculates shortest paths:

```text
Depot
  ↓
Farm A
  ↓
Farm C
  ↓
Warehouse
```

Finally, if every assigned farm can be served and the warehouse is reachable, the system creates a persistent transport plan.

---

# ⚠️ Failure Handling

The system handles several failure scenarios.

### No farms

```text
processedFarms = 0
```

### No suitable warehouse

```text
STORAGE_NOT_AVAILABLE
```

### No feasible truck

```text
NO_FEASIBLE_TRUCK
```

### Farm cannot be reached

```text
UNREACHABLE
```

### Truck capacity exceeded

```text
CAPACITY_EXCEEDED
```

### Incomplete route

A transport plan is not persisted if the warehouse cannot be reached or farms remain unserved.

The transport-plan service also validates the final plan before saving it to MongoDB.

---

# 📈 Design Decisions

### Why Dijkstra?

Road distances are represented as non-negative edge weights, making Dijkstra suitable for finding shortest paths.

### Why a Priority Queue?

The system needs to repeatedly extract the highest-priority farm and Dijkstra also benefits from a minimum-priority queue.

### Why a Graph?

Roads naturally form a graph:

```text
Locations → Nodes
Roads → Edges
Distance → Edge Weight
```

### Why a Greedy approach for pickup ordering?

The route optimizer must balance urgency, capacity and travel distance. A greedy strategy provides a practical route-selection heuristic without solving a much more computationally expensive global vehicle-routing problem.

> **Important:** this implementation should not be described as guaranteeing a globally optimal solution to the Vehicle Routing Problem (VRP). It uses a heuristic approach for multi-farm route selection with Dijkstra shortest paths.

---

# 🔐 Data Validation

The backend performs validation at multiple levels.

Examples include:

* MongoDB ObjectId validation
* Required-field validation
* Positive quantity validation
* Positive shelf-life validation
* Truck-capacity validation
* Duplicate farm detection
* Duplicate pickup-order detection
* Route completeness validation
* Transport-plan status validation

This prevents invalid logistics plans from being persisted.

---

# 📊 System Architecture

```text
                        CLIENT
                          │
                          ▼
                    EXPRESS SERVER
                          │
             ┌────────────┴────────────┐
             │                         │
           ROUTES                   MIDDLEWARE
             │                         │
             ▼                         │
        CONTROLLERS ◄──────────────────┘
             │
             ▼
          SERVICES
             │
      ┌──────┼───────────────────────────┐
      │      │          │        │       │
      ▼      ▼          ▼        ▼       ▼
   Urgency  Storage   Truck    Road   Route
   Service  Service   Assign  Graph   Optimizer
                                  │
                                  ▼
                               Dijkstra
                                  │
                                  ▼
                         Transport Plan
                                  │
                                  ▼
                           Repositories
                                  │
                                  ▼
                              Mongoose
                                  │
                                  ▼
                              MongoDB
```

---

# 🔮 Future Improvements

Possible future improvements include:

* Real-time truck tracking
* GPS integration
* Map visualization
* Weather-aware route planning
* Traffic-aware routing
* Time-window constraints
* Multiple warehouse optimization
* Vehicle Routing Problem (VRP) solvers
* Authentication and role-based access control
* Redis caching
* Background job processing
* API documentation using Swagger/OpenAPI
* Automated unit and integration tests
* Docker deployment
* CI/CD pipeline
* Monitoring and logging

---

# 👨‍💻 Author

**Aditya**

GitHub: https://github.com/Aditya2584

---

# 📄 License

This project is developed for educational and development purposes.
