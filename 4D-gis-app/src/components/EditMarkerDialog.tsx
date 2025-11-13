import {Dialog, DialogContent, DialogHeader, DialogTitle} from './ui/dialog';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Textarea} from './ui/textarea';
import {Label} from './ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {useState, useEffect} from 'react';
import type {Marker, MarkerUpdateRequest, Visibility} from '../api/marker';

interface EditMarkerDialogProps {
    marker: Marker | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdateMarker: (markerId: string, markerData: MarkerUpdateRequest) => void;
}

export function EditMarkerDialog({
    marker,
    open,
    onOpenChange,
    onUpdateMarker
}: EditMarkerDialogProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        latitude: 0,
        longitude: 0,
        altitude: 0,
        time_start: '',
        time_end: '',
        visibility: 'public' as Visibility
    });

    useEffect(() => {
        if (marker) {
            setFormData({
                title: marker.title || '',
                description: marker.description || '',
                latitude: marker.latitude || 0,
                longitude: marker.longitude || 0,
                altitude: marker.altitude || 0,
                time_start: marker.time_start ? marker.time_start.toISOString().slice(0, 16) : '',
                time_end: marker.time_end ? marker.time_end.toISOString().slice(0, 16) : '',
                visibility: marker.visibility || 'public'
            });
        }
    }, [marker]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!marker) return;

        const updateData: MarkerUpdateRequest = {
            title: formData.title,
            description: formData.description || undefined,
            latitude: formData.latitude,
            longitude: formData.longitude,
            altitude: formData.altitude || undefined,
            time_start: new Date(formData.time_start),
            time_end: formData.time_end ? new Date(formData.time_end) : undefined,
            visibility: formData.visibility
        };

        onUpdateMarker(marker.id, updateData);
    };

    if (!marker) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>编辑标记</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">标题</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">描述</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="latitude">纬度</Label>
                            <Input
                                id="latitude"
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="longitude">经度</Label>
                            <Input
                                id="longitude"
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="altitude">高度（米）</Label>
                        <Input
                            id="altitude"
                            type="number"
                            value={formData.altitude}
                            onChange={(e) => setFormData({...formData, altitude: parseFloat(e.target.value)})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="time_start">开始时间</Label>
                            <Input
                                id="time_start"
                                type="datetime-local"
                                value={formData.time_start}
                                onChange={(e) => setFormData({...formData, time_start: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="time_end">结束时间</Label>
                            <Input
                                id="time_end"
                                type="datetime-local"
                                value={formData.time_end}
                                onChange={(e) => setFormData({...formData, time_end: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="visibility">可见性</Label>
                        <Select value={formData.visibility} onValueChange={(value) => setFormData({...formData, visibility: value as Visibility})}>
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">公开</SelectItem>
                                <SelectItem value="friend">好友</SelectItem>
                                <SelectItem value="private">私有</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            取消
                        </Button>
                        <Button type="submit" className="flex-1">
                            保存
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}