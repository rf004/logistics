class PriorityQueue {
  constructor(comparator) {
    this.heap = [];
    // Default comparator: returns true if 'a' has higher priority than 'b'
    this.comparator = comparator || ((a, b) => a > b);
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.heap[0];
  }

  enqueue(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    const root = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._bubbleDown(0);
    }
    return root;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.comparator(this.heap[index], this.heap[parentIndex])) {
        this._swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  _bubbleDown(index) {
    const length = this.heap.length;
    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let highestIndex = index;

      if (
        leftChildIndex < length &&
        this.comparator(this.heap[leftChildIndex], this.heap[highestIndex])
      ) {
        highestIndex = leftChildIndex;
      }

      if (
        rightChildIndex < length &&
        this.comparator(this.heap[rightChildIndex], this.heap[highestIndex])
      ) {
        highestIndex = rightChildIndex;
      }

      if (highestIndex !== index) {
        this._swap(index, highestIndex);
        index = highestIndex;
      } else {
        break;
      }
    }
  }

  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

module.exports = PriorityQueue;
