window.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  const html = (callSites, ...substitutions) => {
    const escapedSubstitutions = substitutions.map(value =>
      value.toString().replace(/[&'`"<>]/g, match => ({
        '&': '&amp;',
        '\'': '&#x27;',
        '`': '&#x60;',
        '"': '&quot;',
        '<': '&lt;',
        '>': '&gt;',
      }[match]))
    );

    const htmlString = String.raw(callSites, ...escapedSubstitutions);

    const domParser = new DOMParser();
    const doc = domParser.parseFromString(htmlString, 'text/html');

    return doc.body.firstChild;
  };

  const settingsView = ({ channelNames }) => {
    const elem = html`
      <form class="settings">
        <section>
          <h2 class="setting-section__title">通知チャンネル</h2>
          <p><button class="flat-button flat-button--add">追加</button></p>
        </section>
        <div class="modal" style="display: none;">
          <div class="modal__content">
            hoge
          </div>
        </div>
      </form>
    `;

    elem.querySelector('section')
      .appendChild( channelNamesView([...channelNames]) );

    return elem;
  };

  const channelNamesView = names => {
    const elem = html`
      <ul class="channelNames">
      </ul>
    `;
    names.forEach(name => elem.appendChild(channelNameView(name)));

    return elem;
  };

  const channelNameView = channelName => html`
    <li class="channelName">
      <div class="channelName__name">${channelName}</div>
      <div class="channelName__menu">
        <button class="channelName__edit">編集</button>
        <button class="channelName__delete">削除</button>
      </div>
    </li>
  `;


  const storageUrl = new URL(`${window.location.origin}/settings/storage.html`);
  const remoteStorage = await RemoteStorage.create(storageUrl);
  const repository = new YouTubeSettingsRepository(remoteStorage);

  try {
    const settings = await repository.getSettings() || YouTubeSettings.default();
    const root = document.body.querySelector('.root');
    root.appendChild(settingsView(settings));
  } catch (e) {
    window.alert([
      '設定の読み込みに失敗しました。',
      '通常と異なるページで動作させていませんか？',
      'https://github.com/syusui-s/YouTubeCommentNotifier.user.js/ から設定してみてください',
    ].join('\n'));
  }
});

