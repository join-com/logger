import * as asyncHooks from 'async_hooks';
import * as uuid from 'uuid';

export const DEFAULT_TRACE_CONTEXT_NAME = 'x-cloud-trace-context';

global.__join_com_node_trace__ = new Map();

const init = (asyncId: number, _: string, triggerAsyncId: number) => {
  if (!global.__join_com_node_trace__.has(triggerAsyncId)) {
    return;
  }
  global.__join_com_node_trace__.set(
    asyncId,
    global.__join_com_node_trace__.get(triggerAsyncId),
  );
};

const destroy = (asyncId: number) => {
  global.__join_com_node_trace__.delete(asyncId);
};

asyncHooks.createHook({ init, destroy }).enable();

const generateTrace = (): string => `${uuid.v4()}/0`;

export const start = (traceId: string = generateTrace()) => {
  global.__join_com_node_trace__.set(asyncHooks.executionAsyncId(), traceId);
};

export const getTraceContext = (): string => {
  return global.__join_com_node_trace__.get(asyncHooks.executionAsyncId());
};

export const getTraceContextName = (): string => {
  return process.env.TRACE_CONTEXT_NAME || DEFAULT_TRACE_CONTEXT_NAME;
};

export { traceMiddleware } from './expressMiddleware';

export default {
  DEFAULT_TRACE_CONTEXT_NAME,
  start,
  getTraceContext,
  getTraceContextName,
};
