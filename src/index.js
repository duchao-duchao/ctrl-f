class TextSearch {
  constructor(options = {}) {
    // 默认配置
    this.options = {
      backgroundColor: '#fff',
      textColor: '#000',
      highlightColor: 'yellow',  // 默认黄色
      currentHighlightColor: 'orange',  // 当前高亮为橙色
      searchBoxWidth: '96%',
      ...options, // 用户传入的配置会覆盖默认配置
    };

    this.matches = []; // 存储匹配项
    this.currentIndex = -1; // 当前高亮的索引

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
    this.searchBox.style.cursor = 'move';
    this.searchBox.style.width = '376px';

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Search...';
    inputField.style.width = this.options.searchBoxWidth;
    inputField.style.padding = '5px';

    const title = document.createElement('div');
    title.style.height = '48px';
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.style.justifyContent = 'space-between';

    const titleName = document.createElement('div');
    titleName.innerText = '查找';

    const titleClose = document.createElement('div');
    titleClose.innerText = '关闭';

    titleClose.addEventListener('click', () => {
      this.closeSearchBox();
      this.clearHighlights();
    });

    title.appendChild(titleName);
    title.appendChild(titleClose);

    // 上下按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

    const prevButton = document.createElement('button');
    prevButton.innerText = '上一处';
    prevButton.style.padding = '5px 10px';
    prevButton.addEventListener('click', () => this.highlightPrevious());

    const nextButton = document.createElement('button');
    nextButton.innerText = '下一处';
    nextButton.style.padding = '5px 10px';
    nextButton.addEventListener('click', () => this.highlightNext());

    buttonContainer.appendChild(prevButton);
    buttonContainer.appendChild(nextButton);

    this.searchBox.appendChild(title);
    this.searchBox.appendChild(inputField);
    this.searchBox.appendChild(buttonContainer);
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
      const siblingNodes = [];
      let currentNode = element.previousSibling;
      while (currentNode) {
        siblingNodes.unshift(currentNode);
        currentNode = currentNode.previousSibling;
      }
      siblingNodes.push(element);
      currentNode = element.nextSibling;
      while (currentNode) {
        siblingNodes.push(currentNode);
        currentNode = currentNode.nextSibling;
      }
      const combinedText = siblingNodes.map((node) => node.textContent).join('');
      const textNode = document.createTextNode(combinedText);
      parentNode?.replaceChildren(textNode);
    });
    this.matches = []; // 清空已匹配的文本
    this.currentIndex = -1; // 重置当前高亮索引
  }

  // 执行搜索并高亮匹配的文本
  searchText(query) {
    this.clearHighlights(); // 清除之前的高亮

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
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      const span = document.createElement('span');
      if (part.toLowerCase() === query.toLowerCase()) {
        span.className = 'highlighted'; // 给span添加class，方便后续清理
        if (this.matches.length === 0 || this.matches.length === this.currentIndex + 1) {
          span.style.backgroundColor = this.options.currentHighlightColor;  // 当前高亮为橙色
        } else {
          span.style.backgroundColor = this.options.highlightColor;  // 其余为黄色
        }
        span.style.fontWeight = 'bold';
        span.textContent = part;
        fragment.appendChild(span);
        
        // 存储匹配项位置
        this.matches.push(span);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    });

    parentNode.replaceChild(fragment, node); // 用文档片段替换原文本节点
  }

  // 监听 Ctrl+F 快捷键
  listenForSearch() {
    window.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
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

  // 高亮下一个匹配项
  highlightNext() {
    if (this.matches.length === 0) return;

    this.currentIndex = (this.currentIndex + 1) % this.matches.length;
    this.updateHighlightColors();
    this.scrollToMatch(this.matches[this.currentIndex]);
  }

  // 高亮上一个匹配项
  highlightPrevious() {
    if (this.matches.length === 0) return;

    this.currentIndex = (this.currentIndex - 1 + this.matches.length) % this.matches.length;
    this.updateHighlightColors();
    this.scrollToMatch(this.matches[this.currentIndex]);
  }

  // 更新高亮颜色
  updateHighlightColors() {
    this.matches.forEach((match, index) => {
      if (index === this.currentIndex) {
        match.style.backgroundColor = this.options.currentHighlightColor; // 当前项橙色
      } else {
        match.style.backgroundColor = this.options.highlightColor; // 其他项黄色
      }
    });
  }

  // 滚动到当前匹配项
  scrollToMatch(match) {
    match.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// 导出实例
const textSearch = new TextSearch();

export default textSearch;
