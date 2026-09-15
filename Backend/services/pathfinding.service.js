const PriorityQueue = require('../utils/priorityQueue');

class PathfindingService {
  /**
   * Find shortest path in graph from source node to destination node using Dijkstra's Algorithm
   * @param {Object} graph - Adjacency list object: { [node]: [ { to, distance, roadId }, ... ] }
   * @param {string} source - Source node identifier
   * @param {string} destination - Destination node identifier
   * @returns {Object} Shortest path result
   */
  findShortestPath(graph, source, destination) {
    if (!source || !destination) {
      return {
        reachable: false,
        reason: 'INVALID_SOURCE_OR_DESTINATION'
      };
    }

    if (!graph || typeof graph !== 'object') {
      return {
        reachable: false,
        reason: 'INVALID_GRAPH'
      };
    }

    // Handle same source and destination
    if (source === destination) {
      return {
        reachable: true,
        source,
        destination,
        distance: 0,
        nodes: [source],
        roads: [],
        algorithm: 'DIJKSTRA'
      };
    }

    const allNodes = Object.keys(graph);
    if (!allNodes.includes(source)) {
      return {
        reachable: false,
        source,
        destination,
        distance: null,
        nodes: [],
        roads: [],
        reason: 'SOURCE_NOT_FOUND'
      };
    }

    if (!allNodes.includes(destination)) {
      return {
        reachable: false,
        source,
        destination,
        distance: null,
        nodes: [],
        roads: [],
        reason: 'DESTINATION_NOT_FOUND'
      };
    }

    const distances = {};
    const previous = {};
    const previousRoad = {};

    // Initialize distances: source = 0, others = Infinity
    for (const node of allNodes) {
      distances[node] = Infinity;
      previous[node] = null;
      previousRoad[node] = null;
    }
    distances[source] = 0;

    // Min Priority Queue: entry with smaller distance comes out first
    const pq = new PriorityQueue((a, b) => a.distance < b.distance);
    pq.enqueue({ node: source, distance: 0 });

    while (!pq.isEmpty()) {
      const { node: u, distance: currentDist } = pq.dequeue();

      // Early termination if destination reached
      if (u === destination) {
        break;
      }

      // Skip outdated entries
      if (currentDist > distances[u]) {
        continue;
      }

      const neighbors = graph[u] || [];
      for (const edge of neighbors) {
        // Defensive check for invalid / negative edge distances
        if (
          edge.distance === undefined ||
          edge.distance === null ||
          typeof edge.distance !== 'number' ||
          edge.distance < 0 ||
          isNaN(edge.distance)
        ) {
          continue;
        }

        const alt = distances[u] + edge.distance;
        const v = edge.to;

        if (alt < (distances[v] !== undefined ? distances[v] : Infinity)) {
          distances[v] = alt;
          previous[v] = u;
          previousRoad[v] = edge.roadId;
          pq.enqueue({ node: v, distance: alt });
        }
      }
    }

    if (distances[destination] === Infinity) {
      return {
        reachable: false,
        source,
        destination,
        distance: null,
        nodes: [],
        roads: []
      };
    }

    // Reconstruct path
    const pathNodes = [];
    const pathRoads = [];
    let curr = destination;

    while (curr) {
      pathNodes.unshift(curr);
      if (previousRoad[curr]) {
        pathRoads.unshift(previousRoad[curr]);
      }
      curr = previous[curr];
    }

    return {
      reachable: true,
      source,
      destination,
      distance: Math.round(distances[destination] * 100) / 100,
      nodes: pathNodes,
      roads: pathRoads,
      algorithm: 'DIJKSTRA'
    };
  }
}

module.exports = new PathfindingService();
