import type { Rect } from './camera.ts';
import type { DetailSpec, DiagramSpec, Glyph, Level, Placement, Region, SceneSpec, SourceSpec } from './model.ts';

const rect = (x: number, y: number, width: number, height: number): Rect => ({ x, y, width, height });
const placement = (wide: Rect, compact: Rect): Placement => ({ wide, compact });

const overview = [
  placement(rect(14, 121, 190, 117), rect(40, 9, 280, 76)),
  placement(rect(252, 121, 190, 117), rect(40, 113, 280, 76)),
  placement(rect(490, 87, 258, 185), rect(24, 215, 312, 106)),
  placement(rect(796, 121, 190, 117), rect(40, 349, 280, 76)),
] as const;

const threeRegions = [
  placement(rect(40, 121, 227, 117), rect(40, 23, 280, 83)),
  placement(rect(367, 88, 266, 183), rect(24, 161, 312, 112)),
  placement(rect(733, 121, 227, 117), rect(40, 331, 280, 83)),
] as const;

const twoRegions = [
  placement(rect(158, 97, 268, 165), rect(26, 48, 308, 119)),
  placement(rect(574, 97, 268, 165), rect(26, 274, 308, 119)),
] as const;

function detail(id: string, title: string, label: string, description: string): DetailSpec {
  return { id, title, level: 'function', kind: 'detail', glyph: 'detail', label, description };
}

function flow(
  id: string, title: string, level: Level, glyph: Glyph, description: string, legend: string,
  regions: readonly Region[], preferred: string,
): DiagramSpec {
  return {
    id, title, level, glyph, description, legend, regions, preferred, kind: 'diagram',
    links: regions.slice(1).map(({ scene }, index) => [regions[index].scene.id, scene.id]),
  };
}

function smallModule(
  id: string, title: string, glyph: Glyph, description: string, legend: string,
  first: DetailSpec, second: DetailSpec,
): DiagramSpec {
  return flow(id, title, 'module', glyph, description, legend, [
    { scene: first, bounds: twoRegions[0], caption: first.label },
    { scene: second, bounds: twoRegions[1], caption: second.label },
  ], first.id);
}

const evaluate: SourceSpec = {
  id: 'evaluate-node',
  title: 'Evaluate node',
  description: 'Inspect either statement in this illustrative C# method.',
  level: 'source',
  kind: 'source',
  glyph: 'code',
  file: 'Evaluation.cs',
  preferred: 'apply-weight',
  lines: [
    { code: 'static int Evaluate(Node n, int x)' },
    { code: '{' },
    {
      code: '    var scaled = x * n.Weight;',
      statement: {
        id: 'apply-weight',
        title: 'Apply the weight',
        level: 'source',
        kind: 'detail',
        glyph: 'detail',
        label: 'Line 3',
        description: 'Multiply the input by the node’s weight and keep the result for the next statement.',
        sample: 'x * n.Weight',
        note: 'Compilation details are a future extension.',
      },
    },
    {
      code: '    return scaled + n.Bias;',
      statement: {
        id: 'add-bias',
        title: 'Add the bias',
        level: 'source',
        kind: 'detail',
        glyph: 'detail',
        label: 'Line 4',
        description: 'Add the node’s bias to the weighted input and return the resulting score.',
        sample: 'scaled + n.Bias',
        note: 'Compilation details are a future extension.',
      },
    },
    { code: '}' },
  ],
};

const resolve = flow(
  'resolve-graph', 'Resolve graph', 'function', 'graph',
  'Follow one node through a single pass of the evaluator.', 'Evaluation sequence', [
    {
      scene: detail('read-inputs', 'Read inputs', 'Input', 'Collect the inputs already produced by this node’s dependencies.'),
      bounds: threeRegions[0], caption: 'Read dependencies',
    },
    { scene: evaluate, bounds: threeRegions[1], caption: 'C# source', featured: true },
    {
      scene: detail('save-result', 'Store result', 'Output', 'Keep the computed value available for any node that depends on it.'),
      bounds: threeRegions[2], caption: 'Save the value',
    },
  ], evaluate.id,
);

const evaluation = flow(
  'evaluation', 'Evaluation', 'module', 'kernel',
  'The evaluator turns an ordered graph into computed results.', 'Evaluation pipeline', [
    {
      scene: detail('prepare-inputs', 'Prepare inputs', 'Setup', 'Associate each definition with the inputs used in this run.'),
      bounds: threeRegions[0], caption: 'Bind run inputs',
    },
    { scene: resolve, bounds: threeRegions[1], caption: 'Evaluation pass', featured: true },
    {
      scene: detail('cache-results', 'Cache results', 'Reuse', 'Pass completed values forward and retain the ones that can be reused.'),
      bounds: threeRegions[2], caption: 'Retain computed values',
    },
  ], resolve.id,
);

const authoring = smallModule(
  'authoring', 'Authoring', 'input', 'Turn a request into validated definitions.', 'Authoring sequence',
  detail('read-definitions', 'Read definitions', 'Parsing', 'Read a set of definitions and assign a name to each node.'),
  detail('validate-fields', 'Validate fields', 'Validation', 'Check that required inputs and references are present before planning.'),
);

const planning = smallModule(
  'planning', 'Planning', 'graph', 'Arrange definitions into an execution order.', 'Planning sequence',
  detail('collect-dependencies', 'Collect dependencies', 'Dependencies', 'Connect each node to the other nodes it needs.'),
  detail('order-graph', 'Order graph', 'Scheduling', 'Arrange the nodes so dependencies are evaluated before their consumers.'),
);

const delivery = smallModule(
  'delivery', 'Delivery', 'output', 'Package the results of an evaluation run.', 'Delivery sequence',
  detail('assemble-output', 'Assemble output', 'Assembly', 'Gather the requested results into an output artifact.'),
  detail('publish-artifact', 'Publish artifact', 'Output', 'Hand the completed artifact back to the caller.'),
);

export const illustrativeGenix: SceneSpec = flow(
  'overview', 'Architecture', 'architecture', 'layers',
  'Follow a request through an illustrative system.', 'Request flow', [
    { scene: authoring, bounds: overview[0], caption: 'Definitions' },
    { scene: planning, bounds: overview[1], caption: 'Dependency graph' },
    { scene: evaluation, bounds: overview[2], caption: 'Execution', featured: true },
    { scene: delivery, bounds: overview[3], caption: 'Artifacts' },
  ], evaluation.id,
);
