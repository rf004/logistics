/**
 * Graph utility class for building and representing adjacency lists
 */
class Graph {
  constructor() {
    this.adjacencyList = {};
  }

  /**
   * Add a node to the graph if it doesn't already exist
   * @param {string} node
   */
  addNode(node) {
    if (!this.adjacencyList[node]) {
      this.adjacencyList[node] = [];
    }
  }

  /**
   * Add a directed edge from source to destination
   * @param {string} from
   * @param {string} to
   * @param {number} distance
   * @param {string} roadId
   * @param {Object} [extraData]
   */
  addEdge(from, to, distance, roadId, extraData = {}) {
    if (distance === undefined || distance === null || typeof distance !== 'number' || distance <= 0 || isNaN(distance)) {
      return;
    }
    this.addNode(from);
    this.addNode(to);

    // Prevent duplicate exact edges
    const existingEdge = this.adjacencyList[from].find(
      (edge) => edge.to === to && edge.roadId === roadId
    );

    if (!existingEdge) {
      this.adjacencyList[from].push({
        to,
        distance,
        roadId,
        ...extraData
      });
    }
  }

  /**
   * Get formatted adjacency list
   * @returns {Object}
   */
  getAdjacencyList() {
    return this.adjacencyList;
  }
}

module.exports = Graph;
