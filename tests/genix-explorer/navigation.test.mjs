import assert from 'node:assert/strict';
import { test } from 'node:test';
import { centerOf, overlap, panCamera, viewportCenter, visibleWorld } from '../../src/lib/genix-explorer/camera.ts';
import { illustrativeGenix } from '../../src/lib/genix-explorer/illustrative.ts';
import {
  cameraFor, layoutScenes, limitsFor, pathTo, restoreNavigation, revealProgress,
  saveNavigation, sceneAt, zoomLimitAt,
} from '../../src/lib/genix-explorer/navigation.ts';

const wide = { width: 1310, height: 590, profile: 'wide' };
const compact = { width: 352, height: 575, profile: 'compact' };
const ids = ['overview', 'evaluation', 'resolve-graph', 'evaluate-node', 'apply-weight'];

for (const view of [wide, compact]) {
  const layout = layoutScenes(illustrativeGenix, view.profile);
  const scenes = ids.map((id) => layout.scenes.get(id));

  test(`${view.profile} scenes fit strictly inside their parent region`, () => {
    for (const { portals } of layout.scenes.values()) {
      for (const { scene, bounds } of portals) {
        assert.ok(scene.frame.x > bounds.x);
        assert.ok(scene.frame.y > bounds.y);
        assert.ok(scene.frame.x + scene.frame.width < bounds.x + bounds.width);
        assert.ok(scene.frame.y + scene.frame.height < bounds.y + bounds.height);
        assert.deepEqual(centerOf(scene.frame), centerOf(bounds));
      }
    }
  });

  test(`${view.profile} semantic thresholds reveal gradually and resolve the same scene in reverse`, () => {
    for (const scene of scenes.slice(1)) {
      const landing = cameraFor(scene, view);
      const scales = [0.40, 0.52, 0.65, 0.76, 0.86, 0.95].map((factor) => factor * landing.zoom);
      const grades = scales.map((zoom) => revealProgress(scene, zoom, view));
      assert.equal(grades[0], 0);
      assert.equal(grades.at(-1), 1);
      assert.ok(grades.slice(1).every((value, index) => value > grades[index]));
      const selected = (zoom) => sceneAt(layout, { center: landing.center, zoom }, view).spec.id;
      const forward = scales.map(selected);
      assert.notEqual(forward[0], scene.spec.id);
      assert.equal(forward.at(-1), scene.spec.id);
      assert.deepEqual(scales.toReversed().map(selected), forward.toReversed());
    }
  });

  test(`${view.profile} landing poses traverse the source path and restore parents`, () => {
    for (const scene of [...scenes, ...scenes.toReversed()]) {
      assert.equal(sceneAt(layout, cameraFor(scene, view), view), scene);
      assert.deepEqual(pathTo(scene).map(({ spec }) => spec.id), ids.slice(0, ids.indexOf(scene.spec.id) + 1));
    }
    for (const scene of layout.scenes.values()) {
      assert.equal(sceneAt(layout, cameraFor(scene, view), view), scene);
    }
    const branches = layout.root.portals.filter(({ scene }) => scene.spec.id !== 'evaluation');
    const moduleView = visibleWorld(cameraFor(scenes[1], view), view);
    assert.ok(branches.every(({ bounds }) => overlap(bounds, moduleView) === 0));
  });

  test(`${view.profile} magnification cap follows the branch and respects empty space`, () => {
    const center = viewportCenter(view);
    const blank = { center: { x: 1, y: 1 }, zoom: cameraFor(layout.root, view).zoom };
    const source = cameraFor(scenes[3], view);
    assert.equal(zoomLimitAt(layout, blank, view, center), blank.zoom * 1.3);
    assert.ok(zoomLimitAt(layout, source, view, center) > source.zoom);
  });
}

test('navigation state round-trips a panned source pose, cursor position, and scroll mode', () => {
  const layout = layoutScenes(illustrativeGenix, wide.profile);
  const source = layout.scenes.get('evaluate-node');
  const camera = panCamera(cameraFor(source, wide), { x: 36, y: -19 }, wide, limitsFor(layout, wide));
  const anchor = { x: 635, y: 204 };
  const saved = saveNavigation(source, camera, wide, anchor, 'pan');
  const restored = restoreNavigation(JSON.parse(JSON.stringify(saved)), layout, wide);
  assert.deepEqual(restored, { camera, anchor, scroll: 'pan' });
  assert.equal(sceneAt(layout, restored.camera, wide, restored.anchor), source);
});

test('portrait reflow preserves the saved scene, with invalid state falling back to overview', () => {
  const layout = layoutScenes(illustrativeGenix, wide.profile);
  const portrait = layoutScenes(illustrativeGenix, compact.profile);
  const source = layout.scenes.get('apply-weight');
  const state = saveNavigation(source, cameraFor(source, wide), wide, viewportCenter(wide), 'zoom');
  const restored = restoreNavigation(state, portrait, compact);
  assert.equal(sceneAt(portrait, restored.camera, compact, restored.anchor).spec.id, source.spec.id);
  assert.equal(restored.scroll, 'zoom');

  for (const invalid of [null, { version: 2 }, { ...state, scene: 'unknown' }, { ...state, u: Infinity }]) {
    assert.deepEqual(restoreNavigation(invalid, portrait, compact).camera, cameraFor(portrait.root, compact));
  }
});

test('portrait reflow keeps an overview pose in the overview even if the same offset hits a region', () => {
  const landscape = layoutScenes(illustrativeGenix, wide.profile);
  const portrait = layoutScenes(illustrativeGenix, compact.profile);
  const camera = { center: { x: 500, y: 27 }, zoom: cameraFor(landscape.root, wide).zoom * 4.5 };
  const saved = saveNavigation(landscape.root, camera, wide, viewportCenter(wide), 'auto');
  assert.equal(sceneAt(landscape, camera, wide), landscape.root);
  const restored = restoreNavigation(saved, portrait, compact);
  assert.deepEqual(restored.camera, cameraFor(portrait.root, compact));
});
