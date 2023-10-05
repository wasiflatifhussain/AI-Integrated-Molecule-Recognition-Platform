import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TreeGraph = ({ edges }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const root = d3.stratify()(edges);
    const treeLayout = d3.tree().size([height, width]);
    
    treeLayout.separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
    
    const treeData = treeLayout(root);

    const links = treeData.links();
    const nodes = treeData.descendants();

    svg.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.y)
      .attr('y1', d => d.source.x)
      .attr('x2', d => d.target.y)
      .attr('y2', d => d.target.x)
      .attr('stroke', 'red');

    const node = svg.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', 10)
      .attr('fill', 'red');

    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.children ? -12 : 12)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.id)
      .attr('fill', 'black');
  }, [edges]);

  return <svg ref={svgRef}></svg>;
};

export default TreeGraph;
