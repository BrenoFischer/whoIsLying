#!/usr/bin/env node
/**
 * export-tests.js
 *
 * Parses test_plans.md and exports only NEW test cases (not yet in
 * exported_tests.json) to a Qase-ready JSON file.
 *
 * Format verified against a real Qase export (WHOISLYING-2026-04-12.json):
 *   { "suites": [ { "id", "title", "cases": [ { ...case fields } ] } ] }
 *
 * Usage:
 *   node scripts/export-tests.js
 *
 * Output:
 *   qase_import_<timestamp>.json — import in Qase via Test Cases → Import → JSON
 *   scripts/exported_tests.json — tracks which IDs were already exported
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEST_PLANS_PATH = path.join(ROOT, 'test_plans.md');
const EXPORTED_PATH = path.join(__dirname, 'exported_tests.json');

// ---------------------------------------------------------------------------
// Parse test_plans.md
// ---------------------------------------------------------------------------
function parseTestPlans(content) {
  const tests = [];
  let currentPlan = '';

  for (const line of content.split('\n')) {
    // Stop at the execution tracking table — TC ids there are duplicates
    if (/^##\s+Test Execution Tracking/.test(line)) break;

    // Detect test plan section headers e.g. "## Test Plan 3 — Word and Category Selection"
    const planMatch = line.match(/^##\s+Test Plan\s+\d+\s+[—-]+\s+(.+)/);
    if (planMatch) {
      currentPlan = planMatch[1].trim();
      continue;
    }

    // Detect table rows that start with a TC id e.g. "| TC-003.2 | ... |"
    const rowMatch = line.match(/^\|\s*(TC-\d{3}\.\d+)\s*\|(.+)/);
    if (!rowMatch) continue;

    const id = rowMatch[1];
    const cells = rowMatch[2]
      .split('|')
      .map(c => c.trim())
      .filter((_, i) => i < 4); // summary, steps, expected, priority

    if (cells.length < 4) continue;

    const [summary, steps, expected, priority] = cells;
    tests.push({ id, plan: currentPlan, summary, steps, expected, priority });
  }

  return tests;
}

// ---------------------------------------------------------------------------
// Load / save exported IDs
// ---------------------------------------------------------------------------
function loadExported() {
  if (!fs.existsSync(EXPORTED_PATH)) return new Set();
  const data = JSON.parse(fs.readFileSync(EXPORTED_PATH, 'utf8'));
  return new Set(data.exported || []);
}

function saveExported(exportedSet) {
  const data = { exported: [...exportedSet].sort() };
  fs.writeFileSync(EXPORTED_PATH, JSON.stringify(data, null, 2));
}

// ---------------------------------------------------------------------------
// Qase field helpers
// ---------------------------------------------------------------------------

// Qase priority accepted values: undefined, high, medium, low
// 'critical' is a severity value in Qase — map it to 'high'
const PRIORITY_MAP = {
  critical: 'high',
  high:     'high',
  medium:   'medium',
  low:      'low',
};

function mapPriority(raw) {
  return PRIORITY_MAP[raw.toLowerCase()] ?? 'undefined';
}

// Qase severity accepted values: trivial, minor, normal, major, critical, blocker
// Map our test plan priorities to the closest severity equivalent
const SEVERITY_MAP = {
  critical: 'critical',
  high:     'major',
  medium:   'normal',
  low:      'minor',
};

function mapSeverity(raw) {
  return SEVERITY_MAP[raw.toLowerCase()] ?? 'normal';
}

function buildCase(test, caseId) {
  return {
    id: caseId,
    title: `${test.id} ${test.summary}`,
    description: null,
    preconditions: null,
    postconditions: null,
    priority: mapPriority(test.priority),
    severity: mapSeverity(test.priority),
    type: 'regression',
    behavior: 'positive',
    automation: 'is-not-automated',
    status: 'actual',
    is_flaky: 'no',
    layer: 'unknown',
    milestone: null,
    custom_fields: [],
    steps_type: 'classic',
    steps: [
      {
        position: 1,
        action: test.steps,
        expected_result: test.expected,
        data: '',
        steps: [],
      },
    ],
    tags: [],
    params: [],
    is_muted: 'no',
  };
}

function buildJson(tests) {
  // Group tests by suite (test plan), preserving order
  const suiteMap = new Map();
  tests.forEach(test => {
    if (!suiteMap.has(test.plan)) suiteMap.set(test.plan, []);
    suiteMap.get(test.plan).push(test);
  });

  let caseId = 1;
  let suiteId = 1;

  const suites = [...suiteMap.entries()].map(([planName, planTests]) => ({
    id: suiteId++,
    title: planName,
    description: null,
    preconditions: null,
    suites: [],
    cases: planTests.map(t => buildCase(t, caseId++)),
  }));

  return JSON.stringify({ suites }, null, 2);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  if (!fs.existsSync(TEST_PLANS_PATH)) {
    console.error('test_plans.md not found at', TEST_PLANS_PATH);
    process.exit(1);
  }

  const content = fs.readFileSync(TEST_PLANS_PATH, 'utf8');
  const allTests = parseTestPlans(content);
  const exported = loadExported();

  const newTests = allTests.filter(t => !exported.has(t.id));

  console.log(`Found ${allTests.length} test cases. ${exported.size} already exported, ${newTests.length} new.`);

  if (newTests.length === 0) {
    console.log('Nothing to export.');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPath = path.join(ROOT, `qase_import_${timestamp}.json`);

  fs.writeFileSync(outputPath, buildJson(newTests), 'utf8');
  console.log(`Exported ${newTests.length} test case(s) to: ${path.basename(outputPath)}`);

  newTests.forEach(t => exported.add(t.id));
  saveExported(exported);
  console.log('exported_tests.json updated.');
}

main();
