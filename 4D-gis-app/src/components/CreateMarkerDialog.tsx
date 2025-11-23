import React, {useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from './ui/dialog';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Textarea} from './ui/textarea';
import {Label} from './ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Separator} from './ui/separator';
import {ScrollArea} from './ui/scroll-area';
import {useQuery} from '@tanstack/react-query';
import {fetchMarkerTypesWithFallback} from '../api/markerTypes';
import {Clock, Eye, FileText, MapPin, Plus, Tag, Type, X} from 'lucide-react';
import {Visibility} from "../api/marker";

interface CreateMarkerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateMarker: (markerData: any) => void;
    position?: [number, number, number?] | null;
}

const VISIBILITY_OPTIONS = [
    { value: Visibility.Private, label: '仅自己可见', color: 'bg-red-500' },
    { value: Visibility.Friend, label: '好友可见', color: 'bg-yellow-500' },
    { value: Visibility.Public, label: '公开可见', color: 'bg-green-500' }
] as const;

const FormItem = ({icon, label, children}: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-1">{icon}</div>
        <div className="flex-1 space-y-2">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            {children}
        </div>
    </div>
);

export function CreateMarkerDialog({
                                       open,
                                       onOpenChange,
                                       onCreateMarker,
                                       position
                                   }: CreateMarkerDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [typeId, setTypeId] = useState('');
    const [visibility, setVisibility] = useState<Visibility>(Visibility.Private);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // 获取标记类型数据 - 使用带备用方案的版本
    const { data: markerTypes = [], isLoading: isLoadingTypes } = useQuery({
        queryKey: ['markerTypes'],
        queryFn: fetchMarkerTypesWithFallback,
        staleTime: 5 * 60 * 1000, // 5分钟内使用缓存
        retry: 1, // 只重试一次，快速失败并使用本地数据
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 验证类别是否已选择
        if (!typeId) {
            alert('请选择标记类别');
            return;
        }

        // 验证结束时间是否晚于开始时间
        if (endTime && startTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            if (end <= start) {
                alert('结束时间必须晚于开始时间');
                return;
            }
        }

        const markerData = {
            title,
            description,
            typeId,
            visibility,
            latitude: position?.[0] || 0,
            longitude: position?.[1] || 0,
            altitude: position?.[2] || undefined,
            time_start: new Date(startTime),
            time_end: endTime ? new Date(endTime) : undefined,
        };

        onCreateMarker(markerData);

        // 重置表单
        setTitle('');
        setDescription('');
        setTypeId('');
        setVisibility(Visibility.Private);
        setStartTime('');
        setEndTime('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] p-0 gap-0 flex flex-col">
                {/* 头部 */}
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle>创建新标记</DialogTitle>
                </DialogHeader>

                <Separator/>

                {/* 表单滚动区 */}
                <ScrollArea className="flex-1 px-6 py-4">
                    <form id="create-marker-form" onSubmit={handleSubmit} className="space-y-4">
                        {/* 标题 */}
                        <FormItem icon={<Type className="h-4 w-4"/>} label="标题">
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="输入标记标题"
                                required
                            />
                        </FormItem>

                        {/* 描述 */}
                        <FormItem icon={<FileText className="h-4 w-4"/>} label="描述">
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="输入标记描述"
                                rows={3}
                            />
                        </FormItem>

                        {/* 类别 */}
                        <FormItem icon={<Tag className="h-4 w-4"/>} label="类别">
                            <Select value={typeId} onValueChange={setTypeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingTypes ? "加载中..." : "选择类别"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {markerTypes.map((type) => (
                                        <SelectItem key={type.typeId} value={type.typeId || ''}>
                                            <div className="flex items-center gap-2">
                                                {type.color && (
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: type.color }}
                                                    />
                                                )}
                                                <span>{type.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>

                        {/* 可见性 */}
                        <FormItem icon={<Eye className="h-4 w-4"/>} label="可见性">
                            <Select value={visibility} onValueChange={(value: Visibility) => setVisibility(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {VISIBILITY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${option.color}`} />
                                                <span>{option.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>

                        {/* 时间范围 */}
                        <FormItem icon={<Clock className="h-4 w-4"/>} label="时间范围">
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">开始时间</Label>
                                    <Input
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">结束时间（可选）</Label>
                                    <Input
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </FormItem>

                        {/* 位置信息 */}
                        {position && (
                            <FormItem icon={<MapPin className="h-4 w-4"/>} label="位置坐标">
                                <p className="text-sm">
                                    纬度: {position[0].toFixed(6)}, 经度: {position[1].toFixed(6)}
                                    {position[2] !== undefined && position[2] !== null && position[2] !== 0.00 && (
                                        <span>, 高度: {position[2].toFixed(2)} 米</span>
                                    )}
                                </p>
                            </FormItem>
                        )}
                    </form>
                </ScrollArea>

                <Separator/>

                {/* 底部操作按钮 */}
                <div className="flex items-center gap-2 p-6 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1"
                    >
                        <X className="h-4 w-4 mr-2"/>
                        取消
                    </Button>
                    <Button
                        type="submit"
                        form="create-marker-form"
                        disabled={isLoadingTypes || !typeId}
                        className="flex-1"
                    >
                        <Plus className="h-4 w-4 mr-2"/>
                        创建标记
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
