// @flow

const acceptableOrigins = [
  window.location.origin,
  'https://www.youtube.com',
  'https://www.mirrativ.com',
];

window.addEventListener('message', event => {
  if (! acceptableOrigins.includes(event.origin))
    return;

  const { data, source }  = event;
  const { requestId, type, payload } = JSON.parse(data);

  switch (type) {
  case 'SET_ITEM':
    {
      const { key, value } = payload;
      window.localStorage.setItem(key, value);
      source.postMessage(JSON.stringify({
        requestId,
        type: 'OK',
      }), source.origin);
    }
    break;

  case 'GET_ITEM':
    {
      const { key } = payload;
      const value = window.localStorage.getItem(key);
      source.postMessage(JSON.stringify({
        requestId,
        type: 'OK',
        payload: { value },
      }), source.origin);
    }
    break;

  default:
    source.postMessage(JSON.stringify({
      type: 'NOT_FOUND',
    }));
  }
}, false);
