export async function makeHash(data){
  const encoder = new TextEncoder();
  const secretKey = process.env.NEXTAUTH_SECRET;
  const encodedData = encoder.encode(secretKey + data);

  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedData);

  const hashArray = new Uint8Array(hashBuffer);
  const base64Hash = btoa(String.fromCharCode(...hashArray));

  return base64Hash;
/*
result: something like: "MV9b23bQeFPtrm5wn9m4xtXE5vx7uI0PEbE6X79OXTo="
import: import { makeHash } from './path/to/module';
using: const hash = await makeHash('key', 'data');
*/
}

export function removeItemFromArray(arr, item) {
  return arr.filter(el => el !== item);
}

