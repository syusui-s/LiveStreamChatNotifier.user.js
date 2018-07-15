// @flow
class RemoteStorage {
  /*::
    iframe: HTMLIFrameElement
    storageUrl: string
    storageOrigin: string
  */

  async listen(expectedRequestId) {
    return new Promise(resolve => {
      const listener = event => {
        if (event.origin !== this.storageOrigin)
          return;

        const data = JSON.parse(event.data);

        if (data.requestId !== expectedRequestId)
          return;

        resolve(data);
        window.removeEventListener('message', listener);
      };

      window.addEventListener('message', listener, false);
    });
  }

  // https://syusui-s.github.io/YouTubeCommentNotifier.user.js/settings/storage.html
  constructor(storageUrl) {
    const iframe = document.createElement('iframe');

    iframe.src = storageUrl;
    iframe.height = '0';
    iframe.width  = '0';
    window.document.body.appendChild(iframe);

    Object.assign(this, { iframe, storageUrl, storageOrigin: new URL(storageUrl).origin, });
  }

  async getItem(key) {
    const requestId = Math.random();
    const message = JSON.stringify({
      requestId,
      type: 'GET_ITEM',
      payload: { key },
    });

    this.iframe.contentWindow.postMessage(message, this.storageOrigin);

    const { type, payload } = await this.listen(requestId);

    switch (type) {
    case 'OK':
      return payload.value;
    default:
      throw new TypeError(`Unknown type '${type}'`);
    }
  }

  async setItem(key, value) {
    const requestId = Math.random();
    const message = JSON.stringify({
      type: 'SET_ITEM',
      payload: { key, value },
    });

    this.iframe.contentWindow.postMessage(message, this.storageOrigin);

    const { type } = await this.listen(requestId);

    switch (type) {
    case 'OK':
      return;
    default:
      throw new TypeError(`Unknown type '${type}'`);
    }
  }

}
