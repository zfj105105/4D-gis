import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from './ui/dialog';
import {Button} from './ui/button';
import {Badge} from './ui/badge';
import {Separator} from './ui/separator';
import {ScrollArea} from './ui/scroll-area';
import {CalendarDays, Clock, Info, MapPin, Mountain, Eye, ExternalLink} from 'lucide-react';
import type {Marker} from '../api/marker';
import {ReactNode} from "react";

interface SharedMarkerDialogProps {
    marker: Marker | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddToMap?: (marker: Marker) => void;
}

// 辅助组件，用于显示详情项
const DetailItem = ({icon, label, value}: { icon: ReactNode, label: string, value: ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-1">{icon}</div>
        <div className="flex-1">
            <h4 className="text-xs text-muted-foreground">{label}</h4>
            <p className="text-sm">{value}</p>
        </div>
    </div>
);

export function SharedMarkerDialog({
    marker,
    open,
    onOpenChange,
    onAddToMap
}: SharedMarkerDialogProps) {
    if (!marker) return null;

    const formatDate = (date?: Date) => {
        return date ? date.toLocaleString('zh-CN', {dateStyle: 'medium', timeStyle: 'short'}) : 'N/A';
    };

    const color = marker.type?.color ?? '#6b7280';

    const handleAddToMap = () => {
        if (onAddToMap) {
            onAddToMap(marker);
        }
        onOpenChange(false);
    };

    const handleViewOnMap = () => {
        // 清除URL参数但保持标记在地图上可见
        const url = new URL(window.location.href);
        url.searchParams.delete('shared');
        window.history.replaceState({}, '', url.toString());

        // 可以在这里添加地图定位到标记位置的逻辑
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 gap-0 flex flex-col">
                {/* 头部 */}
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="flex items-center gap-2">
                        <ExternalLink className="h-5 w-5" />
                        分享的标记
                    </DialogTitle>
                    <DialogDescription>
                        有人与您分享了这个标记
                    </DialogDescription>
                </DialogHeader>

                <Separator/>

                {/* 详细信息滚动区 */}
                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-4">
                        {/* 标记基本信息 */}
                        <div className="p-4 border rounded-lg bg-primary/5">
                            <div className="flex items-center gap-3 mb-2">
                                <div style={{backgroundColor: color}} className="h-4 w-4 rounded-full"/>
                                <h3 className="font-medium">{marker.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{marker.type?.name || '未分类'}</Badge>
                                {marker.createdBy?.username && (
                                    <span className="text-sm text-muted-foreground">
                                        by {marker.createdBy.username}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 描述 */}
                        {marker.description && (
                            <DetailItem
                                icon={<Info className="h-4 w-4"/>}
                                label="描述"
                                value={marker.description}
                            />
                        )}

                        {/* 位置 */}
                        <DetailItem
                            icon={<MapPin className="h-4 w-4"/>}
                            label="位置"
                            value={`纬度: ${marker.latitude.toFixed(6)}, 经度: ${marker.longitude.toFixed(6)}`}
                        />

                        {/* 高度 */}
                        {marker.altitude !== undefined && (
                            <DetailItem
                                icon={<Mountain className="h-4 w-4"/>}
                                label="海拔"
                                value={`${marker.altitude} 米`}
                            />
                        )}

                        {/* 时间范围 */}
                        <DetailItem
                            icon={<Clock className="h-4 w-4"/>}
                            label="时间范围"
                            value={
                                <>
                                    <p>开始: {formatDate(marker.time_start)}</p>
                                    {marker.time_end && <p>结束: {formatDate(marker.time_end)}</p>}
                                </>
                            }
                        />

                        {/* 可见性 */}
                        <DetailItem
                            icon={<Eye className="h-4 w-4"/>}
                            label="可见性"
                            value={marker.visibility || 'public'}
                        />

                        {/* 分享信息 */}
                        <Separator/>
                        <DetailItem
                            icon={<CalendarDays className="h-4 w-4"/>}
                            label="分享信息"
                            value={
                                <>
                                    <p>查看时间: {formatDate(new Date())}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        这是一个通过链接分享的标记
                                    </p>
                                </>
                            }
                        />
                    </div>
                </ScrollArea>

                <Separator/>

                {/* 底部操作按钮 */}
                <div className="flex items-center gap-2 p-6 pt-4">
                    <Button onClick={handleViewOnMap} variant="default" className="flex-1">
                        在地图上查看
                    </Button>
                    {onAddToMap && (
                        <Button onClick={handleAddToMap} variant="outline" className="flex-1">
                            添加到我的标记
                        </Button>
                    )}
                    <Button onClick={() => onOpenChange(false)} variant="outline">
                        关闭
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
