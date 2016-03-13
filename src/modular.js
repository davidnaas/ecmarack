import { ipcRenderer } from 'electron';
import { createStore } from 'redux';
import { assemblePatch } from './assemblePatch'

const ctx = new AudioContext();

/*
  State reducer, aka the patchbay:
    {
      connections: {
        [from]: to,
        ...
      },
      nodes: {
        [node]: {
          [type]: value, // type being parameter type, e.g frequency
          ...
        },
        ...
      }
    }
 */

function patch(state = { connections: {}, nodes: {} }, action = {}) {
  switch (action.type) {
  case 'ADD_CONNECTION':
    return Object.assign({}, state, {
      connections: connections(state.connections, action)
    });
  case 'SET_AUDIO_PARAM':
    return Object.assign({}, state, {
      nodes: nodes(state.nodes, action)
    });
  case 'ADD_NODE':
    return Object.assign({}, state, {
      nodes: nodes(state.nodes, action)
    });
  default:
    return state;
  }
}

function connections(state = {}, action) {
  switch (action.type) {
  case 'ADD_CONNECTION':
    return Object.assign({}, state, {
      [action.connection.from]: action.connection.to
    });
  default:
    return state;
  }
}

function nodes(state = {}, action) {
  switch (action.type) {
  case 'SET_AUDIO_PARAM':
    const modificationNode = state[action.modification.node] ? state[action.modification.node] : {};
    return Object.assign({}, state, {
      [action.modification.node]: modification(modificationNode, action)
    });
  case 'ADD_NODE':
    return Object.assign({}, state, {
      [action.node]: {}
    });
  default:
    return state;
  }
}

function modification(state = {}, action) {
  switch (action.type) {
  case 'SET_AUDIO_PARAM':
    return Object.assign({}, state, {
      [action.modification.type]: action.modification.value
    });
  default:
    return state;
  }
}

let store = createStore(patch);

store.subscribe(() => {
  ipcRenderer.send('modular', store.getState());
  assemblePatch(store.getState(), ctx);
});

ipcRenderer.on('readline', function (event, line) {
  let command = line.split('|');
  let actions = [];

  if (command.length > 1) {
    command.forEach((node, i) => {  
      actions.push({
        type: 'ADD_NODE',
        node: node.trim()
      });

      if (i > 0) {
        actions.push({
          type: 'ADD_CONNECTION',
          connection: {
            from: command[i - 1].trim(),
            to: command[i].trim()
          }
        });
      }
    });
  } else {
    command = line.split('>');
    command = command.slice(0, 1).concat(command.slice(1, command.length)[0].split('.'));
    actions.push({
      type: 'SET_AUDIO_PARAM',
      modification: {
        value: command[0].trim(),
        node: command[1].trim(),
        type: command[2].trim(),
      }
    });
  }
  actions.forEach((action) => {
    store.dispatch(action);
  });
});
