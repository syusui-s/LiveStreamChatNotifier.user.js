// @flow

const acceptableOrigins = [
  window.location.origin,
  'https://www.youtube.com',
  'https://www.mirrativ.com',
];

const ok = payload => ({
  type: 'OK',
  payload,
});

const badRequest = payload => ({
  type: 'BAD_REQUEST',
  payload,
});

const notFound = payload => ({
  type: 'NOT_FOUND',
  payload,
});

const internalPeerError = payload => ({
  type: 'INTERNAL_PEER_ERROR',
  payload,
});

const rawMessageHandler = actionHandler => event => {
  if (! acceptableOrigins.includes(event.origin))
    return;

  const { data, origin, source } = event;
  const { requestId, type, payload } = JSON.parse(data);

  let responseObj;
  try {
    responseObj = actionHandler(type, payload);
  } catch (e) {
    responseObj = internalPeerError();
  }

  const response = JSON.stringify({ ...responseObj, requestId });
  source.postMessage(response, origin);
};

window.addEventListener('message', rawMessageHandler((type, payload) => {
  switch (type) {
  case 'SET_ITEM':
  {
    if (! payload)
      return badRequest();

    const { key, value } = payload;
    window.localStorage.setItem(key, value);
    return ok();
  }
  case 'GET_ITEM':
  {
    if (! payload)
      return badRequest();

    const { key } = payload;
    const value = window.localStorage.getItem(key);
    return ok({ value });
  }
  default:
    return notFound();
  }
}), false);
