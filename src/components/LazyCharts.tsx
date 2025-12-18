import React, { lazy, Suspense } from 'react';

// Lazy-load all recharts components to defer bundle until page renders
const LazyLineChart = lazy(() => import('recharts').then(mod => ({ default: mod.LineChart })));
const LazyLine = lazy(() => import('recharts').then(mod => ({ default: mod.Line })));
const LazyAreaChart = lazy(() => import('recharts').then(mod => ({ default: mod.AreaChart })));
const LazyArea = lazy(() => import('recharts').then(mod => ({ default: mod.Area })));
const LazyBarChart = lazy(() => import('recharts').then(mod => ({ default: mod.BarChart })));
const LazyBar = lazy(() => import('recharts').then(mod => ({ default: mod.Bar })));
const LazyPieChart = lazy(() => import('recharts').then(mod => ({ default: mod.PieChart })));
const LazyPie = lazy(() => import('recharts').then(mod => ({ default: mod.Pie })));
const LazyCell = lazy(() => import('recharts').then(mod => ({ default: mod.Cell })));
const LazyXAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
const LazyYAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
const LazyCartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
const LazyTooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
const LazyLegend = lazy(() => import('recharts').then(mod => ({ default: mod.Legend })));
const LazyResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));

// Wrapper to suppress Suspense warnings during SSR
const ChartLoadingFallback = () => null;

export {
  LazyLineChart as LineChart,
  LazyLine as Line,
  LazyAreaChart as AreaChart,
  LazyArea as Area,
  LazyBarChart as BarChart,
  LazyBar as Bar,
  LazyPieChart as PieChart,
  LazyPie as Pie,
  LazyCell as Cell,
  LazyXAxis as XAxis,
  LazyYAxis as YAxis,
  LazyCartesianGrid as CartesianGrid,
  LazyTooltip as Tooltip,
  LazyLegend as Legend,
  LazyResponsiveContainer as ResponsiveContainer,
  Suspense,
  ChartLoadingFallback,
};
