class TextSearch {
  constructor(options = {}) {
    // 默认配置
    this.options = {
      backgroundColor: '#fff',
      textColor: '#000',
      highlightColor: 'yellow',
      searchBoxWidth: '300px',
      ...options, // 用户传入的配置会覆盖默认配置
    };

    this.createSearchBox(); // 创建搜索框
    this.listenForSearch(); // 监听 Ctrl+F 快捷键
    this.clearHighlights(); // 初始化时清除高亮
  }

  // 创建并插入搜索框
  createSearchBox() {
    if (this.searchBox) return; // 如果搜索框已经存在，则不重复创建

    this.searchBox = document.createElement('div');
    this.searchBox.style.position = 'fixed';
    this.searchBox.style.top = '10px';
    this.searchBox.style.right = '10px';
    this.searchBox.style.padding = '10px';
    this.searchBox.style.backgroundColor = this.options.backgroundColor;
    this.searchBox.style.color = this.options.textColor;
    this.searchBox.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    this.searchBox.style.zIndex = '9999';
    this.searchBox.style.cursor = 'move'; // 允许拖拽

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Search...';
    inputField.style.width = this.options.searchBoxWidth;
    inputField.style.padding = '5px';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginLeft = '10px';
    closeButton.style.padding = '5px';

    closeButton.addEventListener('click', () => {
      this.closeSearchBox();
      this.clearHighlights();
    });

    this.searchBox.appendChild(inputField);
    this.searchBox.appendChild(closeButton);
    document.body.appendChild(this.searchBox);

    inputField.addEventListener('input', (e) => {
      this.searchText(e.target.value);
    });

    // 拖拽功能
    this.makeDraggable(this.searchBox);
  }

  // 关闭搜索框并清除高亮
  closeSearchBox() {
    if (this.searchBox) {
      document.body.removeChild(this.searchBox);
      this.searchBox = null; // 确保搜索框被移除
    }
  }

  // 清除所有高亮的元素，并恢复原始文本
  clearHighlights() {
    // 清除所有高亮的span元素
    const highlightedElements = document.querySelectorAll('.highlighted');
    highlightedElements.forEach((element) => {
      const parentNode = element.parentNode;
      const textNode = document.createTextNode(element.textContent); // 创建Text节点
      parentNode.replaceChild(textNode, element); // 用Text节点替换span
    });
  }

  // 执行搜索并高亮匹配的文本
  searchText(query) {
    // 每次搜索前先清除所有的高亮
    this.clearHighlights();

    if (!query.trim()) {
      return;
    }

    const regex = new RegExp(query, 'gi');
    const textNodes = this.getTextNodesUnder(document.body);

    textNodes.forEach((node) => {
      const matches = node.textContent.match(regex);
      if (matches) {
        this.highlightText(node, matches, query);
      }
    });
  }

  // 获取文档中的所有文本节点
  getTextNodesUnder(element) {
    const textNodes = [];
    const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walk.nextNode())) {
      textNodes.push(node);
    }
    return textNodes;
  }

  // 高亮显示匹配的文本
  highlightText(node, matches, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = node.textContent.split(regex);

    // 清空文本节点，并为每个部分创建 span
    const parentNode = node.parentNode;
    const fragment = document.createDocumentFragment(); // 使用文档片段减少DOM操作

    parts.forEach((part) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        const span = document.createElement('span');
        span.style.backgroundColor = this.options.highlightColor;
        span.style.fontWeight = 'bold';
        span.className = 'highlighted'; // 给span添加class，方便后续清理
        span.textContent = part;
        fragment.appendChild(span);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    });

    parentNode.replaceChild(fragment, node); // 用文档片段替换原文本节点
  }

  // 监听 Ctrl+F 快捷键
  listenForSearch() {
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault(); // 防止浏览器默认的 Ctrl+F 行为
        this.createSearchBox();
      }
    });
  }

  // 使元素可拖拽
  makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        element.style.top = `${e.clientY - offsetY}px`;
        element.style.left = `${e.clientX - offsetX}px`;
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
}

// 导出实例
const textSearch = new TextSearch();

export default textSearch;
