// 离线标记面板组件
import { OfflineMarker } from '../utils/offlineStorage';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { CloudOff, Upload, Trash2, MapPin } from 'lucide-react';
import { Separator } from './ui/separator';

interface OfflineMarkersPanelProps {
    offlineMarkers: OfflineMarker[];
    onSyncMarker: (marker: OfflineMarker) => void;
    onSyncAll: () => void;
    onDeleteOfflineMarker: (localId: string) => void;
    isOnline: boolean;
}

export function OfflineMarkersPanel({
    offlineMarkers,
    onSyncMarker,
    onSyncAll,
    onDeleteOfflineMarker,
    isOnline
}: OfflineMarkersPanelProps) {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (offlineMarkers.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                <CloudOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无离线标记</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium">离线标记</h3>
                    <Badge variant={isOnline ? "default" : "destructive"}>
                        {isOnline ? "在线" : "离线"}
                    </Badge>
                </div>

                {offlineMarkers.length > 0 && isOnline && (
                    <Button
                        size="sm"
                        onClick={onSyncAll}
                        className="w-full"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        上传全部 ({offlineMarkers.length})
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                    {offlineMarkers.map((marker) => (
                        <Card key={marker.localId} className="p-3 space-y-2">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                        <h4 className="font-medium text-sm truncate">
                                            {marker.title}
                                        </h4>
                                    </div>
                                    {marker.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {marker.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground space-y-1">
                                <div>
                                    位置: {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
                                </div>
                                <div>
                                    创建时间: {formatDate(marker.createdAt)}
                                </div>
                            </div>

                            <Separator className="my-2" />

                            <div className="flex gap-2">
                                {isOnline && (
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="flex-1"
                                        onClick={() => onSyncMarker(marker)}
                                    >
                                        <Upload className="h-3 w-3 mr-1" />
                                        上传
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className={isOnline ? "flex-1" : "w-full"}
                                    onClick={() => onDeleteOfflineMarker(marker.localId)}
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    删除
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
