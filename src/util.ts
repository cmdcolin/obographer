export async function jsonfetch<T>(url: string, arg?: RequestInit) {
  const res = await fetch(url, arg)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}: ${await res.text()}`)
  }
  return res.json() as Promise<T>
}

export function idMaker(r: string) {
  return r.replace('http://purl.obolibrary.org/obo/', '').replace('_', ':')
}
