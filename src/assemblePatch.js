import { ipcRenderer } from 'electron';

export function assemblePatch(state, ctx) {
  // Create audio nodes
  const nodes = Object.keys(state.nodes).map((node) => {
    return {
      audioNode: createAudioNode(node),
      nodeId: node
    };
  });

  // Set their audio params
  nodes.forEach(({audioNode, nodeId}) => {
    if (state.nodes[nodeId]) { 
      const modifications = Object.keys(state.nodes[nodeId]);
      modifications.forEach((value, i) => {
        setAudioParam(audioNode, modifications[i], value);
      });
    }
  });

  // Connect the nodes
  const nodeMap = {};
  const connectionsFrom = Object.keys(state.connections);
  if (nodes) { 
    // Convert back to map
    nodes.forEach((node) => {
      nodeMap[node.nodeId] = node.audioNode;
    });

    // Connect audio nodes
    connectionsFrom.forEach((connection) => {
      const nodeFrom = nodeMap[connection];
      const nodeTo = nodeMap[state.connections[connection]];
      if (nodeFrom && nodeTo) {
        nodeFrom.connect(nodeTo);
      }
    });
  }

  function createAudioNode(node) {
    switch (node.replace(/[0-9]/g, '')) {
    case 'osc':
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 400;
      osc.start();
      return osc;
    case 'speaker':
      return ctx.destination;
    case 'gain':
      const gain = ctx.createGain();
      gain.gain.value = .5;
      return gain;
    default:
      return;
    }
  }

  function setAudioParam(audioNode, audioParam, value) {
    return;
  }
}
