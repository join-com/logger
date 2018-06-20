import * as asyncHooks from 'async_hooks';
import * as uuid from 'uuid';

const traces = new Map();

const init = (asyncId: number, _: string, triggerAsyncId: number) => {
  if (!traces.has(triggerAsyncId)) {
    return;
  }
  traces.set(asyncId, traces.get(triggerAsyncId));
};

const destroy = (asyncId: number) => {
  traces.delete(asyncId);
};

asyncHooks.createHook({ init, destroy }).enable();

const generateTrace = (): string => `${uuid.v4()}/0`;

export const start = (traceId: string = generateTrace()) => {
  traces.set(asyncHooks.executionAsyncId(), traceId);
};

export const getTraceContext = (): string => {
  return traces.get(asyncHooks.executionAsyncId());
};

export { traceMiddleware } from './expressMiddleware';
