import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  constrainCamera, interpolateCamera, overlap, panCamera, screenToWorld, visibleWorld, worldToScreen, zoomCamera,
} from '../../src/lib/genix-explorer/camera.ts';

const size = { width: 1200, height: 680 };
const limits = { world: { x: 0, y: 0, width: 1000, height: 400 }, min: 0.6, max: 2000 };
const home = { center: { x: 500, y: 200 }, zoom: 1 };

function closePoint(actual, expected) {
  assert.ok(Math.abs(actual.x - expected.x) < 1e-8, `x coordinate: ${actual.x} vs ${expected.x}`);
  assert.ok(Math.abs(actual.y - expected.y) < 1e-8, `y coordinate: ${actual.y} vs ${expected.y}`);
}

test('camera transforms are inverse and visible bounds match the viewport', () => {
  for (const zoom of [0.73, 1, 5.5, 409.6, 1800]) {
    const camera = { zoom, center: { x: 588.9324, y: 164.7385 } };
    const point = { x: 991.24, y: 92.83 };
    closePoint(screenToWorld(worldToScreen(point, camera, size), camera, size), point);
    const rect = visibleWorld(camera, size);
    closePoint(worldToScreen(rect, camera, size), { x: 0, y: 0 });
    closePoint(worldToScreen({ x: rect.x + rect.width, y: rect.y + rect.height }, camera, size), {
      x: size.width, y: size.height,
    });
  }
});

test('every animated scale step preserves the world point under arbitrary cursor positions', () => {
  for (const anchor of [{ x: 170, y: 146 }, { x: 985, y: 453 }, { x: 602.7, y: 307.15 }]) {
    const worldPoint = screenToWorld(anchor, home, size);
    let camera = home;
    for (const zoom of [1.1, 1.45, 2.6, 6, 19, 42, 19, 6, 2.6, 1.45, 1.1, 1]) {
      camera = zoomCamera(camera, zoom, anchor, size, limits);
      assert.equal(camera.zoom, zoom);
      closePoint(worldToScreen(worldPoint, camera, size), anchor);
    }
    closePoint(camera.center, home.center);
  }
});

test('moving the cursor anchors each step at its new position', () => {
  const positions = [{ x: 212, y: 220 }, { x: 808, y: 340 }, { x: 520, y: 392 }];
  let camera = home;
  for (const anchor of positions) {
    const point = screenToWorld(anchor, camera, size);
    camera = zoomCamera(camera, camera.zoom * 1.5, anchor, size, limits);
    closePoint(worldToScreen(point, camera, size), anchor);
  }
});

test('pan follows screen deltas, clamps at the edges, and keeps the map in reach', () => {
  const original = { x: 630, y: 290 };
  const delta = { x: 60, y: -42 };
  const panned = panCamera(home, delta, size, limits);
  const start = worldToScreen(original, home, size);
  closePoint(worldToScreen(original, panned, size), { x: start.x + delta.x, y: start.y + delta.y });

  const edge = panCamera(home, { x: -1e5, y: 1e5 }, size, limits);
  assert.deepEqual(edge, constrainCamera(edge, size, limits));
  assert.deepEqual(edge, panCamera(edge, { x: -8, y: 8 }, size, limits));
  assert.ok(overlap(visibleWorld(edge, size), limits.world) > 0);
});

test('zoom limits and the pan boundary preserve the cursor anchor', () => {
  const anchor = { x: 154, y: 200 };
  const zoomed = zoomCamera(home, 9999, anchor, size, limits);
  assert.equal(zoomed.zoom, limits.max);
  closePoint(screenToWorld(anchor, zoomed, size), screenToWorld(anchor, home, size));
  assert.equal(zoomCamera(home, 0, { x: 600, y: 340 }, size, limits).zoom, limits.min);

  const edge = panCamera(home, { x: -450, y: 0 }, size, limits);
  const farRight = { x: 1190, y: 340 };
  const limited = zoomCamera(edge, 12, farRight, size, limits);
  assert.ok(limited.zoom > edge.zoom && limited.zoom < 12);
  closePoint(screenToWorld(farRight, limited, size), screenToWorld(farRight, edge, size));
  closePoint(constrainCamera(limited, size, limits).center, limited.center);
});

test('flights interpolate smoothly between exact poses and can be reversed', () => {
  const end = { center: { x: 619.3, y: 179.5 }, zoom: 4.32 };
  assert.equal(interpolateCamera(home, end, 0), home);
  assert.equal(interpolateCamera(home, end, 1), end);
  for (let i = 1; i < 10; i++) {
    const progress = i / 10;
    const forward = interpolateCamera(home, end, progress);
    const backward = interpolateCamera(end, home, 1 - progress);
    closePoint(forward.center, backward.center);
    assert.ok(Math.abs(forward.zoom - backward.zoom) < 1e-10);
  }
});
