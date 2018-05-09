class Message {
  constructor(title, img, message) {
    Object.assign(this, { title, img, message });
  }
}

regexps = [/勇気ちひろ/, /森中花咲/, /モイラ/, /樋口楓/, /美兎/, /静 ?凛/, /刀也/] // ← regexps.push()で動的に変更できる
chatItems = document.querySelector('#items.yt-live-chat-item-list-renderer');
m = new MutationObserver(records => {
  records.forEach(record => {
    if (record.type === 'childList')
      record.addedNodes.forEach(chatItem => {
        const name = chatItem.querySelector('#author-name');
        const badge = chatItem.querySelector('yt-live-chat-author-badge-renderer[type=moderator]');

        if (regexps.some(regex => regex.test(name && name.textContent)) || badge) {
          const img = chatItem.querySelector('img#img');
          new Notification((name && name.textContent), {
            icon: img && img.src,
            body: chatItem.querySelector('#message').textContent
          });
        }
      });
  });
});
m.observe(chatItems, { childList: true });
