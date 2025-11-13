import {useCallback, useEffect, useState} from 'react';
import {Button} from './ui/button';
import {Slider} from './ui/slider';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Calendar, Filter, Pause, Play, SkipBack, SkipForward} from 'lucide-react';
import {Badge} from './ui/badge';
import {Popover, PopoverContent, PopoverTrigger} from './ui/popover';

interface TimelineControlProps {
    timeRange: [Date, Date]; // 改为时间范围
    onTimeRangeChange: (range: [Date, Date]) => void; // 改为范围变化回调
    granularity: 'year' | 'month' | 'day' | 'hour';
    onGranularityChange: (granularity: 'year' | 'month' | 'day' | 'hour') => void;
    isPlaying: boolean;
    onPlayingChange: (playing: boolean) => void;
    playbackSpeed: number;
    onSpeedChange: (speed: number) => void;
    markers?: Array<{time_start: Date; time_end?: Date}>;
}

export function TimelineControl({
                                    timeRange,
                                    onTimeRangeChange,
                                    granularity,
                                    onGranularityChange,
                                    isPlaying,
                                    onPlayingChange,
                                    playbackSpeed,
                                    onSpeedChange,
                                    markers = [],
                                }: TimelineControlProps) {

    // 检查标记是否与选定时间范围重合
    const isMarkerOverlapping = (marker: {time_start: Date; time_end?: Date}, selectedRange: [Date, Date]): boolean => {
        const [rangeStart, rangeEnd] = selectedRange;
        const markerStart = marker.time_start;
        const markerEnd = marker.time_end || marker.time_start; // 如果没有结束时间，使用开始时间

        // 检查两个时间区间是否重合：markerStart <= rangeEnd && markerEnd >= rangeStart
        return markerStart <= rangeEnd && markerEnd >= rangeStart;
    };

    const getTimeRange = () => {
        if (markers.length === 0) {
            return {
                min: new Date('2024-09-01'),
                max: new Date('2024-11-30')
            };
        }

        const times = markers.flatMap(marker => {
            const times = [marker.time_start];
            if (marker.time_end) times.push(marker.time_end);
            return times;
        });

        return {
            min: new Date(Math.min(...times.map(t => t.getTime()))),
            max: new Date(Math.max(...times.map(t => t.getTime())))
        };
    };

    const {min: minDate, max: maxDate} = getTimeRange();

    // 将时间转换为滑块值 (0-100)
    const timeToSliderValue = (time: Date) => {
        const totalMs = maxDate.getTime() - minDate.getTime();
        const currentMs = time.getTime() - minDate.getTime();
        return Math.max(0, Math.min(100, (currentMs / totalMs) * 100));
    };

    // 将滑块值转换为时间
    const sliderValueToTime = (value: number) => {
        const totalMs = maxDate.getTime() - minDate.getTime();
        const targetMs = minDate.getTime() + (totalMs * value / 100);
        return new Date(targetMs);
    };

    const [sliderRange, setSliderRange] = useState([
        timeToSliderValue(timeRange[0]),
        timeToSliderValue(timeRange[1])
    ]);

    // 当外部时间范围改变时更新滑块位置
    useEffect(() => {
        setSliderRange([
            timeToSliderValue(timeRange[0]),
            timeToSliderValue(timeRange[1])
        ]);
    }, [timeRange, minDate, maxDate]);

    const getTimeIncrement = useCallback(() => {
        return {
            hour: 1000 * 60 * 60,
            day: 1000 * 60 * 60 * 24,
            month: 1000 * 60 * 60 * 24 * 30,
            year: 1000 * 60 * 60 * 24 * 365,
        }[granularity];
    }, [granularity]);

    const moveRangeForward = useCallback(() => {
        const [startTime, endTime] = timeRange;
        const duration = endTime.getTime() - startTime.getTime();

        let newStartTime: Date;
        if (granularity === 'month') {
            newStartTime = new Date(startTime);
            newStartTime.setMonth(newStartTime.getMonth() + 1);
        } else if (granularity === 'year') {
            newStartTime = new Date(startTime);
            newStartTime.setFullYear(newStartTime.getFullYear() + 1);
        } else {
            const increment = getTimeIncrement();
            newStartTime = new Date(startTime.getTime() + increment);
        }

        const newEndTime = new Date(newStartTime.getTime() + duration);

        if (newEndTime <= maxDate) {
            onTimeRangeChange([newStartTime, newEndTime]);
        } else {
            onPlayingChange(false);
        }
    }, [timeRange, granularity, getTimeIncrement, maxDate, onTimeRangeChange, onPlayingChange]);

    const moveRangeBackward = useCallback(() => {
        const [startTime, endTime] = timeRange;
        const duration = endTime.getTime() - startTime.getTime();

        let newStartTime: Date;
        if (granularity === 'month') {
            newStartTime = new Date(startTime);
            newStartTime.setMonth(newStartTime.getMonth() - 1);
        } else if (granularity === 'year') {
            newStartTime = new Date(startTime);
            newStartTime.setFullYear(newStartTime.getFullYear() - 1);
        } else {
            const decrement = getTimeIncrement();
            newStartTime = new Date(startTime.getTime() - decrement);
        }

        const newEndTime = new Date(newStartTime.getTime() + duration);

        if (newStartTime >= minDate) {
            onTimeRangeChange([newStartTime, newEndTime]);
        }
    }, [timeRange, granularity, getTimeIncrement, minDate, onTimeRangeChange]);

    // 播放功能：移动时间范围
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            const [startTime, endTime] = timeRange;
            const duration = endTime.getTime() - startTime.getTime();

            let newStartTime: Date;
            if (granularity === 'month') {
                newStartTime = new Date(startTime);
                newStartTime.setMonth(newStartTime.getMonth() + 1);
            } else if (granularity === 'year') {
                newStartTime = new Date(startTime);
                newStartTime.setFullYear(newStartTime.getFullYear() + 1);
            } else {
                const increment = {
                    hour: 1000 * 60 * 60,
                    day: 1000 * 60 * 60 * 24,
                }[granularity];
                newStartTime = new Date(startTime.getTime() + increment);
            }

            const newEndTime = new Date(newStartTime.getTime() + duration);

            if (newEndTime <= maxDate) {
                onTimeRangeChange([newStartTime, newEndTime]);
            } else {
                onPlayingChange(false);
            }
        }, 1000 / playbackSpeed);

        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, timeRange]);

    const handleTimeSliderChange = (values: number[]) => {
        const [startValue, endValue] = values.sort((a, b) => a - b); // 确保开始时间小于结束时间
        const newStartTime = sliderValueToTime(startValue);
        const newEndTime = sliderValueToTime(endValue);

        setSliderRange([startValue, endValue]);
        onTimeRangeChange([newStartTime, newEndTime]);
    };

    const formatDate = (date: Date) => {
        switch (granularity) {
            case 'hour':
                return date.toLocaleString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            case 'day':
                return date.toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            case 'month':
                return date.toLocaleDateString('zh-CN', {
                    month: 'long',
                    year: 'numeric'
                });
            case 'year':
                return date.getFullYear().toString();
            default:
                return date.toLocaleDateString('zh-CN');
        }
    };

    const jumpToTimeRange = (days: number) => {
        const now = new Date();
        const startTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const endTime = now;

        // 确保时间范围在数据范围内
        const clampedStart = startTime < minDate ? minDate : startTime;
        const clampedEnd = endTime > maxDate ? maxDate : endTime;

        onTimeRangeChange([clampedStart, clampedEnd]);
    };

    // 计算与当前时间范围重合的标记数量
    const overlappingMarkersCount = markers.filter(marker => isMarkerOverlapping(marker, timeRange)).length;

    return (
        <div className="p-4 space-y-3">
            {/* Timeline slider */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm font-medium">
                            {formatDate(timeRange[0])} - {formatDate(timeRange[1])}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                            {granularity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {overlappingMarkersCount} 个标记
                        </Badge>
                    </div>
                </div>

                <Slider
                    value={sliderRange}
                    onValueChange={handleTimeSliderChange}
                    max={100}
                    step={0.1}
                    className="w-full"
                    minStepsBetweenThumbs={1}
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(minDate)}</span>
                    <span>{formatDate(maxDate)}</span>
                </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 flex-1">
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9"
                        onClick={moveRangeBackward}
                        disabled={timeRange[0] <= minDate}
                    >
                        <SkipBack className="h-4 w-4"/>
                    </Button>

                    <Button
                        size="icon"
                        variant="default"
                        className="h-9 w-9"
                        onClick={() => onPlayingChange(!isPlaying)}
                    >
                        {isPlaying ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
                    </Button>

                    <Button
                        size="icon"
                        variant="outline"
                        className="h-9 w-9"
                        onClick={moveRangeForward}
                        disabled={timeRange[1] >= maxDate}
                    >
                        <SkipForward className="h-4 w-4"/>
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-2">
                                {playbackSpeed}x
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40" align="start">
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">播放速度</p>
                                {[0.25, 0.5, 1, 2, 5, 10].map(speed => (
                                    <Button
                                        key={speed}
                                        variant={playbackSpeed === speed ? 'default' : 'ghost'}
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => onSpeedChange(speed)}
                                    >
                                        {speed}x
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <Select value={granularity} onValueChange={(value: any) => onGranularityChange(value)}>
                    <SelectTrigger className="w-[110px] h-9">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hour">小时</SelectItem>
                        <SelectItem value="day">天</SelectItem>
                        <SelectItem value="month">月</SelectItem>
                        <SelectItem value="year">年</SelectItem>
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                            <Filter className="h-4 w-4"/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60" align="end">
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium">快速跳转</h4>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => jumpToTimeRange(7)}
                                >
                                    最近 7 天
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => jumpToTimeRange(30)}
                                >
                                    最近 30 天
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => onTimeRangeChange([minDate, maxDate])}
                                >
                                    全部时间
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
