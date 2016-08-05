const ClickNode = function(element) {
  this.element = element;
  this.clickCount = 1;
};

const ClickHistoryQueue = function(duration) {
  this.elementsMap = new WeakMap || {};
  this.recentClickCount = 0;
  this.duration = duration;
  this.idCounter = 1;
};

ClickHistoryQueue.prototype.elementClicked = function (element) {
  this.recentClickCount += 1;

  setTimeout(() => {
    this.recentClickCount -= 1;
  }, this.duration);

  if (this.elementsMap[element._uniqueId]) {
    this.updateElement(element._uniqueId);
  } else {
    element._uniqueId = this.idCounter++;
    this.addElement(element);
  }
};

ClickHistoryQueue.prototype.updateElement = function (elementId) {
  const clickNode = this.elementsMap[elementId];
  clickNode.clickCount += 1;

  if (!clickNode.next) {
    return;
  }

  if (clickNode.prev) {
    clickNode.prev.next = clickNode.next;
  }
  clickNode.next.prev = clickNode.prev;
  clickNode.prev = this.tail;
  clickNode.next = undefined;
  this.tail = clickNode;
};

ClickHistoryQueue.prototype.addElement = function (element) {
  const newClickNode = new ClickNode(element);

  this.elementsMap[element._uniqueId] = newClickNode;

  if (!this.head) {
    this.head = this.tail = newClickNode;
    return;
  }

  newClickNode.prev = this.tail;
  this.tail.next = newClickNode;
  this.tail = newClickNode;
};

ClickHistoryQueue.prototype.mostRecentlyClicked = function (count) {
  count = count || this.recentClickCount;
  const mostRecent = new Array(count);
  let currNode = this.tail;
  for (let i = 0; i < count; i++) {
    mostRecent[i] = currNode;
    if (!currNode.prev) { break; }
    currNode = currNode.prev;
  }

  return mostRecent.map((node) => { return node.element; });
};

ClickHistoryQueue.prototype.getClickCount = function (element) {
  this.elementsMap[element._uniqueId].clickCount;
};

ClickHistoryQueue.getUnclickedLike = function(element) {
  return Array.from(document.getElementsByClassName(element.className)).filter(el => {
    return !el._uniqueId;
  });
};
