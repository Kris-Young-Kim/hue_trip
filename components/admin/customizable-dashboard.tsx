/**
 * @file customizable-dashboard.tsx
 * @description 커스터마이징 가능한 대시보드 컴포넌트
 */

"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, GripVertical, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getDashboardDetail, type DashboardDetail } from "@/actions/admin-dashboard/get-dashboard-detail";
import { updateDashboardWidgets } from "@/actions/admin-dashboard/update-dashboard-widgets";
import { TimeSeriesChart } from "@/components/admin/time-series-chart";
import { RegionTypeBarChart } from "@/components/admin/region-type-bar-chart";
import { PieChartComponent } from "@/components/admin/pie-chart";
import { UserBehaviorAnalytics } from "@/components/admin/user-behavior-analytics";
import { DetailedRegionTypeStats } from "@/components/admin/detailed-region-type-stats";
import { PerformanceMonitoring } from "@/components/admin/performance-monitoring";
import { CostAnalysis } from "@/components/admin/cost-analysis";
import { Predictions } from "@/components/admin/predictions";
import { ReportGenerator } from "@/components/admin/report-generator";
import { AlertSystem } from "@/components/admin/alert-system";
import { DataExport } from "@/components/admin/data-export";
import { WIDGET_TYPES } from "@/lib/utils/dashboard";

interface CustomizableDashboardProps {
  dashboardId: string;
  onWidgetRemove?: (widgetId: string) => void;
}

export function CustomizableDashboard({
  dashboardId,
  onWidgetRemove,
}: CustomizableDashboardProps) {
  const [dashboard, setDashboard] = useState<DashboardDetail | null>(null);
  const [widgets, setWidgets] = useState<DashboardDetail["widgets"]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadDashboard();
  }, [dashboardId]);

  const loadDashboard = async () => {
    console.group("[CustomizableDashboard] 대시보드 로드");
    setLoading(true);
    const result = await getDashboardDetail(dashboardId);
    if (result.success && result.dashboard) {
      setDashboard(result.dashboard);
      setWidgets(result.dashboard.widgets);
    } else {
      toast.error(result.error || "대시보드를 불러오는데 실패했습니다.");
    }
    setLoading(false);
    console.groupEnd();
  };

  const handleWidgetToggle = (widgetId: string) => {
    const updatedWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
    );
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  };

  const handleWidgetRemove = (widgetId: string) => {
    const updatedWidgets = widgets.filter((w) => w.id !== widgetId);
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
    onWidgetRemove?.(widgetId);
  };

  const handleWidgetReorder = (fromIndex: number, toIndex: number) => {
    const updatedWidgets = [...widgets];
    const [moved] = updatedWidgets.splice(fromIndex, 1);
    updatedWidgets.splice(toIndex, 0, moved);
    // 위치 업데이트
    updatedWidgets.forEach((w, index) => {
      w.position = index;
    });
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  };

  const saveWidgets = (widgetsToSave: DashboardDetail["widgets"]) => {
    startTransition(async () => {
      console.group("[CustomizableDashboard] 위젯 저장");
      const result = await updateDashboardWidgets({
        dashboardId,
        widgets: widgetsToSave.map((w) => ({
          widgetType: w.widgetType,
          widgetConfig: w.widgetConfig,
          position: w.position,
          isVisible: w.isVisible,
        })),
      });

      if (result.success) {
        toast.success("위젯이 저장되었습니다.");
      } else {
        toast.error(result.error || "위젯 저장에 실패했습니다.");
        // 롤백
        loadDashboard();
      }
      console.groupEnd();
    });
  };

  const renderWidget = (widget: DashboardDetail["widgets"][0]) => {
    if (!widget.isVisible) return null;

    const widgetProps = {
      key: widget.id,
      className: "relative",
    };

    switch (widget.widgetType) {
      case "time_series":
        return (
          <div {...widgetProps}>
            <TimeSeriesChart data={[]} title="시간대별 통계 추이" />
          </div>
        );
      case "region_type":
        return (
          <div {...widgetProps}>
            <RegionTypeBarChart regionStats={[]} typeStats={[]} />
          </div>
        );
      case "performance":
        return (
          <div {...widgetProps}>
            <PerformanceMonitoring />
          </div>
        );
      case "cost":
        return (
          <div {...widgetProps}>
            <CostAnalysis />
          </div>
        );
      case "user_behavior":
        return (
          <div {...widgetProps}>
            <UserBehaviorAnalytics />
          </div>
        );
      case "predictions":
        return (
          <div {...widgetProps}>
            <Predictions />
          </div>
        );
      case "report":
        return (
          <div {...widgetProps}>
            <ReportGenerator />
          </div>
        );
      case "alert":
        return (
          <div {...widgetProps}>
            <AlertSystem />
          </div>
        );
      case "data_export":
        return (
          <div {...widgetProps}>
            <DataExport />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        대시보드를 불러오는 중...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        대시보드를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dashboard.name}</CardTitle>
          {dashboard.description && (
            <p className="text-sm text-gray-500">{dashboard.description}</p>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets
          .sort((a, b) => a.position - b.position)
          .map((widget) => (
            <Card key={widget.id} className="relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {WIDGET_TYPES.find((t) => t.id === widget.widgetType)?.name || widget.widgetType}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleWidgetToggle(widget.id)}
                  >
                    {widget.isVisible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleWidgetRemove(widget.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>{renderWidget(widget)}</CardContent>
            </Card>
          ))}
      </div>

      {widgets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          위젯이 없습니다. 위젯을 추가하세요.
        </div>
      )}
    </div>
  );
}

