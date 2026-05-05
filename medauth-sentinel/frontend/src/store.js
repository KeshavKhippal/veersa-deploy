import { persistentAtom } from '@nanostores/persistent';
import { atom } from 'nanostores';

export const $result = persistentAtom('pa_result', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const $loading = atom(false);

export const $lastRequest = persistentAtom('pa_last_request', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const $backendStatus = atom('connecting');

export function setResult(val) {
  $result.set(val);
}

export function setLoading(val) {
  $loading.set(val);
}

export function setLastRequest(val) {
  $lastRequest.set(val);
}

export function setBackendStatus(val) {
  $backendStatus.set(val);
}
