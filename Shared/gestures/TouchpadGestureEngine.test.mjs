// STouch Touchpad Gesture Engine Automated Test Suite
import { TouchpadGestureEngine } from './TouchpadGestureEngine.ts';

function createTouchEvent(type, touches) {
  return {
    changedTouches: touches.map(t => ({
      identifier: t.id,
      clientX: t.x,
      clientY: t.y,
    }))
  };
}

async function runTests() {
  console.log("=== RUNNING TOUCHPAD GESTURE ENGINE UNIT TESTS ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: One-finger Move & Pointer Accumulation
  {
    const moves = [];
    const engine = new TouchpadGestureEngine({
      onMove: (dx, dy) => moves.push({ dx, dy }),
      onScroll: () => {},
      onLeftClick: () => {},
      onRightClick: () => {},
      onDoubleClick: () => {},
      onDragStart: () => {},
      onDragEnd: () => {},
    }, { moveThresholdPx: 4, sensitivity: 1.0, pointerAcceleration: false });

    // Touch start at 100, 100
    engine.handleTouchStart(createTouchEvent('touchstart', [{ id: 1, x: 100, y: 100 }]));
    // Move below threshold (e.g. 2px)
    engine.handleTouchMove(createTouchEvent('touchmove', [{ id: 1, x: 102, y: 100 }]));
    assert(moves.length === 0, "Test 1a: Movement below threshold triggers 0 move events");

    // Move above threshold (e.g. 10px)
    engine.handleTouchMove(createTouchEvent('touchmove', [{ id: 1, x: 110, y: 100 }]));
    assert(moves.length > 0 && moves[0].dx > 0, "Test 1b: Movement exceeding threshold dispatches onMove with positive dx");

    engine.handleTouchEnd(createTouchEvent('touchend', [{ id: 1, x: 110, y: 100 }]));
  }

  // TEST 2: Single Tap to Left Click
  {
    let leftClicked = false;
    const engine = new TouchpadGestureEngine({
      onMove: () => {},
      onScroll: () => {},
      onLeftClick: () => { leftClicked = true; },
      onRightClick: () => {},
      onDoubleClick: () => {},
      onDragStart: () => {},
      onDragEnd: () => {},
    }, { tapTimeoutMs: 50, tapToClickEnabled: true });

    engine.handleTouchStart(createTouchEvent('touchstart', [{ id: 1, x: 100, y: 100 }]));
    // End touch immediately without movement
    engine.handleTouchEnd(createTouchEvent('touchend', [{ id: 1, x: 100, y: 100 }]));

    await new Promise(r => setTimeout(r, 70));
    assert(leftClicked === true, "Test 2: Single tap without movement dispatches onLeftClick after timeout");
  }

  // TEST 3: Double Tap to Double Click
  {
    let doubleClicked = false;
    let leftClickCount = 0;
    const engine = new TouchpadGestureEngine({
      onMove: () => {},
      onScroll: () => {},
      onLeftClick: () => { leftClickCount++; },
      onRightClick: () => {},
      onDoubleClick: () => { doubleClicked = true; },
      onDragStart: () => {},
      onDragEnd: () => {},
    }, { tapTimeoutMs: 100, doubleTapTimeoutMs: 250, tapToClickEnabled: true });

    // First tap
    engine.handleTouchStart(createTouchEvent('touchstart', [{ id: 1, x: 100, y: 100 }]));
    engine.handleTouchEnd(createTouchEvent('touchend', [{ id: 1, x: 100, y: 100 }]));

    await new Promise(r => setTimeout(r, 30));

    // Second tap within window
    engine.handleTouchStart(createTouchEvent('touchstart', [{ id: 1, x: 100, y: 100 }]));
    engine.handleTouchEnd(createTouchEvent('touchend', [{ id: 1, x: 100, y: 100 }]));

    assert(doubleClicked === true, "Test 3: Double tap within doubleTapTimeoutMs triggers onDoubleClick");
  }

  // TEST 4: Two-finger Tap to Right Click
  {
    let rightClicked = false;
    const engine = new TouchpadGestureEngine({
      onMove: () => {},
      onScroll: () => {},
      onLeftClick: () => {},
      onRightClick: () => { rightClicked = true; },
      onDoubleClick: () => {},
      onDragStart: () => {},
      onDragEnd: () => {},
    }, { tapToClickEnabled: true });

    // 2-finger touch start
    engine.handleTouchStart(createTouchEvent('touchstart', [
      { id: 1, x: 100, y: 100 },
      { id: 2, x: 150, y: 100 }
    ]));
    // 2-finger release without move
    engine.handleTouchEnd(createTouchEvent('touchend', [
      { id: 1, x: 100, y: 100 },
      { id: 2, x: 150, y: 100 }
    ]));

    assert(rightClicked === true, "Test 4: Two-finger stationary tap triggers onRightClick");
  }

  // TEST 5: Two-finger Scroll (Natural vs Traditional)
  {
    const scrolls = [];
    const engine = new TouchpadGestureEngine({
      onMove: () => {},
      onScroll: (v, h) => scrolls.push({ v, h }),
      onLeftClick: () => {},
      onRightClick: () => {},
      onDoubleClick: () => {},
      onDragStart: () => {},
      onDragEnd: () => {},
    }, { naturalScroll: true, scrollSensitivity: 1.0 });

    // 2-finger start
    engine.handleTouchStart(createTouchEvent('touchstart', [
      { id: 1, x: 100, y: 100 },
      { id: 2, x: 150, y: 100 }
    ]));
    // Move down (deltaY = +20) -> With natural scroll, scrollV should be negative
    engine.handleTouchMove(createTouchEvent('touchmove', [
      { id: 1, x: 100, y: 120 },
      { id: 2, x: 150, y: 120 }
    ]));

    assert(scrolls.length > 0 && scrolls[0].v < 0, "Test 5: Two-finger downward gesture produces negative vScroll in natural scrolling mode");
    engine.handleTouchEnd(createTouchEvent('touchend', [
      { id: 1, x: 100, y: 120 },
      { id: 2, x: 150, y: 120 }
    ]));
  }

  // TEST 6: Long Press Drag & Drop
  {
    let dragStarted = false;
    let dragEnded = false;
    const engine = new TouchpadGestureEngine({
      onMove: () => {},
      onScroll: () => {},
      onLeftClick: () => {},
      onRightClick: () => {},
      onDoubleClick: () => {},
      onDragStart: () => { dragStarted = true; },
      onDragEnd: () => { dragEnded = true; },
    }, { dragHoldTimeoutMs: 60 });

    // Touch start
    engine.handleTouchStart(createTouchEvent('touchstart', [{ id: 1, x: 100, y: 100 }]));
    await new Promise(r => setTimeout(r, 80));
    assert(dragStarted === true, "Test 6a: Long press without movement triggers onDragStart");

    // Drag release
    engine.handleTouchEnd(createTouchEvent('touchend', [{ id: 1, x: 100, y: 100 }]));
    assert(dragEnded === true, "Test 6b: Touch release after drag engages triggers onDragEnd");
  }

  console.log(`\nRESULTS: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
