// O front fala só com este objeto. Sem VITE_API_URL usa a simulação; com ela, o back-end real.
import { apiSimulada } from './simulada.js';
import { apiHttp } from './http.js';

const url = import.meta.env?.VITE_API_URL;

export const api = url ? apiHttp(url) : apiSimulada;
