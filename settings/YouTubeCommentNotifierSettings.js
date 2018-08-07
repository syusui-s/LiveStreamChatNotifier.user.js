window.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  class Enum {
    constructor(set) {
      for (const entry of set) {
        const entryStr = entry.toString();
        this[entryStr] = Symbol(entryStr);
      }

      Object.freeze(this);

      return new Proxy(this, {
        get(target, name) {
          if (name in target) {
            return target[name];
          }

          throw new TypeError(`No such enum property: ${name}`);
        },
      });
    }

    includes(item) {
      return Object.values(this).includes(item);
    }
  }

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

  const channelNameView = channelName => {
    const elem = html`
      <li class="channelName">
        <div class="channelName__name">${channelName}</div>
        <div class="menu">
          <button class="menu__item channelName__edit">編集</button>
          <button class="menu__item channelName__delete">削除</button>
        </div>
      </li>
    `;

    elem.querySelector('channelName__edit')
      .addEventListener('click', () => emit(actions.showEdit(channelName)));
    elem.querySelector('channelName__delete')
      .addEventListener('click', () => emit(actions.deleteConfirm(channelName)));

    return elem;
  };

  const states = new Enum([ 'Initial', 'Adding', 'Editing', ]);

  const actions = {
    showEdit(channelName) {
      Object.assign(state, {
        current: 
      });
    }
  };

  const storageUrl = new URL(`${window.location.origin}/settings/storage.html`);
  const remoteStorage = await RemoteStorage.create(storageUrl);
  const repository = new YouTubeSettingsRepository(remoteStorage);

  let settings;
  try {
    settings = await repository.getSettings() || YouTubeSettings.default();
  } catch (e) {
    window.alert([
      '設定の読み込みに失敗しました。',
      '通常と異なるページで動作させていませんか？',
      'https://github.com/syusui-s/YouTubeCommentNotifier.user.js/ から設定してみてください',
    ].join('\n'));

    return;
  }

  const state = {
    current: states.Initial,
  };

  const root = document.body.querySelector('.root');
  root.appendChild(settingsView(settings));
});

