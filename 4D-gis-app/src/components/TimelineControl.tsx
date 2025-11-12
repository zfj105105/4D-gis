import {useCallback, useEffect, useState} from 'react';
import {Button} from './ui/button';
import {Slider} from './ui/slider';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Calendar, Filter, Pause, Play, SkipBack, SkipForward} from 'lucide-react';
import {Badge} from './ui/badge';
import {Popover, PopoverContent, PopoverTrigger} from './ui/popover';

interface TimelineControlProps {
    currentTime: Date;
    onTimeChange: (time: Date) => void;
    granularity: 'year' | 'month' | 'day' | 'hour';
    onGranularityChange: (granularity: 'year' | 'month' | 'day' | 'hour') => void;
    isPlaying: boolean;
    onPlayingChange: (playing: boolean) => void;
    playbackSpeed: number;
    onSpeedChange: (speed: number) => void;
    markers?: Array<{time_start: Date; time_end?: Date}>;
}

export function TimelineControl({
                                    currentTime,
                                    onTimeChange,
                                    granularity,
                                    onGranularityChange,
                                    isPlaying,
                                    onPlayingChange,
                                    playbackSpeed,
                                    onSpeedChange,
                                    markers = [],
                                }: TimelineControlProps) {
    const compareTimeByGranularity = (time1: Date, time2: Date, granularity: string): number => {
        const getTimeForComparison = (date: Date) => {
            switch (granularity) {
                case 'year':
                    return date.getFullYear();
                case 'month':
                    return date.getFullYear() * 100 + date.getMonth();
                case 'day':
                    return Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
                case 'hour':
                    return Math.floor(date.getTime() / (1000 * 60 * 60));
                default:
                    return date.getTime();
            }
        };

        const value1 = getTimeForComparison(time1);
        const value2 = getTimeForComparison(time2);

        if (value1 < value2) return -1;
        if (value1 > value2) return 1;
        return 0;
    };

// 检查标记是否在当前时间范围内
    const isMarkerActive = (marker: {time_start: Date; time_end?: Date}, currentTime: Date): boolean => {
        const startComparison = compareTimeByGranularity(marker.time_start, currentTime, granularity);

        // 如果没有结束时间，只要当前时间大于等于开始时间就显示
        if (!marker.time_end) {
            return startComparison <= 0;
        }

        const endComparison = compareTimeByGranularity(marker.time_end, currentTime, granularity);

        // 有结束时间的情况：开始时间 <= 当前时间 <= 结束时间
        return startComparison <= 0 && endComparison >= 0;
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

    // 计算当前时间在滑块上的位置
    const getCurrentSliderValue = () => {
        const totalMs = maxDate.getTime() - minDate.getTime();
        const currentMs = currentTime.getTime() - minDate.getTime();
        return Math.max(0, Math.min(100, (currentMs / totalMs) * 100));
    };

    const [timeRange, setTimeRange] = useState([getCurrentSliderValue()]);

    // 当 currentTime 改变时更新滑块位置
    useEffect(() => {
        setTimeRange([getCurrentSliderValue()]);
    }, [currentTime, minDate, maxDate]);

    const getTimeIncrement = useCallback(() => {
        return {
            hour: 1000 * 60 * 60,
            day: 1000 * 60 * 60 * 24,
            month: 1000 * 60 * 60 * 24 * 30,
            year: 1000 * 60 * 60 * 24 * 365,
        }[granularity];
    }, [granularity]);

    const stepForward = useCallback(() => {
        let newTime: Date;
        if (granularity === 'month') {
            newTime = new Date(currentTime);
            newTime.setMonth(newTime.getMonth() + 1);
        } else if (granularity === 'year') {
            newTime = new Date(currentTime);
            newTime.setFullYear(newTime.getFullYear() + 1);
        } else {
            const increment = getTimeIncrement();
            newTime = new Date(currentTime.getTime() + increment);
        }

        if (newTime <= maxDate) {
            onTimeChange(newTime);
        } else {
            onPlayingChange(false);
        }
    }, [currentTime, granularity, getTimeIncrement, maxDate, onTimeChange, onPlayingChange]);

    const stepBackward = useCallback(() => {
        let newTime: Date;
        if (granularity === 'month') {
            newTime = new Date(currentTime);
            newTime.setMonth(newTime.getMonth() - 1);
        } else if (granularity === 'year') {
            newTime = new Date(currentTime);
            newTime.setFullYear(newTime.getFullYear() - 1);
        } else {
            const decrement = getTimeIncrement();
            newTime = new Date(currentTime.getTime() - decrement);
        }
        if (newTime >= minDate) {
            onTimeChange(newTime);
        }
    }, [currentTime, granularity, getTimeIncrement, minDate, onTimeChange]);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            // 直接在这里实现时间递增逻辑，避免依赖 stepForward
            let newTime: Date;
            if (granularity === 'month') {
                newTime = new Date(currentTime);
                newTime.setMonth(newTime.getMonth() + 1);
            } else if (granularity === 'year') {
                newTime = new Date(currentTime);
                newTime.setFullYear(newTime.getFullYear() + 1);
            } else {
                const increment = {
                    hour: 1000 * 60 * 60,
                    day: 1000 * 60 * 60 * 24,
                }[granularity];
                newTime = new Date(currentTime.getTime() + increment);
            }

            if (newTime <= maxDate) {
                onTimeChange(newTime);
            } else {
                onPlayingChange(false);
            }
        }, 1000 / playbackSpeed);

        return () => clearInterval(interval);
    }, [isPlaying, playbackSpeed, currentTime]);

    const handleTimeSliderChange = (value: number[]) => {
        const percentage = value[0];
        const totalMs = maxDate.getTime() - minDate.getTime();
        const targetMs = minDate.getTime() + (totalMs * percentage / 100);
        const newDate = new Date(targetMs);

        setTimeRange(value);
        onTimeChange(newDate);
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
        const targetTime = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // 确保目标时间在范围内
        if (targetTime >= minDate && targetTime <= maxDate) {
            onTimeChange(targetTime);
        } else if (targetTime < minDate) {
            onTimeChange(minDate);
        } else {
            onTimeChange(maxDate);
        }
    };

    return (
        <div className="p-4 space-y-3">
            {/* Timeline slider */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                        <span className="text-sm font-medium">{formatDate(currentTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                            {granularity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {markers.filter(marker => isMarkerActive(marker, currentTime)).length} 个标记
                        </Badge>
                    </div>
                </div>

                <Slider
                    value={timeRange}
                    onValueChange={handleTimeSliderChange}
                    max={100}
                    step={0.1}
                    className="w-full"
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
                        onClick={stepBackward}
                        disabled={currentTime <= minDate}
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
                        onClick={stepForward}
                        disabled={currentTime >= maxDate}
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
                                    onClick={() => onTimeChange(minDate)}
                                >
                                    最早时间
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => onTimeChange(maxDate)}
                                >
                                    最晚时间
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
