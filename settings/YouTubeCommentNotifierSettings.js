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
          <h2>通知チャンネル</h2>
        </section>
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
      <button class="channelName__edit">編集</button>
      <button class="channelName__delete">削除</button>
    </li>
  `;


  const storageUrl = new URL(`${window.location.origin}/settings/storage.html`);
  const remoteStorage = await RemoteStorage.create(storageUrl);
  const repository = new YouTubeSettingsRepository(remoteStorage);

  const settings = await repository.getSettings() || YouTubeSettings.default();

  const root = document.body.querySelector('.root');
  root.appendChild(settingsView(settings));
});

