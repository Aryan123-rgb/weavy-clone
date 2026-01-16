import { create } from 'zustand';
import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  addEdge,
} from '@xyflow/react';
import { temporal } from 'zundo';

// Define the type for Node Data
type NodeData = {
    [key: string]: any;
};

// Define the store state
interface FlowState {
    nodes: Node[];
    edges: Edge[];
    nodeData: Record<string, NodeData>; // Map nodeId to data
    executionState: Record<string, 'idle' | 'running' | 'completed' | 'failed'>; // Track execution per node

    // Actions
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: (connection: Connection) => void;
    updateNodeData: (nodeId: string, data: NodeData) => void;
    setExecutionState: (nodeId: string, state: 'idle' | 'running' | 'completed' | 'failed') => void;
    validateConnection: (sourceNode: Node, sourceHandle: string | null, targetNode: Node, targetHandle: string | null) => boolean;
}

/**
 * Global Zustand store for managing workflow state and data flow.
 * usage: useFlowStore((state) => state.nodes)
 */
export const useFlowStore = create<FlowState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      nodeData: {},
      executionState: {},

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },
      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect: (connection) => {
        set({
          edges: addEdge(connection, get().edges),
        });
      },

      /**
       * Updates the data for a specific node.
       * This is used to track data flow between nodes without relying solely on React Flow's internal state.
       */
      updateNodeData: (nodeId, data) => {
        set((state) => ({
          nodeData: {
            ...state.nodeData,
            [nodeId]: { ...(state.nodeData[nodeId] || {}), ...data },
          },
        }));
      },

      setExecutionState: (nodeId, state) => {
        set((prev) => ({
          executionState: {
            ...prev.executionState,
            [nodeId]: state,
          },
        }));
      },

      /**
       * Validates if a connection between two nodes is valid based on their types.
       */
      validateConnection: (
        sourceNode,
        sourceHandle,
        targetNode,
        targetHandle,
      ) => {
        // Example Validation Logic
        if (sourceNode.type === "text" && sourceHandle === "text") {
          // Output is string
          if (targetNode.type === "runLLMNode") {
            if (targetHandle === "image1") {
              return false; // Cannot connect string to image input
            }
            return true; // Can connect to 'prompt' or 'system'
          }
        }

        // Default to true if no specific rule is matched
        return true;
      },
    }),
    {
      partialize: (state) => {
        // Only track nodes and edges for undo/redo
        const { nodes, edges } = state;
        return { nodes, edges };
      },
    },
  ),
);
