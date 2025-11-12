import {Dialog, DialogContent, DialogHeader, DialogTitle} from './ui/dialog';
import {Button} from './ui/button';
import {Badge} from './ui/badge';
import {Separator} from './ui/separator';
import {ScrollArea} from './ui/scroll-area';
import {CalendarDays, Clock, Edit2, Eye, Info, MapPin, Mountain, Share2, Trash2} from 'lucide-react';
import type {Marker} from '../api/marker';
import {ReactNode} from "react";

interface MarkerDetailsDialogProps {
    marker: Marker | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: () => void;
    onShare: () => void;
    onDelete: () => void;
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

export function MarkerDetailsDialog({
                                        marker,
                                        open,
                                        onOpenChange,
                                        onEdit,
                                        onShare,
                                        onDelete
                                    }: MarkerDetailsDialogProps) {
    if (!marker) return null;

    const formatDate = (date?: Date) => {
        return date ? date.toLocaleString('en-US', {dateStyle: 'medium', timeStyle: 'short'}) : 'N/A';
    };

    const color = marker.type?.color ?? '#6b7280';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 gap-0 flex flex-col">
                {/* 头部 */}
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle>{marker.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                        <div style={{backgroundColor: color}} className="h-3 w-3 rounded-full"/>
                        <Badge variant="secondary">{marker.type?.name || 'Uncategorized'}</Badge>
                        <span className="text-sm text-muted-foreground">
              {marker.createdBy?.username || 'Unknown user'}
            </span>
                    </div>
                </DialogHeader>

                <Separator/>

                {/* 详细信息滚动区 */}
                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-4">

                        {/* 描述 */}
                        {marker.description && (
                            <DetailItem
                                icon={<Info className="h-4 w-4"/>}
                                label="Description"
                                value={marker.description}
                            />
                        )}

                        {/* 位置 */}
                        <DetailItem
                            icon={<MapPin className="h-4 w-4"/>}
                            label="Location"
                            value={`Lat: ${marker.latitude.toFixed(6)}, Lon: ${marker.longitude.toFixed(6)}`}
                        />

                        {/* 高度 */}
                        {marker.altitude !== undefined && (
                            <DetailItem
                                icon={<Mountain className="h-4 w-4"/>}
                                label="Altitude"
                                value={`${marker.altitude} meters`}
                            />
                        )}

                        {/* 时间范围 */}
                        <DetailItem
                            icon={<Clock className="h-4 w-4"/>}
                            label="Time Range"
                            value={
                                <>
                                    <p>Start: {formatDate(marker.time_start)}</p>
                                    <p>End: {formatDate(marker.time_end)}</p>
                                </>
                            }
                        />

                        {/* 可见性 */}
                        <DetailItem
                            icon={<Eye className="h-4 w-4"/>}
                            label="Visibility"
                            value={marker.visibility || 'N/A'}
                        />

                        <Separator/>

                        {/* 元数据 */}
                        <DetailItem
                            icon={<CalendarDays className="h-4 w-4"/>}
                            label="Metadata"
                            value={
                                <>
                                    <p>Created: {formatDate(marker.createdAt)}</p>
                                    <p>Updated: {formatDate(marker.updatedAt)}</p>
                                </>
                            }
                        />

                    </div>
                </ScrollArea>

                <Separator/>

                {/* 底部操作按钮 */}
                <div className="flex items-center gap-2 p-6 pt-4">
                    <Button onClick={onEdit} variant="outline" className="flex-1">
                        <Edit2 className="h-4 w-4 mr-2"/>
                        Edit
                    </Button>
                    <Button onClick={onShare} variant="outline" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2"/>
                        Share
                    </Button>
                    <Button onClick={onDelete} variant="outline"
                            className="flex-1 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2"/>
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}