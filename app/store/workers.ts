import { create } from "zustand";

const DEFAULT_WORKER_STATE = {
  workers: {} as Record<number, Worker>,
  globalWorkerId: 0,
};

type WorkerState = typeof DEFAULT_WORKER_STATE;
type WorkerStore = WorkerState & {
  create: (worker: Worker) => number;
  delete: (id: number) => void;
  get: (id: number) => Worker | null;
};

export const useWorkerStore = create<WorkerStore>((set, get) => ({
  ...DEFAULT_WORKER_STATE,
  create(worker: Worker) {
    set(() => ({ globalWorkerId: get().globalWorkerId + 1 }));
    const id = get().globalWorkerId;
    const workers = get().workers;
    workers[id] = worker;
    set(() => ({ workers }));
    return id;
  },
  delete(id) {
    const workers = get().workers;
    if (workers[id]) {
      delete workers[id];
      set(() => ({ workers }));
    }
  },
  get(id) {
    return get().workers[id] ?? null;
  },
}));
