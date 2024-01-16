import { basename } from "node:path";
import { describe, expect, test, vi } from "vitest";

import { reportWebVitals } from "./reportWebVitals";

const mockWebVitals = vi.hoisted(() => ({
	onCLS: vi.fn(),
	onFID: vi.fn(),
	onFCP: vi.fn(),
	onLCP: vi.fn(),
	onTTFB: vi.fn(),
}));
vi.mock("web-vitals", () => mockWebVitals);

describe(basename(import.meta.url), () => {
	test("registers onPerfEntry callback web-vitals event handlers", () => {
		const mockOnPerfEntry = vi.fn();

		reportWebVitals(mockOnPerfEntry);
		expect(mockWebVitals.onCLS).toHaveBeenCalledWith(mockOnPerfEntry);
		expect(mockWebVitals.onFID).toHaveBeenCalledWith(mockOnPerfEntry);
		expect(mockWebVitals.onFCP).toHaveBeenCalledWith(mockOnPerfEntry);
		expect(mockWebVitals.onLCP).toHaveBeenCalledWith(mockOnPerfEntry);
		expect(mockWebVitals.onTTFB).toHaveBeenCalledWith(mockOnPerfEntry);
	});

	test("does not throw an error when onPerfEntry is not provided", () => {
		expect(() => {
			reportWebVitals();
		}).not.toThrow();
	});
});
