export type Deployment = {
  worker_id: number | null;
  token: string;
};

export const DEFAULT_DEPLOYMENT: Deployment = {
  worker_id: null,
  token: "",
};
