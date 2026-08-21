"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const DEFAULT_BASE_URL = "http://localhost:3000";
const ROUTES = ["/", "/catalog.html", "/api/books"];
const baseUrl = normalizeBaseUrl(process.env.BASE_URL || DEFAULT_BASE_URL);
const sequentialRequestsPerRoute = readPositiveInteger("SEQUENTIAL_REQUESTS", 10);
const parallelRequestsPerRoute = readPositiveInteger("PARALLEL_REQUESTS", 20);
const timeoutMs = readPositiveInteger("REQUEST_TIMEOUT_MS", 5000);
const outputPath = path.resolve(
    process.cwd(),
    process.env.PERF_OUTPUT || "performance/results/latest.json"
);

async function main() {
    const generatedAt = new Date().toISOString();

    try {
        await checkServerAvailability();
    } catch (error) {
        const unavailableResult = {
            schemaVersion: 1,
            generatedAt,
            baseUrl,
            status: "server-unavailable",
            error: error.message,
        };
        await saveResult(unavailableResult);
        throw new Error(`Server is unavailable at ${baseUrl}: ${error.message}`);
    }

    const sequentialStartedAt = performance.now();
    const sequentialResults = [];
    for (let requestIndex = 0; requestIndex < sequentialRequestsPerRoute; requestIndex += 1) {
        for (const route of ROUTES) {
            sequentialResults.push(await makeRequest(route, "sequential"));
        }
    }
    const sequentialDurationMs = performance.now() - sequentialStartedAt;

    const parallelTargets = [];
    for (let requestIndex = 0; requestIndex < parallelRequestsPerRoute; requestIndex += 1) {
        for (const route of ROUTES) {
            parallelTargets.push(route);
        }
    }

    const parallelStartedAt = performance.now();
    const parallelResults = await Promise.all(
        parallelTargets.map((route) => makeRequest(route, "parallel"))
    );
    const parallelDurationMs = performance.now() - parallelStartedAt;

    const allResults = [...sequentialResults, ...parallelResults];
    const totalDurationMs = sequentialDurationMs + parallelDurationMs;
    const result = {
        schemaVersion: 1,
        generatedAt,
        baseUrl,
        status: "completed",
        scenario: {
            routes: ROUTES,
            sequentialRequestsPerRoute,
            parallelRequestsPerRoute,
            totalPlannedRequests: ROUTES.length * (
                sequentialRequestsPerRoute + parallelRequestsPerRoute
            ),
            requestTimeoutMs: timeoutMs,
        },
        overall: summarize(allResults, totalDurationMs),
        stages: {
            sequential: summarize(sequentialResults, sequentialDurationMs),
            parallel: summarize(parallelResults, parallelDurationMs),
        },
        byRoute: Object.fromEntries(
            ROUTES.map((route) => [
                route,
                summarize(allResults.filter((item) => item.route === route)),
            ])
        ),
    };

    await saveResult(result);
    printSummary(result);
}

async function checkServerAvailability() {
    const response = await fetch(new URL("/", baseUrl), {
        signal: AbortSignal.timeout(timeoutMs),
    });
    await response.arrayBuffer();

    if (!response.ok) {
        throw new Error(`availability check returned HTTP ${response.status}`);
    }
}

async function makeRequest(route, stage) {
    const startedAt = performance.now();

    try {
        const response = await fetch(new URL(route, baseUrl), {
            headers: { accept: route.startsWith("/api/") ? "application/json" : "text/html" },
            signal: AbortSignal.timeout(timeoutMs),
        });
        await response.arrayBuffer();

        return {
            route,
            stage,
            successful: response.ok,
            statusCode: response.status,
            durationMs: performance.now() - startedAt,
        };
    } catch (error) {
        return {
            route,
            stage,
            successful: false,
            statusCode: null,
            durationMs: performance.now() - startedAt,
            error: error.message,
        };
    }
}

function summarize(results, totalDurationMs) {
    const durations = results.map((item) => item.durationMs).sort((a, b) => a - b);
    const successfulRequests = results.filter((item) => item.successful).length;
    const summary = {
        requests: results.length,
        successfulRequests,
        failedRequests: results.length - successfulRequests,
        minResponseTimeMs: round(durations[0]),
        averageResponseTimeMs: round(average(durations)),
        p95ResponseTimeMs: round(percentile(durations, 0.95)),
        maxResponseTimeMs: round(durations.at(-1)),
    };

    if (totalDurationMs !== undefined) {
        summary.totalDurationMs = round(totalDurationMs);
        summary.approximateRequestsPerSecond = round(
            totalDurationMs > 0 ? results.length / (totalDurationMs / 1000) : 0
        );
    }

    return summary;
}

function average(values) {
    if (values.length === 0) {
        return null;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values, fraction) {
    if (values.length === 0) {
        return null;
    }

    return values[Math.ceil(values.length * fraction) - 1];
}

function round(value) {
    return value === undefined || value === null ? null : Number(value.toFixed(3));
}

function normalizeBaseUrl(value) {
    const parsed = new URL(value);
    parsed.pathname = parsed.pathname.replace(/\/$/, "");
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
}

function readPositiveInteger(name, fallback) {
    const rawValue = process.env[name];
    if (rawValue === undefined) {
        return fallback;
    }

    const value = Number(rawValue);
    if (!Number.isInteger(value) || value < 1) {
        throw new Error(`${name} must be a positive integer`);
    }

    return value;
}

async function saveResult(result) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    console.log(`Result saved to ${path.relative(process.cwd(), outputPath)}`);
}

function printSummary(result) {
    console.log(`BASE_URL: ${result.baseUrl}`);
    console.log("Scenario:", result.scenario);
    console.table([
        { scope: "overall", ...result.overall },
        ...ROUTES.map((route) => ({ scope: route, ...result.byRoute[route] })),
    ]);
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
