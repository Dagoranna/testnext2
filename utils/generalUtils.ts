  /*
result: something like: "MV9b23bQeFPtrm5wn9m4xtXE5vx7uI0PEbE6X79OXTo="
import: import { makeHash } from './path/to/module';
using: const hash = await makeHash('key', 'data');
*/
export async function makeHash(data: string | number) {
  const encoder = new TextEncoder();
  const secretKey = process.env.NEXTAUTH_SECRET as string;
  const encodedData = encoder.encode(secretKey + data);

  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedData);

  const hashArray = new Uint8Array(hashBuffer);
  const base64Hash = Array.from(hashArray)
    .map(byte => String.fromCharCode(byte))
    .join('');
    
  return btoa(base64Hash);
}

export function removeItemFromArray<T>(arr: T[], item: T) {
  return arr.filter((el) => el !== item);
}

export function serverMessageHandling(data: unknown) {
  console.log("external handling => " + data);
}
