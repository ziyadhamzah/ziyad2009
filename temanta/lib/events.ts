export type NotificationItem = {
  id: string; title: string; body: string; href?: string; at: string; read: boolean;
};

export type TemantaEvent = { type: "notification"; payload: NotificationItem };

type Listener = (e: TemantaEvent) => void;

// Bus acara sederhana (tanpa React) agar lapisan data apa pun (mis. store)
// bisa memicu notifikasi tanpa bergantung pada posisi provider.
const listeners = new Set<Listener>();

export const notify = (n: Omit<NotificationItem, "id" | "at" | "read">) => {
  listeners.forEach((l) => l({ type: "notification", payload: { id: crypto.randomUUID(), at: new Date().toISOString(), read: false, ...n } }));
};

export const onNotify = (l: Listener) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};