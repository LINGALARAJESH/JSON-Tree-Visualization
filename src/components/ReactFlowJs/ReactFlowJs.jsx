import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./ReactFlowJs.module.css";
import {ReactFlow,Background,Controls,applyNodeChanges,applyEdgeChanges,addEdge} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export function ReactFlowJs({ nodes, edges, setEdges, setNodes, jsonData, HilightPath }) {
  const wrapperRef = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)),[setNodes]);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),[setEdges]);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)),[setEdges]);
  
  const jsonToFlow = useCallback((json) => {
    const nodeList = [];
    const edgeList = [];
    let counter = 0;

    function createNode(label, type, depth, valueType = null) {
    let bgColor = "#154A72";

      if (type === "key") {
        if (valueType === "object") bgColor = "#154A72";       
        else if (valueType === "array") bgColor = "#20c997";  
        else if (valueType === "primitive") bgColor = "#f76707";
      }
      else if (type === "value") {
        if (valueType === "string") bgColor = "#fbb02d";
        else if (valueType === "number") bgColor = "#e56b6f";
        else if (valueType === "boolean") bgColor = "#f77f00";
        else if (valueType === "null") bgColor = "#6c757d";
      }

      return {
        id: `${label}_${counter++}`,
        data: { label },
        position: { x: nodeList.length * 120, y: depth * 250 },
        style: {
          border: "1px solid #fff",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
          borderRadius: 6,
          padding: "8px 12px",
          backgroundColor: bgColor,
          color: "#fff",
          fontSize: 13,
          textAlign: "center",
          transition: "all 0.3s ease",
        },
      };
    }

    function visit(value, key = "root", depth = 0, parentId = null, parentPath = "$") {
      const currentPath = `${parentPath}.${key}`;
      const valueType =value === null? "null": Array.isArray(value)? "array": typeof value === "object"? "object": "primitive";
      const keyNode = createNode(key, "key", depth, valueType);
      keyNode.data.path = currentPath;
      nodeList.push(keyNode);

      if (parentId) {edgeList.push({
          id: `${parentId}->${keyNode.id}`,
          source: parentId,
          target: keyNode.id,
          type: "smoothstep",
          label: valueType, 
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: "#fff", color: "#fff", fillOpacity:1 },
          style: { stroke: "#465362", strokeWidth: 2 },
          markerEnd: { type: "arrowclosed", color: "#465362" },
        });
      }

      if (value !== null && typeof value === "object") {
        if (Array.isArray(value)) {
          value.forEach((item, index) =>visit(item, `[${index}]`, depth + 1, keyNode.id, currentPath));
        } else {
          for (const childKey in value) {
            visit(value[childKey], childKey, depth + 1, keyNode.id, currentPath);
          }
        }
      } else {
        const primitiveType = value === null ? "null" : typeof value;
        const valueNode = createNode(JSON.stringify(value), "value", depth + 1, primitiveType);
        valueNode.data.path = currentPath;
        nodeList.push(valueNode);

        edgeList.push({
          id: `${keyNode.id}->${valueNode.id}`,
          source: keyNode.id,
          target: valueNode.id,
          type: "step",
          animated: true,
          label: primitiveType, 
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: "#fff", color: "#fff", fillOpacity: 1 },
          style: { stroke: "#cc3363", strokeWidth: 2 },
          markerEnd: { type: "arrowclosed", color: "#cc3363" },
        });
      }
    }

    visit(json);
    return { nodeList, edgeList };
  }, []);

  useEffect(() => {
    if (!jsonData) return;
    try {
      const { nodeList, edgeList } = jsonToFlow(jsonData);
      setNodes(nodeList);
      setEdges(edgeList);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
    }
  }, [jsonData, jsonToFlow, setNodes, setEdges]);

  useEffect(() => {
    if (!HilightPath) return;

    setNodes((nods) =>nods.map((n) =>
        n.data.path === HilightPath ?
           {...n,style: {...n.style,border: "2px solid #facc15",boxShadow: "0 0 15px 4px rgba(250, 204, 21, 0.7)"}}
          : { ...n, style: { ...n.style, border: "1px solid #fff", boxShadow: "none" } }
      )
    );

    const targetNode = nodes.find((n) => n.data.path === HilightPath);
    if (targetNode && rfInstance?.setCenter) {
      rfInstance.setCenter(targetNode.position.x, targetNode.position.y, {
        zoom: 1.5,
        duration: 500,
      });
    }
  }, [HilightPath, rfInstance, setNodes]);

  return (
    <div className={styles.flowContainer}>
      <div className={styles.flowContainergraph}>
        <ReactFlow ref={wrapperRef} nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onInit={setRfInstance} fitView>
          <Background variant="dots" color="#ccc" gap={16} style={{ backgroundColor: "#fff" }} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
