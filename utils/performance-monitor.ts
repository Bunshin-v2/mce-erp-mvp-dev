// Performance monitoring and reporting

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];

export const performanceMonitor = {
  // Mark performance events
  mark: (name: string, label?: string) => {
    const key = label ? `${name}-${label}` : name;
    if (typeof performance !== 'undefined') {
      performance.mark(key);
    }
  },

  // Measure time between two marks
  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof performance === 'undefined') return 0;
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      const measure = entries[entries.length - 1] as PerformanceMeasure;

      metrics.push({
        name,
        value: measure.duration,
        unit: 'ms',
        timestamp: Date.now(),
      });

      return measure.duration;
    } catch (err) {
      return 0;
    }
  },

  // Get metrics summary
  getSummary: () => {
    if (metrics.length === 0) return null;
    return {
      totalMetrics: metrics.length,
      averageTime: metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length,
      slowestMetric: metrics.reduce((max, m) => (m.value > max.value ? m : max), metrics[0]),
      timestamp: new Date().toISOString(),
    };
  },

  // Clear metrics
  clear: () => {
    metrics.length = 0;
  },
};
